import type { Decimal } from '@prisma/client/runtime/library';

function decimalToNumber(value: Decimal | null | undefined): number {
  if (value == null) {
    return 0;
  }
  return Number(value);
}

export function mapAccountSummary(account: {
  id: string;
  customerId: string | null;
  name: string;
  code: string;
  balance: Decimal;
  currency: string;
  status: string;
  customer?: { id: string; displayName: string } | null;
  creditLimit?: { limitAmount: Decimal; currency: string; status: string } | null;
  riskLimit?: { riskScore: Decimal; limitAmount: Decimal } | null;
}) {
  return {
    id: account.id,
    customerId: account.customerId,
    name: account.name,
    code: account.code,
    balance: decimalToNumber(account.balance),
    currency: account.currency,
    status: account.status,
    customer: account.customer
      ? { id: account.customer.id, displayName: account.customer.displayName }
      : null,
    creditLimit: account.creditLimit
      ? {
          limitAmount: decimalToNumber(account.creditLimit.limitAmount),
          currency: account.creditLimit.currency,
          status: account.creditLimit.status,
        }
      : null,
    riskLimit: account.riskLimit
      ? {
          riskScore: decimalToNumber(account.riskLimit.riskScore),
          limitAmount: decimalToNumber(account.riskLimit.limitAmount),
        }
      : null,
  };
}

export function mapAccountTransaction(transaction: {
  id: string;
  accountId: string;
  transactionType: string;
  amount: Decimal;
  balanceAfter: Decimal;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  transactionAt: Date;
  account: { id: string; name: string; code: string };
}) {
  return {
    id: transaction.id,
    accountId: transaction.accountId,
    transactionType: transaction.transactionType,
    amount: decimalToNumber(transaction.amount),
    balanceAfter: decimalToNumber(transaction.balanceAfter),
    referenceType: transaction.referenceType,
    referenceId: transaction.referenceId,
    description: transaction.description,
    transactionAt: transaction.transactionAt.toISOString(),
    account: {
      id: transaction.account.id,
      name: transaction.account.name,
      code: transaction.account.code,
    },
  };
}

export function mapInvoiceDetail(invoice: {
  id: string;
  accountId: string;
  invoiceNumber: string;
  status: string;
  subtotal: Decimal;
  taxAmount: Decimal;
  totalAmount: Decimal;
  currency: string;
  dueDate: Date | null;
  issuedAt: Date | null;
  items: Array<{
    id: string;
    description: string;
    quantity: Decimal;
    unitPrice: Decimal;
    lineTotal: Decimal;
    sortOrder: number;
  }>;
  account: { id: string; name: string; code: string };
}) {
  return {
    id: invoice.id,
    accountId: invoice.accountId,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    subtotal: decimalToNumber(invoice.subtotal),
    taxAmount: decimalToNumber(invoice.taxAmount),
    totalAmount: decimalToNumber(invoice.totalAmount),
    currency: invoice.currency,
    dueDate: invoice.dueDate?.toISOString().slice(0, 10) ?? null,
    issuedAt: invoice.issuedAt?.toISOString() ?? null,
    account: {
      id: invoice.account.id,
      name: invoice.account.name,
      code: invoice.account.code,
    },
    items: invoice.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: decimalToNumber(item.quantity),
      unitPrice: decimalToNumber(item.unitPrice),
      lineTotal: decimalToNumber(item.lineTotal),
      sortOrder: item.sortOrder,
    })),
  };
}

export function mapFinanceOverview(input: {
  totalAccounts: number;
  totalReceivables: number;
  totalCreditLimit: number;
  recentTransactions: ReturnType<typeof mapAccountTransaction>[];
}) {
  return input;
}
