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
}

export interface PaginatedOrdersResponseDto {
  items: OrderSummaryResponseDto[];
  total: number;
  page: number;
  pageSize: number;
}
