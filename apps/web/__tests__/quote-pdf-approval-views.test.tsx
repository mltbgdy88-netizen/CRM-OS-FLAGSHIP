import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { QuoteApprovalDrawer } from '../components/quote-approval-drawer';
import { QuoteBuilderView } from '../components/quote-builder-view';
import { QuotePdfPreviewView } from '../components/quote-pdf-preview-view';

vi.mock('../lib/api/quotes-client', () => ({
  getQuote: vi.fn(),
  sendQuote: vi.fn(),
  approveQuote: vi.fn(),
  fetchQuotePdf: vi.fn(),
}));

import {
  approveQuote,
  fetchQuotePdf,
  getQuote,
  sendQuote,
} from '../lib/api/quotes-client';

const mockQuoteDetail = {
  id: 'quote-001',
  number: 'TKL-2026-0142',
  customerId: 'cust-1',
  customerName: 'Acme Teknoloji',
  opportunityId: 'opp-1',
  status: 'draft' as const,
  subtotal: 420_000,
  discountTotal: 10_000,
  taxTotal: 73_800,
  total: 483_800,
  marginPercent: 28,
  currencyCode: 'TRY',
  createdBy: 'user-1',
  createdByName: 'Ahmet Yılmaz',
  createdAt: '2026-06-18T10:00:00Z',
  updatedAt: null,
  version: 1,
  notes: 'Standart teslimat koşulları geçerlidir.',
  items: [
    {
      id: 'item-1',
      name: 'CRM OS Enterprise',
      description: 'Yıllık lisans',
      quantity: 1,
      unitPrice: 420_000,
      lineTotal: 420_000,
      sortOrder: 1,
    },
  ],
  discounts: [],
  taxes: [],
  versions: [],
};

describe('QuoteBuilderView', () => {
  beforeEach(() => {
    vi.mocked(getQuote).mockReset();
    vi.mocked(sendQuote).mockReset();
    vi.mocked(approveQuote).mockReset();
    vi.mocked(getQuote).mockResolvedValue(mockQuoteDetail);
    vi.mocked(sendQuote).mockResolvedValue({ ...mockQuoteDetail, status: 'sent' });
    vi.mocked(approveQuote).mockResolvedValue({ ...mockQuoteDetail, status: 'accepted' });
  });

  it('renders quote builder with header, items, and summary', async () => {
    render(<QuoteBuilderView quoteId="quote-001" />);

    await waitFor(() => {
      expect(screen.getByTestId('quote-builder')).toBeInTheDocument();
    });

    expect(screen.getByText('TKL-2026-0142')).toBeInTheDocument();
    expect(screen.getByText('Acme Teknoloji')).toBeInTheDocument();
    expect(screen.getByTestId('quote-builder-items')).toBeInTheDocument();
    expect(screen.getByText('CRM OS Enterprise')).toBeInTheDocument();
    expect(screen.getByTestId('quote-builder-summary')).toBeInTheDocument();
    expect(screen.getByTestId('quote-preview-link')).toHaveAttribute(
      'href',
      '/quotes/quote-001/preview',
    );
  });

  it('shows loading state', () => {
    vi.mocked(getQuote).mockReturnValue(new Promise(() => undefined));
    render(<QuoteBuilderView quoteId="quote-001" />);
    expect(screen.getByTestId('quote-builder-loading')).toBeInTheDocument();
  });

  it('shows forbidden state', async () => {
    vi.mocked(getQuote).mockRejectedValue(
      new ApiClientError('Insufficient permissions', 403, 'forbidden'),
    );
    render(<QuoteBuilderView quoteId="quote-001" />);

    await waitFor(() => {
      expect(screen.getByTestId('quote-builder-forbidden')).toBeInTheDocument();
    });
  });

  it('sends quote from builder view', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilderView quoteId="quote-001" />);

    await waitFor(() => {
      expect(screen.getByTestId('quote-send-button')).toBeEnabled();
    });

    await user.click(screen.getByTestId('quote-send-button'));

    await waitFor(() => {
      expect(sendQuote).toHaveBeenCalledWith('quote-001');
      expect(screen.getByTestId('quote-send-success')).toBeInTheDocument();
    });
  });

  it('opens approval drawer from builder view', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilderView quoteId="quote-001" />);

    await waitFor(() => {
      expect(screen.getByTestId('quote-approval-open')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('quote-approval-open'));
    expect(screen.getByTestId('quote-approval-drawer')).toBeInTheDocument();
  });
});

