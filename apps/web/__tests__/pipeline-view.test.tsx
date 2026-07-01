import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PipelineView } from '../components/pipeline-view';

vi.mock('../lib/api/pipelines-client', async () => {
  const actual = await vi.importActual<typeof import('../lib/api/pipelines-client')>(
    '../lib/api/pipelines-client',
  );
  return {
    ...actual,
    listPipelines: vi.fn(),
  };
});

import { listPipelines } from '../lib/api/pipelines-client';

const mockPipelineItems = [
  {
    id: 'pipe-001',
    name: 'Ana Satış Pipeline',
    code: 'default',
    isDefault: true,
    stages: [
      { id: 'stage-new', code: 'new', name: 'Yeni Lead', sortOrder: 1, color: '#3b82f6' },
      { id: 'stage-qualified', code: 'qualified', name: 'Nitelikli', sortOrder: 2, color: '#60a5fa' },
      { id: 'stage-proposal', code: 'proposal', name: 'Teklif', sortOrder: 3, color: '#ff6a00' },
      { id: 'stage-negotiation', code: 'negotiation', name: 'Pazarlık', sortOrder: 4, color: '#a855f7' },
      { id: 'stage-won', code: 'won', name: 'Kazanıldı', sortOrder: 5, color: '#22c55e' },
      { id: 'stage-lost', code: 'lost', name: 'Kaybedildi', sortOrder: 6, color: '#ef4444' },
    ],
    opportunities: [
      {
        id: 'opp-001',
        title: 'Kurumsal CRM lisansı',
        companyName: 'Acme Teknoloji',
        amount: 420_000,
        probability: 75,
        stageId: 'stage-proposal',
        status: 'open',
        assignedUserId: 'user-1',
        nextActivityAt: '2026-06-21T10:00:00Z',
        nextActivityLabel: 'Demo görüşmesi',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: null,
        version: 1,
      },
    ],
  },
];

describe('PipelineView', () => {
  beforeEach(() => {
    vi.mocked(listPipelines).mockReset();
    vi.mocked(listPipelines).mockResolvedValue({
      items: mockPipelineItems,
    });
  });

  it('renders kanban columns and opportunity cards', async () => {
    render(<PipelineView />);

    await waitFor(() => {
      expect(screen.getByTestId('pipeline-board')).toBeInTheDocument();
    });

    expect(screen.getByTestId('pipeline-page')).toBeInTheDocument();
    expect(screen.getByText('Satış Pipeline')).toBeInTheDocument();
    expect(screen.getByTestId('pipeline-kpi-strip')).toBeInTheDocument();
    expect(screen.getByTestId('pipeline-column-proposal')).toBeInTheDocument();
    expect(screen.getByTestId('pipeline-card-opp-001')).toBeInTheDocument();
    expect(screen.getByText('Kurumsal CRM lisansı')).toBeInTheDocument();
    expect(screen.getByTestId('pipeline-api-notice')).toBeInTheDocument();
  });

  it('opens opportunity preview slide-over on card click', async () => {
    const user = userEvent.setup();
    render(<PipelineView />);

    await waitFor(() => {
      expect(screen.getByTestId('pipeline-card-opp-001')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('pipeline-card-opp-001'));

    expect(screen.getByTestId('pipeline-slide-over')).toBeInTheDocument();
    expect(screen.getByTestId('pipeline-opportunity-preview')).toBeInTheDocument();
    expect(screen.getByText('Demo görüşmesi')).toBeInTheDocument();
  });
});
