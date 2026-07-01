import { Injectable } from '@nestjs/common';
import type { TenantContext } from '@crm-os/database';
import { withTenantContext } from '@crm-os/database';
import { PrismaService } from '../../database/prisma.service';
import type { CreateOrderItemDto } from './dto/create-order.dto';
import { calculateLineTotal, calculateOrderTotals } from './order.totals';

const orderSummaryInclude = {
  customer: true,
} as const;

const orderDetailInclude = {
  ...orderSummaryInclude,
  items: {
    where: { deletedAt: null },
    orderBy: { sortOrder: 'asc' as const },
  },
  statusHistory: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' as const },
  },
} as const;

export interface OrderChildInput {
  items: CreateOrderItemDto[];
}

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countOrders(context: TenantContext): Promise<number> {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.order.count({ where: { deletedAt: null } }),
    );
  }

  async listOrders(context: TenantContext, input: { skip: number; take: number }) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.order.findMany({
        where: { deletedAt: null },
        include: orderSummaryInclude,
        orderBy: { createdAt: 'desc' },
        skip: input.skip,
        take: input.take,
      }),
    );
  }

  async findOrderById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.order.findFirst({
        where: { id, deletedAt: null },
        include: orderSummaryInclude,
      }),
    );
  }

  async findOrderDetailById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.order.findFirst({
        where: { id, deletedAt: null },
        include: orderDetailInclude,
      }),
    );
  }

  async findCustomerById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.customer.findFirst({
        where: { id, deletedAt: null },
      }),
    );
  }

  async findQuoteById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.quote.findFirst({
        where: { id, deletedAt: null },
      }),
    );
  }

  async getNextOrderNumber(context: TenantContext): Promise<string> {
    return withTenantContext(this.prisma, context, async (tx) => {
      const year = new Date().getFullYear();
      const prefix = `ORD-${year}-`;
      const latest = await tx.order.findFirst({
        where: { number: { startsWith: prefix } },
        orderBy: { number: 'desc' },
        select: { number: true },
      });

      if (!latest) {
        return `${prefix}0001`;
      }

      const sequence = Number.parseInt(latest.number.slice(prefix.length), 10);
      const next = Number.isFinite(sequence) ? sequence + 1 : 1;
      return `${prefix}${String(next).padStart(4, '0')}`;
    });
  }

  async createOrder(
    context: TenantContext,
    input: {
      number: string;
      customerId: string;
      quoteId?: string | null;
      status?: string;
      currencyCode?: string;
      notes?: string;
      totals: ReturnType<typeof calculateOrderTotals>;
      children: OrderChildInput;
    },
  ) {
    const status = input.status ?? 'pending';

    return withTenantContext(this.prisma, context, async (tx) => {
      const order = await tx.order.create({
        data: {
          tenantId: context.tenantId,
          number: input.number,
          customerId: input.customerId,
          quoteId: input.quoteId ?? null,
          status,
          subtotal: input.totals.subtotal,
          taxTotal: input.totals.taxTotal,
          total: input.totals.total,
          currencyCode: input.currencyCode ?? 'TRY',
          notes: input.notes,
          createdBy: context.userId,
          items: {
            create: input.children.items.map((item, index) => ({
              tenantId: context.tenantId,
              name: item.name,
              description: item.description,
              quantity: item.quantity ?? 1,
              unitPrice: item.unitPrice,
              lineTotal: calculateLineTotal(item.quantity ?? 1, item.unitPrice),
              sortOrder: item.sortOrder ?? index + 1,
              createdBy: context.userId,
            })),
          },
          ...(status === 'confirmed'
            ? {
                statusHistory: {
                  create: {
                    tenantId: context.tenantId,
                    fromStatus: 'pending',
                    toStatus: 'confirmed',
                    reason: 'Order created as confirmed.',
                    createdBy: context.userId,
                  },
                },
              }
            : {}),
        },
        include: orderDetailInclude,
      });

      return order;
    });
  }
}
