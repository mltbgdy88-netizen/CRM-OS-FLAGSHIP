export interface OrderItemResponseDto {
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

export interface OrderStatusHistoryResponseDto {
  id: string;
  fromStatus: string;
  toStatus: string;
  reason: string | null;
  createdAt: string;
  version: number;
}

export interface OrderShipmentResponseDto {
  id: string;
  carrier: string | null;
  trackingNumber: string | null;
  shippedAt: string;
  notes: string | null;
  createdAt: string;
  version: number;
}

export interface OrderDeliveryResponseDto {
  id: string;
  deliveredAt: string;
  recipientName: string | null;
  notes: string | null;
  createdAt: string;
  version: number;
}

export interface OrderNoteResponseDto {
  id: string;
  body: string;
  createdAt: string;
  version: number;
}

export interface OrderCustomerSummaryDto {
  id: string;
  displayName: string;
}

export interface OrderSummaryResponseDto {
  id: string;
  number: string;
  customerId: string;
  quoteId: string | null;
  status: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  currencyCode: string;
  notes: string | null;
  customer: OrderCustomerSummaryDto;
  createdAt: string;
  updatedAt: string | null;
  version: number;
}

export interface OrderDetailResponseDto extends OrderSummaryResponseDto {
  items: OrderItemResponseDto[];
  statusHistory: OrderStatusHistoryResponseDto[];
  shipments: OrderShipmentResponseDto[];
  deliveries: OrderDeliveryResponseDto[];
  orderNotes: OrderNoteResponseDto[];
}

export interface PaginatedOrdersResponseDto {
  items: OrderSummaryResponseDto[];
  total: number;
  page: number;
  pageSize: number;
}
