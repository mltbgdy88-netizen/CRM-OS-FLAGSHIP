import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuoteListView } from '../components/quote-list-view';

vi.mock('../lib/api/quotes-client', () => ({
  listQuotes: vi.fn(),
}));

import { listQuotes } from '../lib/api/quotes-client';

const mockQuoteItems = [
  {
    id: 'quote-001',
    number: 'TKL-2026-0142',
    customerId: 'cust-1',
    customerName: 'Acme Teknoloji',
    opportunityId: 'opp-1',
    status: 'sent' as const,
    subtotal: 420_000,
    discountTotal: 0,
    taxTotal: 0,
    total: 420_000,
    marginPercent: 28,
    currencyCode: 'TRY',
    createdBy: 'user-1',
    createdByName: 'Ahmet Yılmaz',
    createdAt: '2026-06-18T10:00:00Z',
    updatedAt: null,
    version: 1,
  },
  {
    id: 'quote-002',
    number: 'TKL-2026-0138',
    customerId: 'cust-2',
    customerName: 'Beta Yazılım',
    opportunityId: null,
    status: 'draft' as const,
    subtotal: 185_000,
    discountTotal: 0,
    taxTotal: 0,
    total: 185_000,
    marginPercent: 22,
    currencyCode: 'TRY',
    createdBy: 'user-2',
    createdByName: 'Selin Yılmaz',
    createdAt: '2026-06-16T14:30:00Z',
    updatedAt: null,
    version: 1,
  },
];

describe('QuoteListView', () => {
  beforeEach(() => {
    vi.mocked(listQuotes).mockReset();
    vi.mocked(listQuotes).mockResolvedValue({
      items: mockQuoteItems,
      total: 2,
      page: 1,
      pageSize: 50,
    });
  });

  it('renders quote list with table rows', async () => {
    render(<QuoteListView />);

    await waitFor(() => {
      expect(screen.getByTestId('quote-list-items')).toBeInTheDocument();
    });

    expect(screen.getByTestId('quote-list')).toBeInTheDocument();
    expect(screen.getByText('Teklifler')).toBeInTheDocument();
    expect(screen.getByTestId('quote-row-quote-001')).toBeInTheDocument();
    expect(screen.getByText('TKL-2026-0142')).toBeInTheDocument();
    expect(screen.getByText('Acme Teknoloji')).toBeInTheDocument();
    expect(screen.getByText('Beta Yazılım')).toBeInTheDocument();
  });

  it('filters quotes by search query', async () => {
    const user = userEvent.setup();
    render(<QuoteListView />);

    await waitFor(() => {
      expect(screen.getByText('Acme Teknoloji')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Teklif ara'), 'Beta');

    expect(screen.queryByText('Acme Teknoloji')).not.toBeInTheDocument();
    expect(screen.getByText('Beta Yazılım')).toBeInTheDocument();
  });
});
