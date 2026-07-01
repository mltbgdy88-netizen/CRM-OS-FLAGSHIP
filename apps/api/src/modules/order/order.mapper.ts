import type {
  Customer,
  Order,
  OrderDelivery,
  OrderItem,
  OrderNote,
  OrderShipment,
  OrderStatusHistory,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type {
  OrderDetailResponseDto,
  OrderSummaryResponseDto,
} from './dto/order-response.dto';

type OrderRecord = Order & {
  customer: Customer;
};

type OrderDetailRecord = OrderRecord & {
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  shipments: OrderShipment[];
  deliveries: OrderDelivery[];
  orderNotes: OrderNote[];
};

function decimalToNumber(value: Decimal | number): number {
  if (value instanceof Decimal) {
    return value.toNumber();
  }
  return value;
}

function mapCustomer(customer: Customer) {
  return {
    id: customer.id,
    displayName: customer.displayName,
  };
}

function mapOrderCore(order: OrderRecord): OrderSummaryResponseDto {
  return {
    id: order.id,
    number: order.number,
    customerId: order.customerId,
    quoteId: order.quoteId,
    status: order.status,
    subtotal: decimalToNumber(order.subtotal),
    taxTotal: decimalToNumber(order.taxTotal),
    total: decimalToNumber(order.total),
    currencyCode: order.currencyCode,
    notes: order.notes,
    customer: mapCustomer(order.customer),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt?.toISOString() ?? null,
    version: order.version,
  };
}

export function mapOrderSummary(order: OrderRecord): OrderSummaryResponseDto {
  return mapOrderCore(order);
}

export function mapOrderDetail(order: OrderDetailRecord): OrderDetailResponseDto {
  return {
    ...mapOrderCore(order),
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitPrice: decimalToNumber(item.unitPrice),
      lineTotal: decimalToNumber(item.lineTotal),
      sortOrder: item.sortOrder,
      createdAt: item.createdAt.toISOString(),
      version: item.version,
    })),
    statusHistory: order.statusHistory.map((entry) => ({
      id: entry.id,
      fromStatus: entry.fromStatus,
      toStatus: entry.toStatus,
      reason: entry.reason,
      createdAt: entry.createdAt.toISOString(),
      version: entry.version,
    })),
    shipments: order.shipments.map((shipment) => ({
      id: shipment.id,
      carrier: shipment.carrier,
      trackingNumber: shipment.trackingNumber,
      shippedAt: shipment.shippedAt.toISOString(),
      notes: shipment.notes,
      createdAt: shipment.createdAt.toISOString(),
      version: shipment.version,
    })),
    deliveries: order.deliveries.map((delivery) => ({
      id: delivery.id,
      deliveredAt: delivery.deliveredAt.toISOString(),
      recipientName: delivery.recipientName,
      notes: delivery.notes,
      createdAt: delivery.createdAt.toISOString(),
      version: delivery.version,
    })),
    notes: order.orderNotes.map((note) => ({
      id: note.id,
      body: note.body,
      createdAt: note.createdAt.toISOString(),
      version: note.version,
    })),
  };
}
