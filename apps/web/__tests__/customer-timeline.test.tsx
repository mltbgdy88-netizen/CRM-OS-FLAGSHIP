import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CustomerTimelineSection } from '../components/customer-timeline';
import { ApiClientError } from '../lib/api/authenticated-fetch';

vi.mock('../lib/api/customer-360-client', () => ({
  getCustomerTimeline: vi.fn(),
}));

import { getCustomerTimeline } from '../lib/api/customer-360-client';

describe('CustomerTimelineSection', () => {
  beforeEach(() => {
    vi.mocked(getCustomerTimeline).mockReset();
  });

  it('renders timeline event rows', async () => {
    vi.mocked(getCustomerTimeline).mockResolvedValue({
      items: [
        {
          id: 'event-1',
          eventType: 'customer.created',
          title: 'Customer onboarded',
          summary: 'Seed timeline event',
          occurredAt: '2026-01-01T00:00:00.000Z',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    });

    render(<CustomerTimelineSection customerId="cust-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('customer-timeline-list')).toBeInTheDocument();
    });

    expect(screen.getByTestId('customer-timeline-row')).toHaveTextContent('Customer onboarded');
    expect(screen.getByTestId('customer-timeline-row')).toHaveTextContent('Seed timeline event');
  });

  it('shows permission error state for 403', async () => {
    vi.mocked(getCustomerTimeline).mockRejectedValue(
      new ApiClientError('Insufficient permissions', 403, 'forbidden'),
    );

    render(<CustomerTimelineSection customerId="cust-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('customer-timeline-forbidden')).toBeInTheDocument();
    });
  });
});
