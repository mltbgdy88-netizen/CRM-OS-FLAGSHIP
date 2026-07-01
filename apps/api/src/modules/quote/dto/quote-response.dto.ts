export interface QuoteItemResponseDto {
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

export interface QuoteDiscountResponseDto {
  id: string;
  name: string;
  discountType: string;
  value: number;
  createdAt: string;
  version: number;
}

export interface QuoteTaxResponseDto {
  id: string;
  name: string;
  ratePercent: number;
  amount: number;
  createdAt: string;
  version: number;
}

export interface QuoteCustomerSummaryDto {
  id: string;
  displayName: string;
}

export interface QuoteSummaryResponseDto {
  id: string;
  number: string;
  customerId: string;
  opportunityId: string | null;
  status: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  marginPercent: number;
  currencyCode: string;
  notes: string | null;
  customer: QuoteCustomerSummaryDto;
  createdAt: string;
  updatedAt: string | null;
  version: number;
}

export interface QuoteDetailResponseDto extends QuoteSummaryResponseDto {
  items: QuoteItemResponseDto[];
  discounts: QuoteDiscountResponseDto[];
  taxes: QuoteTaxResponseDto[];
}

export interface PaginatedQuotesResponseDto {
  items: QuoteSummaryResponseDto[];
  total: number;
  page: number;
  pageSize: number;
}
