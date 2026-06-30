import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CustomerDetailView } from '../components/customer-detail';
import { ApiClientError } from '../lib/api/authenticated-fetch';

vi.mock('../lib/api/customers-client', () => ({
  getCustomer: vi.fn(),
  updateCustomer: vi.fn(),
}));

vi.mock('../lib/api/customer-360-client', () => ({
  getCustomer360: vi.fn(),
  getCustomerTimeline: vi.fn(),
}));

vi.mock('../components/customer-timeline', () => ({
  CustomerTimelineSection: () => <div data-testid="customer-timeline-section-stub" />,
}));

import { getCustomer } from '../lib/api/customers-client';
import { getCustomer360 } from '../lib/api/customer-360-client';

const baseCustomer = {
  id: 'cust-1',
  displayName: 'Demo Customer',
  email: 'demo@default.local',
  phone: '+905551110000',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: null,
  version: 1,
  contacts: [
    {
      id: 'contact-1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: null,
      title: 'Owner',
      isPrimary: true,
    },
  ],
  addresses: [],
  tags: [{ id: 'tag-1', name: 'vip' }],
  notes: [{ id: 'note-1', title: 'Welcome', body: 'Hello', createdAt: '2026-01-01T00:00:00.000Z' }],
  files: [
    {
      id: 'file-1',
      fileName: 'contract.pdf',
      mimeType: 'application/pdf',
      byteSize: 2048,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
};

describe('CustomerDetailView', () => {
  beforeEach(() => {
    vi.mocked(getCustomer).mockReset();
    vi.mocked(getCustomer360).mockReset();
  });

  it('renders read-only 360 aggregation sections', async () => {
    vi.mocked(getCustomer).mockResolvedValue(baseCustomer);
    vi.mocked(getCustomer360).mockResolvedValue({
      ...baseCustomer,
      scores: [{ id: 'score-1', metricCode: 'engagement', scoreValue: 82.5, recordedAt: '2026-01-02T00:00:00.000Z' }],
      riskScore: {
        id: 'risk-1',
        riskLevel: 'low',
        riskScore: 12.5,
        assessedAt: '2026-01-02T00:00:00.000Z',
      },
      lifetimeValue: {
        id: 'ltv-1',
        currency: 'TRY',
        ltvValue: 125000,
        calculatedAt: '2026-01-02T00:00:00.000Z',
      },
      timelinePreview: [
        {
          id: 'event-1',
          eventType: 'customer.created',
          title: 'Customer onboarded',
          summary: 'Seed event',
          occurredAt: '2026-01-01T00:00:00.000Z',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    render(<CustomerDetailView customerId="cust-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('customer-detail')).toBeInTheDocument();
    });

    expect(screen.getByTestId('customer-360-contacts')).toHaveTextContent('Jane Doe');
    expect(screen.getByTestId('customer-360-tags')).toHaveTextContent('vip');
    expect(screen.getByTestId('customer-360-notes')).toHaveTextContent('Hello');
    expect(screen.getByTestId('customer-360-files')).toHaveTextContent('contract.pdf');
    expect(screen.getByTestId('customer-360-scores')).toHaveTextContent('engagement');
    expect(screen.getByTestId('customer-360-risk')).toHaveTextContent('low');
    expect(screen.getByTestId('customer-360-ltv')).toHaveTextContent('125000');
    expect(screen.getByTestId('customer-360-timeline-preview')).toHaveTextContent('Customer onboarded');
    expect(screen.getByTestId('ai-assist-dock')).toBeInTheDocument();
    expect(screen.getByTestId('no-file-upload-control')).toBeInTheDocument();
    expect(screen.queryByTestId('file-upload-input')).not.toBeInTheDocument();
  });

  it('handles customer 360 empty state', async () => {
    vi.mocked(getCustomer).mockResolvedValue(baseCustomer);
    vi.mocked(getCustomer360).mockResolvedValue({
      ...baseCustomer,
      scores: [],
      riskScore: null,
      lifetimeValue: null,
      notes: [],
      files: [],
      timelinePreview: [],
    });

    render(<CustomerDetailView customerId="cust-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('customer-360-empty')).toBeInTheDocument();
    });
  });

  it('handles customer 360 error state', async () => {
    vi.mocked(getCustomer).mockResolvedValue(baseCustomer);
    vi.mocked(getCustomer360).mockRejectedValue(new Error('360 unavailable'));

    render(<CustomerDetailView customerId="cust-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('customer-360-error')).toHaveTextContent('360 unavailable');
    });
  });

  it('shows permission error state for customer 360 forbidden', async () => {
    vi.mocked(getCustomer).mockResolvedValue(baseCustomer);
    vi.mocked(getCustomer360).mockRejectedValue(
      new ApiClientError('Insufficient permissions', 403, 'forbidden'),
    );

    render(<CustomerDetailView customerId="cust-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('customer-360-forbidden')).toBeInTheDocument();
    });
  });
});
