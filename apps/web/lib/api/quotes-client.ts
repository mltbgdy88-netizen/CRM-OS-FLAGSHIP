import { ApiClientError, authenticatedFetch, parseApiResponse } from './authenticated-fetch';

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export interface QuoteListItem {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  opportunityId: string | null;
  status: QuoteStatus;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  marginPercent: number;
  currencyCode: string;
  createdBy: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string | null;
  version: number;
}

export interface QuoteListResult {
  items: QuoteListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QuoteItem {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  sortOrder: number;
}

export interface QuoteDiscount {
  id: string;
  name: string;
  discountType: string;
  value: number;
}

export interface QuoteTax {
  id: string;
  name: string;
  ratePercent: number;
  amount: number;
}

export interface QuoteVersion {
  id: string;
  versionNumber: number;
  label: string | null;
  isCurrent: boolean;
}

export interface QuoteDetail extends QuoteListItem {
  notes: string | null;
  items: QuoteItem[];
  discounts: QuoteDiscount[];
  taxes: QuoteTax[];
  versions: QuoteVersion[];
}

export interface CreateQuoteItemInput {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  sortOrder?: number;
}

export interface CreateQuoteInput {
  customerId: string;
  opportunityId?: string;
  status?: QuoteStatus;
  currencyCode?: string;
  notes?: string;
  items?: CreateQuoteItemInput[];
}

export interface UpdateQuoteInput {
  status?: QuoteStatus;
  notes?: string;
  marginPercent?: number;
  currencyCode?: string;
}

export async function listQuotes(page = 1, pageSize = 20): Promise<QuoteListResult> {
  const response = await authenticatedFetch(`/api/v1/quotes?page=${page}&pageSize=${pageSize}`);
  return parseApiResponse<QuoteListResult>(response);
}

export async function getQuote(id: string): Promise<QuoteDetail> {
  const response = await authenticatedFetch(`/api/v1/quotes/${id}`);
  return parseApiResponse<QuoteDetail>(response);
}

export async function createQuote(input: CreateQuoteInput): Promise<QuoteListItem> {
  const response = await authenticatedFetch('/api/v1/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseApiResponse<QuoteListItem>(response);
}

export async function updateQuote(id: string, input: UpdateQuoteInput): Promise<QuoteListItem> {
  const response = await authenticatedFetch(`/api/v1/quotes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseApiResponse<QuoteListItem>(response);
}

export interface SendQuoteInput {
  recipientEmail?: string;
}

export interface ApproveQuoteInput {
  decision: 'approved' | 'rejected';
  notes?: string;
}

export async function sendQuote(id: string, input: SendQuoteInput = {}): Promise<QuoteListItem> {
  const response = await authenticatedFetch(`/api/v1/quotes/${id}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseApiResponse<QuoteListItem>(response);
}

export async function approveQuote(id: string, input: ApproveQuoteInput): Promise<QuoteListItem> {
  const response = await authenticatedFetch(`/api/v1/quotes/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseApiResponse<QuoteListItem>(response);
}

export async function fetchQuotePdf(id: string): Promise<Blob> {
  const response = await authenticatedFetch(`/api/v1/quotes/${id}/pdf`);
  if (response.status === 401) {
    throw new ApiClientError('Authentication required', 401, 'auth');
  }
  if (response.status === 403) {
    throw new ApiClientError('Insufficient permissions', 403, 'forbidden');
  }
  if (response.status === 404) {
    throw new ApiClientError('Resource not found', 404, 'not_found');
  }
  if (!response.ok) {
    throw new ApiClientError('Request failed', response.status, 'unknown');
  }
  return response.blob();
}
