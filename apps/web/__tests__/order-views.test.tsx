import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderDetailView } from '../components/order-detail-view';
import { OrderListView } from '../components/order-list-view';

vi.mock('../lib/api/orders-client', () => ({
  listOrders: vi.fn(),
  getOrder: vi.fn(),
}));

import { getOrder, listOrders } from '../lib/api/orders-client';

const mockOrderItems = [
  {
    id: 'ord-001',
    number: 'O-2026-0001',
    customerId: 'cust-1',
    quoteId: 'quote-1',
    status: 'confirmed' as const,
    subtotal: 95_000,
    taxTotal: 17_100,
    total: 112_100,
    currencyCode: 'TRY',
    notes: null,
    customer: { id: 'cust-1', displayName: 'Acme Teknoloji' },
    createdAt: '2026-06-14T10:00:00Z',
    updatedAt: null,
    version: 1,
  },
  {
    id: 'ord-002',
    number: 'O-2026-0002',
    customerId: 'cust-2',
    quoteId: null,
    status: 'pending' as const,
    subtotal: 64_000,
    taxTotal: 12_800,
    total: 76_800,
    currencyCode: 'TRY',
    notes: null,
    customer: { id: 'cust-2', displayName: 'Beta Yazılım' },
    createdAt: '2026-06-10T14:20:00Z',
    updatedAt: null,
    version: 1,
  },
];

const mockOrderDetail = {
  ...mockOrderItems[0],
  items: [
    {
      id: 'item-1',
      name: 'CRM OS Enterprise License',
      description: 'Annual subscription license',
      quantity: 1,
      unitPrice: 95_000,
      lineTotal: 95_000,
      sortOrder: 1,
      createdAt: '2026-06-14T10:00:00Z',
      version: 1,
    },
  ],
  statusHistory: [
    {
      id: 'hist-1',
      fromStatus: 'pending',
      toStatus: 'confirmed',
      reason: 'Quote accepted and order created.',
      createdAt: '2026-06-14T11:00:00Z',
      version: 1,
    },
    {
      id: 'hist-2',
      fromStatus: 'draft',
      toStatus: 'pending',
      reason: 'Order submitted for fulfillment review.',
      createdAt: '2026-06-14T10:30:00Z',
      version: 1,
    },
  ],
};

describe('OrderListView', () => {
  beforeEach(() => {
    vi.mocked(listOrders).mockReset();
    vi.mocked(listOrders).mockResolvedValue({
      items: mockOrderItems,
      total: 2,
      page: 1,
      pageSize: 50,
    });
  });

  it('renders order list with table rows', async () => {
    render(<OrderListView />);

    await waitFor(() => {
      expect(screen.getByTestId('order-list-items')).toBeInTheDocument();
    });

    expect(screen.getByTestId('order-list')).toBeInTheDocument();
    expect(screen.getByText('Siparişler')).toBeInTheDocument();
    expect(screen.getByTestId('order-row-ord-001')).toBeInTheDocument();
    expect(screen.getByText('O-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('Acme Teknoloji')).toBeInTheDocument();
    expect(screen.getByText('Beta Yazılım')).toBeInTheDocument();
  });

  it('filters orders by search query', async () => {
    const user = userEvent.setup();
    render(<OrderListView />);

    await waitFor(() => {
      expect(screen.getByText('Acme Teknoloji')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Sipariş ara'), 'Beta');

    expect(screen.queryByText('Acme Teknoloji')).not.toBeInTheDocument();
    expect(screen.getByText('Beta Yazılım')).toBeInTheDocument();
  });
});

describe('OrderDetailView', () => {
  beforeEach(() => {
    vi.mocked(getOrder).mockReset();
    vi.mocked(getOrder).mockResolvedValue(mockOrderDetail);
  });

  it('renders order detail with items table and fulfillment timeline', async () => {
    render(<OrderDetailView orderId="ord-001" />);

    await waitFor(() => {
      expect(screen.getByTestId('order-detail-header')).toBeInTheDocument();
    });

    expect(screen.getByTestId('order-detail')).toBeInTheDocument();
    expect(screen.getByText('O-2026-0001')).toBeInTheDocument();
    expect(screen.getAllByText('Onaylandı').length).toBeGreaterThan(0);
    expect(screen.getByTestId('order-detail-items')).toBeInTheDocument();
    expect(screen.getByText('CRM OS Enterprise License')).toBeInTheDocument();
    expect(screen.getByTestId('order-detail-timeline')).toBeInTheDocument();
    expect(screen.getByText('Quote accepted and order created.')).toBeInTheDocument();
  });
});
