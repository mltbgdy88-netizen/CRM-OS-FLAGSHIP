import { Injectable } from '@nestjs/common';
import type { TenantContext } from '@crm-os/database';
import { withTenantContext } from '@crm-os/database';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { CreateStockMovementDto } from './dto/create-stock-movement.dto';

const stockInclude = {
  warehouse: true,
  productVariant: {
    include: {
      product: true,
    },
  },
} as const;

const movementInclude = {
  warehouse: true,
  productVariant: {
    include: {
      product: true,
    },
  },
} as const;

const reservationInclude = {
  warehouse: true,
  productVariant: {
    include: {
      product: true,
    },
  },
  order: {
    select: {
      id: true,
      number: true,
    },
  },
} as const;

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countStocks(context: TenantContext, warehouseId?: string): Promise<number> {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.stock.count({
        where: {
          deletedAt: null,
          ...(warehouseId ? { warehouseId } : {}),
        },
      }),
    );
  }

  async listStocks(
    context: TenantContext,
    input: { skip: number; take: number; warehouseId?: string },
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.stock.findMany({
        where: {
          deletedAt: null,
          ...(input.warehouseId ? { warehouseId: input.warehouseId } : {}),
        },
        include: stockInclude,
        orderBy: [{ warehouse: { name: 'asc' } }, { productVariant: { sku: 'asc' } }],
        skip: input.skip,
        take: input.take,
      }),
    );
  }

  async listAllStocks(context: TenantContext) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.stock.findMany({
        where: { deletedAt: null },
        include: stockInclude,
      }),
    );
  }

  async listWarehouses(context: TenantContext) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.warehouse.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      }),
    );
  }

  async listRecentMovements(context: TenantContext, take: number) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.stockMovement.findMany({
        where: { deletedAt: null },
        include: movementInclude,
        orderBy: { movementAt: 'desc' },
        take,
      }),
    );
  }

  async findWarehouseById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.warehouse.findFirst({
        where: { id, deletedAt: null },
      }),
    );
  }

  async findProductVariantById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.productVariant.findFirst({
        where: { id, deletedAt: null },
      }),
    );
  }

  async findStockByWarehouseAndVariant(
    context: TenantContext,
    warehouseId: string,
    productVariantId: string,
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.stock.findFirst({
        where: {
          warehouseId,
          productVariantId,
          deletedAt: null,
        },
        include: stockInclude,
      }),
    );
  }

  async createStockMovement(
    context: TenantContext,
    dto: CreateStockMovementDto,
    input: {
      stockId: string;
      quantityOnHand: number;
      quantityAvailable: number;
    },
  ) {
    return withTenantContext(this.prisma, context, async (tx) => {
      await tx.stock.update({
        where: { id: input.stockId },
        data: {
          quantityOnHand: new Prisma.Decimal(input.quantityOnHand),
          quantityAvailable: new Prisma.Decimal(input.quantityAvailable),
          updatedBy: context.userId,
          updatedAt: new Date(),
          version: { increment: 1 },
        },
      });

      return tx.stockMovement.create({
        data: {
          tenantId: context.tenantId,
          warehouseId: dto.warehouseId,
          productVariantId: dto.productVariantId,
          stockId: input.stockId,
          movementType: dto.movementType,
          quantity: new Prisma.Decimal(dto.quantity),
          referenceType: dto.referenceType ?? null,
          referenceId: dto.referenceId ?? null,
          notes: dto.notes ?? null,
          createdBy: context.userId,
        },
        include: movementInclude,
      });
    });
  }

  async createStockRecord(
    context: TenantContext,
    input: {
      warehouseId: string;
      productVariantId: string;
      quantityOnHand: number;
      quantityAvailable: number;
    },
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.stock.create({
        data: {
          tenantId: context.tenantId,
          warehouseId: input.warehouseId,
          productVariantId: input.productVariantId,
          quantityOnHand: new Prisma.Decimal(input.quantityOnHand),
          quantityReserved: new Prisma.Decimal(0),
          quantityAvailable: new Prisma.Decimal(input.quantityAvailable),
          createdBy: context.userId,
        },
        include: stockInclude,
      }),
    );
  }

  async getStockById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.stock.findFirst({
        where: { id, deletedAt: null },
        include: stockInclude,
      }),
    );
  }

  async findOrderById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.order.findFirst({
        where: { id, deletedAt: null },
      }),
    );
  }

  async countStockReservations(context: TenantContext): Promise<number> {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.stockReservation.count({
        where: { deletedAt: null },
      }),
    );
  }

  async listStockReservations(
    context: TenantContext,
    input: { skip: number; take: number },
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.stockReservation.findMany({
        where: { deletedAt: null },
        include: reservationInclude,
        orderBy: { createdAt: 'desc' },
        skip: input.skip,
        take: input.take,
      }),
    );
  }

  async findStockReservationById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.stockReservation.findFirst({
        where: { id, deletedAt: null },
        include: reservationInclude,
      }),
    );
  }

  async createOrderReservation(
    context: TenantContext,
    input: {
      orderId: string;
      notes?: string;
      items: Array<{
        warehouseId: string;
        productVariantId: string;
        quantity: number;
      }>;
    },
  ) {
    return withTenantContext(this.prisma, context, async (tx) => {
      const orderReservation = await tx.orderReservation.create({
        data: {
          tenantId: context.tenantId,
          orderId: input.orderId,
          notes: input.notes ?? null,
          createdBy: context.userId,
        },
      });

      const stockReservations = [];

      for (const item of input.items) {
        const stock = await tx.stock.findFirst({
          where: {
            warehouseId: item.warehouseId,
            productVariantId: item.productVariantId,
            deletedAt: null,
          },
        });

        if (!stock) {
          throw new Error('STOCK_NOT_FOUND');
        }

        const currentReserved = Number(stock.quantityReserved);
        const currentAvailable = Number(stock.quantityAvailable);
        const nextReserved = currentReserved + item.quantity;
        const nextAvailable = currentAvailable - item.quantity;

        if (nextAvailable < 0) {
          throw new Error('INSUFFICIENT_STOCK');
        }

        await tx.stock.update({
          where: { id: stock.id },
          data: {
            quantityReserved: new Prisma.Decimal(nextReserved),
            quantityAvailable: new Prisma.Decimal(nextAvailable),
            updatedBy: context.userId,
            updatedAt: new Date(),
            version: { increment: 1 },
          },
        });

        const stockReservation = await tx.stockReservation.create({
          data: {
            tenantId: context.tenantId,
            orderId: input.orderId,
            orderReservationId: orderReservation.id,
            stockId: stock.id,
            warehouseId: item.warehouseId,
            productVariantId: item.productVariantId,
            quantity: new Prisma.Decimal(item.quantity),
            createdBy: context.userId,
          },
          include: reservationInclude,
        });

        await tx.stockMovement.create({
          data: {
            tenantId: context.tenantId,
            warehouseId: item.warehouseId,
            productVariantId: item.productVariantId,
            stockId: stock.id,
            movementType: 'reserve',
            quantity: new Prisma.Decimal(item.quantity),
            referenceType: 'order',
            referenceId: input.orderId,
            notes: input.notes ?? null,
            createdBy: context.userId,
          },
        });

        stockReservations.push(stockReservation);
      }

      return { orderReservation, stockReservations };
    });
  }

  async releaseStockReservation(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) => {
      const reservation = await tx.stockReservation.findFirst({
        where: { id, deletedAt: null, status: 'active' },
        include: reservationInclude,
      });

      if (!reservation) {
        return null;
      }

      const stock = await tx.stock.findFirst({
        where: { id: reservation.stockId, deletedAt: null },
      });

      if (!stock) {
        throw new Error('STOCK_NOT_FOUND');
      }

      const quantity = Number(reservation.quantity);
      const nextReserved = Number(stock.quantityReserved) - quantity;
      const nextAvailable = Number(stock.quantityAvailable) + quantity;

      if (nextReserved < 0) {
        throw new Error('INVALID_RESERVATION');
      }

      await tx.stock.update({
        where: { id: stock.id },
        data: {
          quantityReserved: new Prisma.Decimal(nextReserved),
          quantityAvailable: new Prisma.Decimal(nextAvailable),
          updatedBy: context.userId,
          updatedAt: new Date(),
          version: { increment: 1 },
        },
      });

      const released = await tx.stockReservation.update({
        where: { id: reservation.id },
        data: {
          status: 'released',
          releasedAt: new Date(),
          updatedBy: context.userId,
          updatedAt: new Date(),
          version: { increment: 1 },
        },
        include: reservationInclude,
      });

      await tx.stockMovement.create({
        data: {
          tenantId: context.tenantId,
          warehouseId: reservation.warehouseId,
          productVariantId: reservation.productVariantId,
          stockId: reservation.stockId,
          movementType: 'release',
          quantity: reservation.quantity,
          referenceType: 'order',
          referenceId: reservation.orderId,
          createdBy: context.userId,
        },
      });

      const activeRemaining = await tx.stockReservation.count({
        where: {
          orderReservationId: reservation.orderReservationId,
          status: 'active',
          deletedAt: null,
        },
      });

      if (activeRemaining === 0) {
        await tx.orderReservation.update({
          where: { id: reservation.orderReservationId },
          data: {
            status: 'released',
            releasedAt: new Date(),
            updatedBy: context.userId,
            updatedAt: new Date(),
            version: { increment: 1 },
          },
        });
      }

      return released;
    });
  }
}