describe('QuoteApprovalDrawer', () => {
  beforeEach(() => {
    vi.mocked(approveQuote).mockReset();
    vi.mocked(approveQuote).mockResolvedValue({ ...mockQuoteDetail, status: 'accepted' });
  });

  it('submits approval decision', async () => {
    const user = userEvent.setup();
    const onDecision = vi.fn();
    const onClose = vi.fn();

    render(
      <QuoteApprovalDrawer
        quoteId="quote-001"
        open
        onClose={onClose}
        onDecision={onDecision}
      />,
    );

    await user.type(screen.getByTestId('quote-approval-notes'), 'Bütçe onaylandı');
    await user.click(screen.getByTestId('quote-approval-approve'));

    await waitFor(() => {
      expect(approveQuote).toHaveBeenCalledWith('quote-001', {
        decision: 'approved',
        notes: 'Bütçe onaylandı',
      });
      expect(onDecision).toHaveBeenCalledWith('approved');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows forbidden state on approve', async () => {
    const user = userEvent.setup();
    vi.mocked(approveQuote).mockRejectedValue(
      new ApiClientError('Insufficient permissions', 403, 'forbidden'),
    );

    render(<QuoteApprovalDrawer quoteId="quote-001" open onClose={() => undefined} />);

    await user.click(screen.getByTestId('quote-approval-reject'));

    await waitFor(() => {
      expect(screen.getByTestId('quote-approval-forbidden')).toBeInTheDocument();
    });
  });
});

describe('QuotePdfPreviewView', () => {
  const createObjectUrl = vi.fn(() => 'blob:mock-pdf-url');
  const revokeObjectUrl = vi.fn();

  beforeEach(() => {
    vi.mocked(fetchQuotePdf).mockReset();
    vi.mocked(fetchQuotePdf).mockResolvedValue(new Blob(['%PDF-1.4'], { type: 'application/pdf' }));
    createObjectUrl.mockClear();
    revokeObjectUrl.mockClear();
    vi.stubGlobal('URL', {
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl,
    });
  });

  it('renders pdf preview object on success', async () => {
    render(<QuotePdfPreviewView quoteId="quote-001" />);

    await waitFor(() => {
      expect(screen.getByTestId('quote-pdf-preview-object')).toBeInTheDocument();
    });

    expect(fetchQuotePdf).toHaveBeenCalledWith('quote-001');
    expect(createObjectUrl).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    vi.mocked(fetchQuotePdf).mockReturnValue(new Promise(() => undefined));
    render(<QuotePdfPreviewView quoteId="quote-001" />);
    expect(screen.getByTestId('quote-pdf-preview-loading')).toBeInTheDocument();
  });

  it('shows forbidden state', async () => {
    vi.mocked(fetchQuotePdf).mockRejectedValue(
      new ApiClientError('Insufficient permissions', 403, 'forbidden'),
    );
    render(<QuotePdfPreviewView quoteId="quote-001" />);

    await waitFor(() => {
      expect(screen.getByTestId('quote-pdf-preview-forbidden')).toBeInTheDocument();
    });
  });

  it('shows error state', async () => {
    vi.mocked(fetchQuotePdf).mockRejectedValue(new Error('PDF servisi yanıt vermedi'));
    render(<QuotePdfPreviewView quoteId="quote-001" />);

    await waitFor(() => {
      expect(screen.getByTestId('quote-pdf-preview-error')).toHaveTextContent(
        'PDF servisi yanıt vermedi',
      );
    });
  });
});
