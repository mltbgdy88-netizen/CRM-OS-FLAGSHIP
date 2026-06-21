import { authenticatedFetch, parseApiResponse } from './authenticated-fetch';

export interface CustomerSummary {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  version: number;
}

export interface CustomerListResult {
  items: CustomerSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CustomerDetail extends CustomerSummary {
  contacts: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    title: string | null;
    isPrimary: boolean;
  }>;
  addresses: Array<{
    id: string;
    label: string | null;
    line1: string;
    line2: string | null;
    city: string | null;
    region: string | null;
    postalCode: string | null;
    countryCode: string;
    isPrimary: boolean;
  }>;
  tags: Array<{ id: string; name: string }>;
  notes: Array<{ id: string; title: string | null; body: string; createdAt: string }>;
  files: Array<{
    id: string;
    fileName: string;
    mimeType: string | null;
    byteSize: number | null;
    createdAt: string;
  }>;
}

export interface CreateCustomerInput {
  displayName: string;
  email?: string;
  phone?: string;
  status?: string;
}

export interface UpdateCustomerInput {
  displayName?: string;
  email?: string;
  phone?: string;
  status?: string;
}

export async function listCustomers(page = 1, pageSize = 20): Promise<CustomerListResult> {
  const response = await authenticatedFetch(
    `/api/v1/customers?page=${page}&pageSize=${pageSize}`,
  );
  return parseApiResponse<CustomerListResult>(response);
}

export async function getCustomer(id: string): Promise<CustomerDetail> {
  const response = await authenticatedFetch(`/api/v1/customers/${id}`);
  return parseApiResponse<CustomerDetail>(response);
}

export async function createCustomer(input: CreateCustomerInput): Promise<CustomerSummary> {
  const response = await authenticatedFetch('/api/v1/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseApiResponse<CustomerSummary>(response);
}

export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput,
): Promise<CustomerSummary> {
  const response = await authenticatedFetch(`/api/v1/customers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseApiResponse<CustomerSummary>(response);
}
