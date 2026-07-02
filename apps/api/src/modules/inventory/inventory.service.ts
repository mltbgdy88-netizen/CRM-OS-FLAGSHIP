import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  createCriticalStockReachedEvent,
  createStockChangedEvent,
  createStockReleasedEvent,
  createStockReservedEvent,
} from '@crm-os/events';
import type { RequestTenantContext } from '../../common/tenant/tenant-context.types';
import { IamRepository } from '../iam/repositories/iam.repository';
import { DomainEventPublisher } from '../iam/services/audit.service';
import type { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import type { ListStocksQueryDto } from './dto/list-stocks-query.dto';
import type { ListStockReservationsQueryDto, ReserveStockDto } from './dto/reserve-stock.dto';
import {
  mapInventoryOverview,
  mapStockMovement,
  mapStockReservation,
  mapStockSummary,
} from './inventory.mapper';
import { InventoryRepository } from './inventory.repository';

function toNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) {
    return 0;
  }
  return Number(value);
}

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly iamRepository: IamRepository,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async getOverview(context: RequestTenantContext) {
    const [stocks, warehouses, recentMovements] = await Promise.all([
      this.inventoryRepository.listAllStocks(context),
      this.inventoryRepository.listWarehouses(context),
      this.inventoryRepository.listRecentMovements(context, 5),
    ]);

    let totalOnHand = 0;
    let totalReserved = 0;
    let totalAvailable = 0;
    let criticalCount = 0;

    const warehouseStats = new Map<string, { stockCount: number; onHandTotal: number }>();

    for (const stock of stocks) {
      const onHand = toNumber(stock.quantityOnHand);
      const reserved = toNumber(stock.quantityReserved);
      const available = toNumber(stock.quantityAvailable);
      const criticalLevel =
        stock.criticalLevel != null ? toNumber(stock.criticalLevel) : null;

      totalOnHand += onHand;
      totalReserved += reserved;
      totalAvailable += available;

      if (criticalLevel != null && available <= criticalLevel) {
        criticalCount += 1;
      }

      const existing = warehouseStats.get(stock.warehouseId) ?? {
        stockCount: 0,
        onHandTotal: 0,
      };
      existing.stockCount += 1;
      existing.onHandTotal += onHand;
      warehouseStats.set(stock.warehouseId, existing);
    }

    return mapInventoryOverview({
      totalSkus: stocks.length,
      totalOnHand,
      totalReserved,
      totalAvailable,
      criticalCount,
      warehouses: warehouses.map((warehouse) => {
        const stats = warehouseStats.get(warehouse.id) ?? { stockCount: 0, onHandTotal: 0 };
        return {
          id: warehouse.id,
          name: warehouse.name,
          code: warehouse.code,
          stockCount: stats.stockCount,
          onHandTotal: stats.onHandTotal,
        };
      }),
      recentMovements: recentMovements.map(mapStockMovement),
    });
  }

  async listStocks(context: RequestTenantContext, query: ListStocksQueryDto) {
    const skip = (query.page - 1) * query.pageSize;
    const [total, stocks] = await Promise.all([
      this.inventoryRepository.countStocks(context, query.warehouseId),
      this.inventoryRepository.listStocks(context, {
        skip,
        take: query.pageSize,
        warehouseId: query.warehouseId,
      }),
    ]);

    return {
      items: stocks.map(mapStockSummary),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async createStockMovement(context: RequestTenantContext, dto: CreateStockMovementDto) {
    const warehouse = await this.inventoryRepository.findWarehouseById(context, dto.warehouseId);
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    const variant = await this.inventoryRepository.findProductVariantById(
      context,
      dto.productVariantId,
    );
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    let stock = await this.inventoryRepository.findStockByWarehouseAndVariant(
      context,
      dto.warehouseId,
      dto.productVariantId,
    );

    const currentOnHand = stock ? toNumber(stock.quantityOnHand) : 0;
    const currentReserved = stock ? toNumber(stock.quantityReserved) : 0;
    let nextOnHand = currentOnHand;

    if (dto.movementType === 'in') {
      nextOnHand = currentOnHand + dto.quantity;
    } else if (dto.movementType === 'out') {
      nextOnHand = currentOnHand - dto.quantity;
      if (nextOnHand < 0) {
        throw new BadRequestException('Insufficient stock for outbound movement');
      }
    } else {
      nextOnHand = dto.quantity;
      if (nextOnHand < 0) {
        throw new BadRequestException('Adjusted quantity cannot be negative');
      }
    }

    const nextAvailable = nextOnHand - currentReserved;
    if (nextAvailable < 0) {
      throw new BadRequestException('Available quantity cannot be negative after movement');
    }

    if (!stock) {
      if (dto.movementType === 'out') {
        throw new BadRequestException('No stock record exists for outbound movement');
      }

      stock = await this.inventoryRepository.createStockRecord(context, {
        warehouseId: dto.warehouseId,
        productVariantId: dto.productVariantId,
        quantityOnHand: nextOnHand,
        quantityAvailable: nextAvailable,
      });
    }

    const movement = await this.inventoryRepository.createStockMovement(context, dto, {
      stockId: stock.id,
      quantityOnHand: nextOnHand,
      quantityAvailable: nextAvailable,
    });

    await this.iamRepository.writeAuditLog(context, {
      action: 'stock.movement.created',
      entityType: 'stock_movement',
      entityId: movement.id,
      payload: {
        movementType: dto.movementType,
        quantity: dto.quantity,
        warehouseId: dto.warehouseId,
        productVariantId: dto.productVariantId,
      },
    });

    this.eventPublisher.publish(
      createStockChangedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        stockId: stock.id,
        warehouseId: dto.warehouseId,
        productVariantId: dto.productVariantId,
        movementType: dto.movementType,
        quantityOnHand: nextOnHand,
        quantityAvailable: nextAvailable,
      }),
    );

    const updatedStock = await this.inventoryRepository.getStockById(context, stock.id);
    const criticalLevel =
      updatedStock?.criticalLevel != null ? toNumber(updatedStock.criticalLevel) : null;

    if (criticalLevel != null && nextAvailable <= criticalLevel) {
      this.eventPublisher.publish(
        createCriticalStockReachedEvent({
          tenantId: context.tenantId,
          actorId: context.userId,
          stockId: stock.id,
          warehouseId: dto.warehouseId,
          productVariantId: dto.productVariantId,
          quantityAvailable: nextAvailable,
          criticalLevel,
        }),
      );
    }

    return mapStockMovement(movement);
  }

  async listStockReservations(
    context: RequestTenantContext,
    query: ListStockReservationsQueryDto,
  ) {
    const skip = (query.page - 1) * query.pageSize;
    const [total, reservations] = await Promise.all([
      this.inventoryRepository.countStockReservations(context),
      this.inventoryRepository.listStockReservations(context, {
        skip,
        take: query.pageSize,
      }),
    ]);

    return {
      items: reservations.map(mapStockReservation),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async reserveStockForOrder(
    context: RequestTenantContext,
    orderId: string,
    dto: ReserveStockDto,
  ) {
    const order = await this.inventoryRepository.findOrderById(context, orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    for (const item of dto.items) {
      const warehouse = await this.inventoryRepository.findWarehouseById(
        context,
        item.warehouseId,
      );
      if (!warehouse) {
        throw new NotFoundException('Warehouse not found');
      }

      const variant = await this.inventoryRepository.findProductVariantById(
        context,
        item.productVariantId,
      );
      if (!variant) {
        throw new NotFoundException('Product variant not found');
      }
    }

    let result;
    try {
      result = await this.inventoryRepository.createOrderReservation(context, {
        orderId,
        notes: dto.notes,
        items: dto.items,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'STOCK_NOT_FOUND') {
          throw new NotFoundException('Stock record not found for reservation');
        }
        if (error.message === 'INSUFFICIENT_STOCK') {
          throw new BadRequestException('Insufficient available stock for reservation');
        }
      }
      throw error;
    }

    await this.iamRepository.writeAuditLog(context, {
      action: 'stock.reservation.created',
      entityType: 'order_reservation',
      entityId: result.orderReservation.id,
      payload: {
        orderId,
        itemCount: dto.items.length,
      },
    });

    for (const reservation of result.stockReservations) {
      this.eventPublisher.publish(
        createStockReservedEvent({
          tenantId: context.tenantId,
          actorId: context.userId,
          stockReservationId: reservation.id,
          orderId,
          stockId: reservation.stockId,
          quantity: toNumber(reservation.quantity),
        }),
      );
    }

    return {
      orderReservationId: result.orderReservation.id,
      orderId,
      status: result.orderReservation.status,
      reservations: result.stockReservations.map(mapStockReservation),
    };
  }

  async releaseStockReservation(context: RequestTenantContext, id: string) {
    let released;
    try {
      released = await this.inventoryRepository.releaseStockReservation(context, id);
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_RESERVATION') {
        throw new BadRequestException('Invalid reservation state for release');
      }
      throw error;
    }

    if (!released) {
      throw new NotFoundException('Stock reservation not found');
    }

    await this.iamRepository.writeAuditLog(context, {
      action: 'stock.reservation.released',
      entityType: 'stock_reservation',
      entityId: released.id,
      payload: {
        orderId: released.orderId,
        quantity: toNumber(released.quantity),
      },
    });

    this.eventPublisher.publish(
      createStockReleasedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        stockReservationId: released.id,
        orderId: released.orderId,
        stockId: released.stockId,
        quantity: toNumber(released.quantity),
      }),
    );

    return mapStockReservation(released);
  }
}
