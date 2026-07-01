import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AiCopilotView } from '../components/ai-copilot-view';
import { ReportsView } from '../components/reports-view';
import { TaskListView } from '../components/task-list-view';

describe('TaskListView', () => {
  it('renders mock task list', () => {
    render(<TaskListView />);
    expect(screen.getByTestId('task-list')).toBeInTheDocument();
    expect(screen.getByText('Görevler')).toBeInTheDocument();
    expect(screen.getByTestId('task-row-task-001')).toBeInTheDocument();
  });
});

describe('AiCopilotView', () => {
  it('responds to suggested query', async () => {
    const user = userEvent.setup();
    render(<AiCopilotView />);

    await user.click(screen.getByRole('button', { name: 'Pipeline forecast özeti' }));

    expect(screen.getByText(/Açık pipeline değeri/)).toBeInTheDocument();
  });
});

describe('ReportsView', () => {
  it('renders sales tab with charts', () => {
    render(<ReportsView />);
    expect(screen.getByTestId('reports-page')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-revenue-chart')).toBeInTheDocument();
    expect(screen.getByTestId('reports-donut')).toBeInTheDocument();
  });

  it('switches to team tab', async () => {
    const user = userEvent.setup();
    render(<ReportsView />);

    await user.click(screen.getByRole('button', { name: 'Ekip' }));
    expect(screen.getByTestId('reports-team-table')).toBeInTheDocument();
    expect(screen.getByText('Selin Yılmaz')).toBeInTheDocument();
  });
});
