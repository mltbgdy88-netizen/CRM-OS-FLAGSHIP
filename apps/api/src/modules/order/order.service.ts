import { Injectable, NotFoundException } from '@nestjs/common';
import {
  createOrderConfirmedEvent,
  createOrderCreatedEvent,
} from '@crm-os/events';
import type { RequestTenantContext } from '../../common/tenant/tenant-context.types';
import { IamRepository } from '../iam/repositories/iam.repository';
import { DomainEventPublisher } from '../iam/services/audit.service';
import type { CreateOrderDto } from './dto/create-order.dto';
import type { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { mapOrderDetail, mapOrderSummary } from './order.mapper';
import { OrderRepository } from './order.repository';
import { calculateOrderTotals } from './order.totals';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly iamRepository: IamRepository,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async listOrders(context: RequestTenantContext, query: ListOrdersQueryDto) {
    const skip = (query.page - 1) * query.pageSize;
    const [total, orders] = await Promise.all([
      this.orderRepository.countOrders(context),
      this.orderRepository.listOrders(context, {
        skip,
        take: query.pageSize,
      }),
    ]);

    return {
      items: orders.map(mapOrderSummary),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async getOrderById(context: RequestTenantContext, id: string) {
    const order = await this.orderRepository.findOrderDetailById(context, id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return mapOrderDetail(order);
  }

  async createOrder(context: RequestTenantContext, dto: CreateOrderDto) {
    await this.assertCustomerExists(context, dto.customerId);

    if (dto.quoteId) {
      await this.assertQuoteExists(context, dto.quoteId);
    }

    const items = dto.items ?? [];
    const taxes = dto.taxes ?? [];
    const totals = calculateOrderTotals(items, taxes);
    const number = await this.orderRepository.getNextOrderNumber(context);
    const status = dto.status ?? 'pending';

    const order = await this.orderRepository.createOrder(context, {
      number,
      customerId: dto.customerId,
      quoteId: dto.quoteId,
      status,
      currencyCode: dto.currencyCode,
      notes: dto.notes,
      totals,
      children: { items },
    });

    await this.iamRepository.writeAuditLog(context, {
      action: 'order.created',
      entityType: 'order',
      entityId: order.id,
      payload: {
        number: order.number,
        customerId: order.customerId,
        total: order.total,
        status: order.status,
      },
    });

    this.eventPublisher.publish(
      createOrderCreatedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        orderId: order.id,
        number: order.number,
        customerId: order.customerId,
        total: Number(order.total),
      }),
    );

    if (status === 'confirmed') {
      this.eventPublisher.publish(
        createOrderConfirmedEvent({
          tenantId: context.tenantId,
          actorId: context.userId,
          orderId: order.id,
          number: order.number,
          total: Number(order.total),
        }),
      );
    }

    return mapOrderDetail(order);
  }

  private async assertCustomerExists(context: RequestTenantContext, customerId: string) {
    const customer = await this.orderRepository.findCustomerById(context, customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
  }

  private async assertQuoteExists(context: RequestTenantContext, quoteId: string) {
    const quote = await this.orderRepository.findQuoteById(context, quoteId);
    if (!quote) {
      throw new NotFoundException('Quote not found');
    }
  }
}
