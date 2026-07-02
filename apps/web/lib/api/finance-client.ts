import { authenticatedFetch, parseApiResponse } from './authenticated-fetch';

export interface FinanceCustomerRef {
  id: string;
  displayName: string;
}

export interface FinanceCreditLimit {
  limitAmount: number;
  currency: string;
  status: string;
}

export interface FinanceRiskLimit {
  riskScore: number;
  limitAmount: number;
}

export interface AccountSummary {
  id: string;
  customerId: string | null;
  name: string;
  code: string;
  balance: number;
  currency: string;
  status: string;
  customer: FinanceCustomerRef | null;
  creditLimit: FinanceCreditLimit | null;
  riskLimit: FinanceRiskLimit | null;
}

export interface AccountTransactionItem {
  id: string;
  accountId: string;
  transactionType: string;
  amount: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  transactionAt: string;
  account: { id: string; name: string; code: string };
}

export interface FinanceOverview {
  totalAccounts: number;
  totalReceivables: number;
  totalCreditLimit: number;
  recentTransactions: AccountTransactionItem[];
}

export interface AccountListResult {
  items: AccountSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AccountTransactionListResult {
  items: AccountTransactionItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceInput {
  accountId: string;
  invoiceNumber: string;
  taxAmount?: number;
  currency?: string;
  dueDate?: string;
  items: InvoiceItemInput[];
}

export interface InvoiceDetail {
  id: string;
  accountId: string;
  invoiceNumber: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  dueDate: string | null;
  issuedAt: string | null;
  account: { id: string; name: string; code: string };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    sortOrder: number;
  }>;
}

export async function getFinanceOverview(): Promise<FinanceOverview> {
  const response = await authenticatedFetch('/api/v1/finance');
  return parseApiResponse<FinanceOverview>(response);
}

export async function listAccounts(page = 1, pageSize = 50): Promise<AccountListResult> {
  const response = await authenticatedFetch(
    `/api/v1/accounts?page=${page}&pageSize=${pageSize}`,
  );
  return parseApiResponse<AccountListResult>(response);
}

export async function listAccountTransactions(
  page = 1,
  pageSize = 50,
  accountId?: string,
): Promise<AccountTransactionListResult> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (accountId) {
    params.set('accountId', accountId);
  }
  const response = await authenticatedFetch(`/api/v1/account-transactions?${params.toString()}`);
  return parseApiResponse<AccountTransactionListResult>(response);
}

export async function createInvoice(input: CreateInvoiceInput): Promise<InvoiceDetail> {
  const response = await authenticatedFetch('/api/v1/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseApiResponse<InvoiceDetail>(response);
}

export function formatCurrency(amount: number, currency = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
