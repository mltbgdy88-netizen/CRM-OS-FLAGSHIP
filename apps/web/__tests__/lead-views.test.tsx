import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LeadDetailView } from '../components/lead-detail-view';
import { LeadListView } from '../components/lead-list-view';

vi.mock('../lib/api/leads-client', () => ({
  listLeads: vi.fn(),
}));

import { listLeads } from '../lib/api/leads-client';

const mockLeadItems = [
  {
    id: 'lead-001',
    fullName: 'Elif Demir',
    companyName: 'Nova Yazılım',
    email: 'elif@nova.local',
    phone: null,
    status: 'new',
    score: 68,
    assignedUserId: 'user-1',
    customerId: null,
    source: { id: 'src-1', name: 'Web formu', code: 'web-form' },
    tags: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: null,
    version: 1,
  },
  {
    id: 'lead-002',
    fullName: 'Murat Kaya',
    companyName: 'Atlas Lojistik',
    email: 'murat@atlas.local',
    phone: null,
    status: 'contacted',
    score: 74,
    assignedUserId: null,
    customerId: null,
    source: { id: 'src-2', name: 'LinkedIn', code: 'linkedin' },
    tags: [],
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: null,
    version: 1,
  },
];

describe('LeadListView', () => {
  beforeEach(() => {
    vi.mocked(listLeads).mockReset();
    vi.mocked(listLeads).mockResolvedValue({
      items: mockLeadItems,
      total: 2,
      page: 1,
      pageSize: 50,
    });
  });

  it('renders lead list with filters and KPI strip', async () => {
    render(<LeadListView />);

    await waitFor(() => {
      expect(screen.getByTestId('lead-list-items')).toBeInTheDocument();
    });

    expect(screen.getByTestId('lead-list')).toBeInTheDocument();
    expect(screen.getByText('Leadler')).toBeInTheDocument();
    expect(screen.getByTestId('lead-kpi-strip')).toBeInTheDocument();
    expect(screen.getByTestId('lead-row-lead-001')).toBeInTheDocument();
    expect(screen.getByText('Elif Demir')).toBeInTheDocument();
  });

  it('filters leads by search query', async () => {
    const user = userEvent.setup();
    render(<LeadListView />);

    await waitFor(() => {
      expect(screen.getByText('Elif Demir')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Lead ara'), 'Atlas');

    expect(screen.queryByText('Elif Demir')).not.toBeInTheDocument();
    expect(screen.getByText('Murat Kaya')).toBeInTheDocument();
  });
});

describe('LeadDetailView', () => {
  it('renders lead detail tabs and AI panel', async () => {
    const user = userEvent.setup();
    render(<LeadDetailView leadId="lead-003" />);

    expect(screen.getByTestId('lead-detail')).toBeInTheDocument();
    expect(screen.getByText('Zeynep Arslan')).toBeInTheDocument();
    expect(screen.getByText('Nitelikli')).toBeInTheDocument();
    expect(screen.getByTestId('lead-detail-info')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'AI' }));
    expect(screen.getByTestId('lead-detail-ai')).toBeInTheDocument();
  });
});
