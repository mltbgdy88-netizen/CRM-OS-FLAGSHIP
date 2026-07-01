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
}
