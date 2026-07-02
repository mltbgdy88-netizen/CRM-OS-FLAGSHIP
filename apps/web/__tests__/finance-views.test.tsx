import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FinanceOverviewView } from '../components/finance-overview-view';
import { PaymentEntryPanel } from '../components/payment-entry-panel';

vi.mock('../lib/api/finance-client', () => ({
  getFinanceOverview: vi.fn(),
  listAccounts: vi.fn(),
  listAccountTransactions: vi.fn(),
  formatCurrency: (amount: number, currency = 'TRY') =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount),
}));

import {
  getFinanceOverview,
  listAccountTransactions,
  listAccounts,
} from '../lib/api/finance-client';

const mockAccounts = [
  {
    id: 'acc-001',
    customerId: 'cust-001',
    name: 'Acme Corp Cari',
    code: 'ACME-001',
    balance: 15000,
    currency: 'TRY',
    status: 'active',
    customer: { id: 'cust-001', displayName: 'Acme Corp' },
    creditLimit: { limitAmount: 50000, currency: 'TRY', status: 'active' },
    riskLimit: { riskScore: 25, limitAmount: 40000 },
  },
];

const mockOverview = {
  totalAccounts: 1,
  totalReceivables: 15000,
  totalCreditLimit: 50000,
  recentTransactions: [
    {
      id: 'tx-001',
      accountId: 'acc-001',
      transactionType: 'opening',
      amount: 15000,
      balanceAfter: 15000,
      referenceType: 'seed',
      referenceId: null,
      description: 'Opening balance',
      transactionAt: '2026-06-01T10:00:00Z',
      account: { id: 'acc-001', name: 'Acme Corp Cari', code: 'ACME-001' },
    },
  ],
};

const mockTransactions = mockOverview.recentTransactions;

describe('FinanceOverviewView', () => {
  beforeEach(() => {
    vi.mocked(getFinanceOverview).mockReset();
    vi.mocked(listAccounts).mockReset();
    vi.mocked(listAccountTransactions).mockReset();
    vi.mocked(getFinanceOverview).mockResolvedValue(mockOverview);
    vi.mocked(listAccounts).mockResolvedValue({
      items: mockAccounts,
      total: 1,
      page: 1,
      pageSize: 50,
    });
    vi.mocked(listAccountTransactions).mockResolvedValue({
      items: mockTransactions,
      total: 1,
      page: 1,
      pageSize: 50,
    });
  });

  it('renders finance overview KPIs and account table', async () => {
    render(<FinanceOverviewView />);

    await waitFor(() => {
      expect(screen.getByTestId('finance-kpi-row')).toBeInTheDocument();
    });

    expect(screen.getByText('Toplam Alacak')).toBeInTheDocument();
    expect(screen.getByTestId('finance-account-acc-001')).toBeInTheDocument();
  });

  it('shows receivables tab with account balances', async () => {
    const user = userEvent.setup();
    render(<FinanceOverviewView />);

    await waitFor(() => {
      expect(screen.getByTestId('finance-tab-receivables')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('finance-tab-receivables'));

    await waitFor(() => {
      expect(screen.getByTestId('finance-receivable-acc-001')).toBeInTheDocument();
    });
  });

  it('shows forbidden state when API returns forbidden', async () => {
    const { ApiClientError } = await import('../lib/api/authenticated-fetch');
    vi.mocked(getFinanceOverview).mockRejectedValue(
      new ApiClientError('Insufficient permissions', 403, 'forbidden'),
    );

    render(<FinanceOverviewView />);

    await waitFor(() => {
      expect(screen.getByTestId('finance-overview-forbidden')).toBeInTheDocument();
    });
  });
});

describe('PaymentEntryPanel', () => {
  it('renders payment form and preview on submit', async () => {
    const user = userEvent.setup();
    render(<PaymentEntryPanel accounts={mockAccounts} />);

    expect(screen.getByTestId('payment-entry-account')).toBeInTheDocument();

    await user.clear(screen.getByTestId('payment-entry-amount'));
    await user.type(screen.getByTestId('payment-entry-amount'), '2500');
    await user.type(screen.getByTestId('payment-entry-reference'), 'Havale');
    await user.click(screen.getByTestId('payment-entry-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('payment-entry-preview')).toBeInTheDocument();
    });
  });
});
