import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskListView } from '../components/task-list-view';

vi.mock('../lib/api/tasks-client', () => ({
  listTasks: vi.fn(),
  createActivity: vi.fn(),
}));

import { listTasks } from '../lib/api/tasks-client';

const mockTaskItems = [
  {
    id: 'task-001',
    title: 'Acme demo görüşmesi hazırlığı',
    description: null,
    priority: 'high' as const,
    status: 'in_progress' as const,
    dueAt: '2026-06-21T10:00:00Z',
    relatedType: 'customer',
    relatedId: 'cust-1',
    assignedUserId: 'user-1',
    assignees: [{ userId: 'user-1', isPrimary: true }],
    createdAt: '2026-06-18T10:00:00Z',
    updatedAt: null,
    version: 1,
  },
  {
    id: 'task-002',
    title: 'Beta Yazılım teklif revizyonu',
    description: null,
    priority: 'high' as const,
    status: 'pending' as const,
    dueAt: '2026-06-22T14:00:00Z',
    relatedType: 'customer',
    relatedId: 'cust-2',
    assignedUserId: 'user-2',
    assignees: [{ userId: 'user-2', isPrimary: true }],
    createdAt: '2026-06-16T14:30:00Z',
    updatedAt: null,
    version: 1,
  },
];

describe('TaskListView', () => {
  beforeEach(() => {
    vi.mocked(listTasks).mockReset();
    vi.mocked(listTasks).mockResolvedValue({
      items: mockTaskItems,
      total: 2,
      page: 1,
      pageSize: 50,
    });
  });

  it('renders task list with table rows', async () => {
    render(<TaskListView />);

    await waitFor(() => {
      expect(screen.getByTestId('task-list-items')).toBeInTheDocument();
    });

    expect(screen.getByTestId('task-list')).toBeInTheDocument();
    expect(screen.getByText('Görevler')).toBeInTheDocument();
    expect(screen.getByTestId('task-row-task-001')).toBeInTheDocument();
    expect(screen.getByText('Acme demo görüşmesi hazırlığı')).toBeInTheDocument();
    expect(screen.getByText('Beta Yazılım teklif revizyonu')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-lite-panel')).toBeInTheDocument();
    expect(screen.getByTestId('activity-composer')).toBeInTheDocument();
  });

  it('filters tasks by search query', async () => {
    const user = userEvent.setup();
    render(<TaskListView />);

    await waitFor(() => {
      expect(screen.getByText('Acme demo görüşmesi hazırlığı')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Görev ara'), 'Beta');

    expect(screen.queryByText('Acme demo görüşmesi hazırlığı')).not.toBeInTheDocument();
    expect(screen.getByText('Beta Yazılım teklif revizyonu')).toBeInTheDocument();
  });
});
