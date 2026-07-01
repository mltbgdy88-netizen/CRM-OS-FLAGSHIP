import { authenticatedFetch, parseApiResponse } from './authenticated-fetch';

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'shipped' | 'delivered';

export interface OrderCustomerSummary {
  id: string;
  displayName: string;
}

export interface OrderListItem {
  id: string;
  number: string;
  customerId: string;
  quoteId: string | null;
  status: OrderStatus;
  subtotal: number;
  taxTotal: number;
  total: number;
  currencyCode: string;
  notes: string | null;
  customer: OrderCustomerSummary;
  createdAt: string;
  updatedAt: string | null;
  version: number;
}

export interface OrderListResult {
  items: OrderListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OrderItem {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  sortOrder: number;
  createdAt: string;
  version: number;
}

export interface OrderStatusHistoryEntry {
  id: string;
  fromStatus: string;
  toStatus: string;
  reason: string | null;
  createdAt: string;
  version: number;
}

export interface OrderDetail extends OrderListItem {
  items: OrderItem[];
  statusHistory: OrderStatusHistoryEntry[];
  shipments: OrderShipment[];
  deliveries: OrderDelivery[];
  orderNotes: OrderNote[];
}

export interface OrderShipment {
  id: string;
  carrier: string | null;
  trackingNumber: string | null;
  shippedAt: string;
  notes: string | null;
  createdAt: string;
  version: number;
}

export interface OrderDelivery {
  id: string;
  deliveredAt: string;
  recipientName: string | null;
  notes: string | null;
  createdAt: string;
  version: number;
}

export interface OrderNote {
  id: string;
  body: string;
  createdAt: string;
  version: number;
}

export interface CreateOrderItemInput {
  name: string;
  description?: string;
  quantity?: number;
  unitPrice: number;
  sortOrder?: number;
}

export interface CreateOrderInput {
  customerId: string;
  quoteId?: string | null;
  status?: OrderStatus;
  currencyCode?: string;
  notes?: string;
  items?: CreateOrderItemInput[];
}

export async function listOrders(page = 1, pageSize = 20): Promise<OrderListResult> {
  const response = await authenticatedFetch(`/api/v1/orders?page=${page}&pageSize=${pageSize}`);
  return parseApiResponse<OrderListResult>(response);
}

export async function getOrder(id: string): Promise<OrderDetail> {
  const response = await authenticatedFetch(`/api/v1/orders/${id}`);
  return parseApiResponse<OrderDetail>(response);
}

export async function createOrder(input: CreateOrderInput): Promise<OrderListItem> {
  const response = await authenticatedFetch('/api/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseApiResponse<OrderListItem>(response);
}

export interface ShipOrderInput {
  carrier?: string;
  trackingNumber?: string;
  notes?: string;
}

export interface DeliverOrderInput {
  recipientName?: string;
  notes?: string;
}

export interface CancelOrderInput {
  reason?: string;
}

export async function shipOrder(id: string, input: ShipOrderInput = {}): Promise<OrderDetail> {
  const response = await authenticatedFetch(`/api/v1/orders/${id}/ship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseApiResponse<OrderDetail>(response);
}

export async function deliverOrder(id: string, input: DeliverOrderInput = {}): Promise<OrderDetail> {
  const response = await authenticatedFetch(`/api/v1/orders/${id}/deliver`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseApiResponse<OrderDetail>(response);
}

export async function cancelOrder(id: string, input: CancelOrderInput = {}): Promise<OrderDetail> {
  const response = await authenticatedFetch(`/api/v1/orders/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseApiResponse<OrderDetail>(response);
}
