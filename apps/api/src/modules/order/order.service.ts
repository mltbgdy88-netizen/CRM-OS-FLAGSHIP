import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  createOrderCancelledEvent,
  createOrderConfirmedEvent,
  createOrderCreatedEvent,
  createOrderDeliveredEvent,
  createOrderShippedEvent,
} from '@crm-os/events';
import type { RequestTenantContext } from '../../common/tenant/tenant-context.types';
import { IamRepository } from '../iam/repositories/iam.repository';
import { DomainEventPublisher } from '../iam/services/audit.service';
import type { CancelOrderDto } from './dto/cancel-order.dto';
import type { CreateOrderDto } from './dto/create-order.dto';
import type { DeliverOrderDto } from './dto/deliver-order.dto';
import type { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import type { ShipOrderDto } from './dto/ship-order.dto';
import { mapOrderDetail, mapOrderSummary } from './order.mapper';
import { OrderRepository } from './order.repository';
import { calculateOrderTotals } from './order.totals';

const SHIPPABLE_ORDER_STATUSES = new Set(['confirmed']);
const DELIVERABLE_ORDER_STATUSES = new Set(['shipped']);
const CANCELLABLE_ORDER_STATUSES = new Set(['pending', 'confirmed']);

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

  async shipOrder(context: RequestTenantContext, id: string, dto: ShipOrderDto) {
    const existing = await this.orderRepository.findOrderById(context, id);
    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    if (!SHIPPABLE_ORDER_STATUSES.has(existing.status)) {
      throw new BadRequestException('Only confirmed orders can be shipped');
    }

    const order = await this.orderRepository.shipOrder(context, id, dto);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.iamRepository.writeAuditLog(context, {
      action: 'order.shipped',
      entityType: 'order',
      entityId: order.id,
      payload: {
        number: order.number,
        carrier: dto.carrier ?? null,
        trackingNumber: dto.trackingNumber ?? null,
      },
    });

    this.eventPublisher.publish(
      createOrderShippedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        orderId: order.id,
        number: order.number,
        trackingNumber: dto.trackingNumber,
      }),
    );

    return mapOrderDetail(order);
  }

  async deliverOrder(context: RequestTenantContext, id: string, dto: DeliverOrderDto) {
    const existing = await this.orderRepository.findOrderById(context, id);
    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    if (!DELIVERABLE_ORDER_STATUSES.has(existing.status)) {
      throw new BadRequestException('Only shipped orders can be delivered');
    }

    const order = await this.orderRepository.deliverOrder(context, id, dto);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.iamRepository.writeAuditLog(context, {
      action: 'order.delivered',
      entityType: 'order',
      entityId: order.id,
      payload: {
        number: order.number,
        recipientName: dto.recipientName ?? null,
      },
    });

    this.eventPublisher.publish(
      createOrderDeliveredEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        orderId: order.id,
        number: order.number,
        recipientName: dto.recipientName,
      }),
    );

    return mapOrderDetail(order);
  }

  async cancelOrder(context: RequestTenantContext, id: string, dto: CancelOrderDto) {
    const existing = await this.orderRepository.findOrderById(context, id);
    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    if (!CANCELLABLE_ORDER_STATUSES.has(existing.status)) {
      throw new BadRequestException('Only pending or confirmed orders can be cancelled');
    }

    const order = await this.orderRepository.cancelOrder(context, id, dto);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.iamRepository.writeAuditLog(context, {
      action: 'order.cancelled',
      entityType: 'order',
      entityId: order.id,
      payload: {
        number: order.number,
        reason: dto.reason ?? null,
      },
    });

    this.eventPublisher.publish(
      createOrderCancelledEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        orderId: order.id,
        number: order.number,
        reason: dto.reason,
      }),
    );

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
