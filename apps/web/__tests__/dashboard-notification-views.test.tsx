import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { DashboardView } from '../components/dashboard-view';
import { NotificationCenter } from '../components/notification-center';

vi.mock('../lib/api/dashboard-client', () => ({
  getDashboard: vi.fn(),
}));

vi.mock('../lib/api/notifications-client', () => ({
  listNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
}));

import { getDashboard } from '../lib/api/dashboard-client';
import { listNotifications, markNotificationRead } from '../lib/api/notifications-client';

const mockDashboard = {
  id: '68100000-0000-4000-8000-000000000001',
  name: 'Default Dashboard',
  code: 'default',
  isDefault: true,
  layoutJson: { columns: 12 },
  kpis: {
    customers: 12,
    openOpportunities: 8,
    pendingTasks: 5,
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

const mockNotifications = [
  {
    id: '68300000-0000-4000-8000-000000000001',
    title: 'Welcome to CRM OS',
    body: 'Your workspace dashboard is ready.',
    category: 'info',
    severity: 'normal',
    sourceType: null,
    sourceId: null,
    isRead: false,
    readAt: null,
    createdAt: '2026-06-30T10:00:00Z',
  },
  {
    id: '68300000-0000-4000-8000-000000000002',
    title: 'Pipeline update',
    body: 'A new opportunity entered the proposal stage.',
    category: 'sales',
    severity: 'normal',
    sourceType: null,
    sourceId: null,
    isRead: true,
    readAt: '2026-06-30T11:00:00Z',
    createdAt: '2026-06-29T10:00:00Z',
  },
];

describe('DashboardView (API)', () => {
  beforeEach(() => {
    vi.mocked(getDashboard).mockReset();
    vi.mocked(getDashboard).mockResolvedValue(mockDashboard);
  });

  it('renders dashboard with API KPI values', async () => {
    render(<DashboardView />);

    await waitFor(() => {
      expect(screen.getByText('Default Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-revenue-chart')).toBeInTheDocument();
    expect(screen.getByText('Canlı API')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-kpi-value-revenue')).toHaveAttribute(
        'data-value',
        '2400000',
      );
      expect(screen.getByTestId('dashboard-kpi-value-opportunities')).toHaveAttribute(
        'data-value',
        '8',
      );
    });
    expect(screen.getByTestId('dashboard-pipeline')).toBeInTheDocument();
  });

  it('shows forbidden state', async () => {
    vi.mocked(getDashboard).mockRejectedValue(
      new ApiClientError('Insufficient permissions', 403, 'forbidden'),
    );

    render(<DashboardView />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-forbidden')).toBeInTheDocument();
    });
  });

  it('shows empty state when dashboard has no data', async () => {
    vi.mocked(getDashboard).mockResolvedValue({
      ...mockDashboard,
      widgets: [],
      kpis: {
        customers: 0,
        openOpportunities: 0,
        pendingTasks: 0,
        quoteTotal: '0.00',
      },
    });

    render(<DashboardView />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-empty')).toBeInTheDocument();
    });
  });
});

describe('NotificationCenter', () => {
  beforeEach(() => {
    vi.mocked(listNotifications).mockReset();
    vi.mocked(markNotificationRead).mockReset();
    vi.mocked(listNotifications).mockResolvedValue({
      items: mockNotifications,
      total: 2,
      page: 1,
      pageSize: 50,
    });
  });

  it('renders notification list with Turkish labels', async () => {
    render(<NotificationCenter />);

    await waitFor(() => {
      expect(screen.getByTestId('notification-center-list')).toBeInTheDocument();
    });

    expect(screen.getByText('Bildirimler')).toBeInTheDocument();
    expect(screen.getByText('Welcome to CRM OS')).toBeInTheDocument();
    expect(screen.getByText('Bilgi')).toBeInTheDocument();
    expect(screen.getByText('Satış')).toBeInTheDocument();
    expect(screen.getByTestId('notification-unread-count')).toHaveTextContent('1 okunmamış');
  });

  it('marks notification read on click', async () => {
    const user = userEvent.setup();
    vi.mocked(markNotificationRead).mockResolvedValue({
      ...mockNotifications[0],
      isRead: true,
      readAt: '2026-06-30T12:00:00Z',
    });

    render(<NotificationCenter />);

    await waitFor(() => {
      expect(screen.getByTestId('notification-item-68300000-0000-4000-8000-000000000001')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('notification-item-68300000-0000-4000-8000-000000000001'));

    await waitFor(() => {
      expect(markNotificationRead).toHaveBeenCalledWith('68300000-0000-4000-8000-000000000001');
    });

    expect(
      screen.getByTestId('notification-item-68300000-0000-4000-8000-000000000001'),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows forbidden state', async () => {
    vi.mocked(listNotifications).mockRejectedValue(
      new ApiClientError('Insufficient permissions', 403, 'forbidden'),
    );

    render(<NotificationCenter />);

    await waitFor(() => {
      expect(screen.getByTestId('notification-center-forbidden')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    vi.mocked(listNotifications).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
    });

    render(<NotificationCenter />);

    await waitFor(() => {
      expect(screen.getByTestId('notification-center-empty')).toBeInTheDocument();
    });
  });
});
