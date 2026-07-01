import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardView } from '../components/dashboard-view';

vi.mock('../lib/api/dashboard-client', () => ({
  getDashboard: vi.fn(),
}));

import { getDashboard } from '../lib/api/dashboard-client';

const mockDashboard = {
  id: '68100000-0000-4000-8000-000000000001',
  name: 'Gösterge Paneli',
  code: 'default',
  isDefault: true,
  layoutJson: { columns: 12 },
  kpis: {
    customers: 12,
    openOpportunities: 48,
    pendingTasks: 17,
    quoteTotal: '2400000.00',
  },
  widgets: [
    {
      id: '68200000-0000-4000-8000-000000000001',
      widgetType: 'kpi_revenue',
      title: 'Revenue KPI',
      configJson: {},
      sortOrder: 0,
      liveValue: '2400000.00',
    },
  ],
};

describe('DashboardView', () => {
  beforeEach(() => {
    vi.mocked(getDashboard).mockReset();
    vi.mocked(getDashboard).mockResolvedValue(mockDashboard);
  });

  it('renders dashboard sections with API-backed KPIs', async () => {
    render(<DashboardView />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    expect(screen.getByText('Gösterge Paneli')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-revenue-chart')).toBeInTheDocument();
    expect(screen.getByText('Canlı API')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-kpi-value-revenue')).toHaveAttribute(
        'data-value',
        '2400000',
      );
    });
    expect(screen.getByTestId('dashboard-pipeline')).toBeInTheDocument();
    expect(screen.getByText('Son Aktiviteler')).toBeInTheDocument();
    expect(screen.getByText('AI Asistan')).toBeInTheDocument();
  });
});
