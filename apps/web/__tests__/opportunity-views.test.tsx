import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpportunityDetailView } from '../components/opportunity-detail-view';
import { OpportunityListView } from '../components/opportunity-list-view';

vi.mock('../lib/api/opportunities-client', () => ({
  listOpportunities: vi.fn(),
  getOpportunity: vi.fn(),
}));

import { getOpportunity, listOpportunities } from '../lib/api/opportunities-client';

const mockOpportunityItems = [
  {
    id: 'opp-001',
    pipelineId: 'pipe-1',
    stageId: 'stage-1',
    leadId: null,
    customerId: 'cust-1',
    title: 'Nova Yazılım Enterprise',
    companyName: 'Nova Yazılım',
    amount: 95000,
    probability: 60,
    status: 'open',
    assignedUserId: 'user-1',
    pipeline: { id: 'pipe-1', name: 'Varsayılan Pipeline', code: 'default' },
    stage: { id: 'stage-1', name: 'Yeni', code: 'new' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: null,
    version: 1,
  },
  {
    id: 'opp-002',
    pipelineId: 'pipe-1',
    stageId: 'stage-2',
    leadId: 'lead-1',
    customerId: null,
    title: 'Atlas Lojistik CRM',
    companyName: 'Atlas Lojistik',
    amount: 128000,
    probability: 40,
    status: 'open',
    assignedUserId: null,
    pipeline: { id: 'pipe-1', name: 'Varsayılan Pipeline', code: 'default' },
    stage: { id: 'stage-2', name: 'Görüşme', code: 'meeting' },
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: null,
    version: 1,
  },
];

const mockOpportunityDetail = {
  ...mockOpportunityItems[0],
  products: [
    {
      id: 'prod-1',
      name: 'CRM OS Enterprise License',
      sku: 'CRM-ENT-01',
      quantity: 1,
      unitPrice: 95000,
    },
  ],
  contacts: [
    {
      id: 'contact-1',
      firstName: 'Ayşe',
      lastName: 'Yılmaz',
      email: 'ayse@nova.local',
      phone: '+905551112233',
      title: 'Procurement Lead',
      isPrimary: true,
    },
  ],
  activities: [
    {
      id: 'act-1',
      activityType: 'call',
      title: 'Discovery call',
      body: 'Initial qualification call.',
      dueAt: '2026-01-10T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  notes: [
    {
      id: 'note-1',
      title: 'Budget confirmed',
      body: 'Buyer confirmed Q3 budget allocation.',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
};

describe('OpportunityListView', () => {
  beforeEach(() => {
    vi.mocked(listOpportunities).mockReset();
    vi.mocked(listOpportunities).mockResolvedValue({
      items: mockOpportunityItems,
      total: 2,
      page: 1,
      pageSize: 50,
    });
  });

  it('renders opportunity list with table rows', async () => {
    render(<OpportunityListView />);

    await waitFor(() => {
      expect(screen.getByTestId('opportunity-list-items')).toBeInTheDocument();
    });

    expect(screen.getByTestId('opportunity-list')).toBeInTheDocument();
    expect(screen.getByText('Fırsatlar')).toBeInTheDocument();
    expect(screen.getByTestId('opportunity-row-opp-001')).toBeInTheDocument();
    expect(screen.getByText('Nova Yazılım Enterprise')).toBeInTheDocument();
    expect(screen.getByText('Atlas Lojistik')).toBeInTheDocument();
  });

  it('filters opportunities by search query', async () => {
    const user = userEvent.setup();
    render(<OpportunityListView />);

    await waitFor(() => {
      expect(screen.getByText('Nova Yazılım Enterprise')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Fırsat ara'), 'Atlas');

    expect(screen.queryByText('Nova Yazılım Enterprise')).not.toBeInTheDocument();
    expect(screen.getByText('Atlas Lojistik CRM')).toBeInTheDocument();
  });
});

describe('OpportunityDetailView', () => {
  beforeEach(() => {
    vi.mocked(getOpportunity).mockReset();
    vi.mocked(getOpportunity).mockResolvedValue(mockOpportunityDetail);
  });

  it('renders opportunity detail with info grid and tabs', async () => {
    const user = userEvent.setup();
    render(<OpportunityDetailView opportunityId="opp-001" />);

    await waitFor(() => {
      expect(screen.getByTestId('opportunity-detail')).toBeInTheDocument();
    });

    expect(screen.getByText('Nova Yazılım Enterprise')).toBeInTheDocument();
    expect(screen.getByText('Açık')).toBeInTheDocument();
    expect(screen.getByTestId('opportunity-detail-info')).toBeInTheDocument();
    expect(screen.getByTestId('opportunity-detail-products')).toBeInTheDocument();
    expect(screen.getByText('CRM OS Enterprise License')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Kişiler' }));
    expect(screen.getByTestId('opportunity-detail-contacts')).toBeInTheDocument();
    expect(screen.getByText('Ayşe Yılmaz (Birincil)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Notlar' }));
    expect(screen.getByTestId('opportunity-detail-notes')).toBeInTheDocument();
    expect(screen.getByText('Budget confirmed')).toBeInTheDocument();
  });
});
