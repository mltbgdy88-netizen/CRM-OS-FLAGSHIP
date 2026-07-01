import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CustomerListView } from '../components/customer-list';
import { ApiClientError } from '../lib/api/authenticated-fetch';

vi.mock('../lib/api/customers-client', () => ({
  listCustomers: vi.fn(),
}));

import { listCustomers } from '../lib/api/customers-client';

describe('CustomerListView', () => {
  beforeEach(() => {
    vi.mocked(listCustomers).mockReset();
  });

  it('shows loading then success state', async () => {
    vi.mocked(listCustomers).mockResolvedValue({
      items: [
        {
          id: 'cust-1',
          displayName: 'Demo Customer',
          email: 'demo@default.local',
          phone: null,
          status: 'active',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: null,
          version: 1,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });

    render(<CustomerListView />);
    expect(screen.getByTestId('customer-list-loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('customer-list-items')).toBeInTheDocument();
    });
    expect(screen.getByTestId('customer-list-pagination')).toHaveTextContent('1 toplam');
    expect(screen.getByTestId('no-upload-ui-notice')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    vi.mocked(listCustomers).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });

    render(<CustomerListView />);

    await waitFor(() => {
      expect(screen.getByTestId('customer-list-empty')).toBeInTheDocument();
    });
  });

  it('shows error state', async () => {
    vi.mocked(listCustomers).mockRejectedValue(new Error('boom'));

    render(<CustomerListView />);

    await waitFor(() => {
      expect(screen.getByTestId('customer-list-error')).toHaveTextContent('boom');
    });
  });

  it('shows permission denied state', async () => {
    vi.mocked(listCustomers).mockRejectedValue(
      new ApiClientError('Insufficient permissions', 403, 'forbidden'),
    );

    render(<CustomerListView />);

    await waitFor(() => {
      expect(screen.getByTestId('customer-list-forbidden')).toBeInTheDocument();
    });
  });
});
