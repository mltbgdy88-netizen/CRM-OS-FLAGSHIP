import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { LeadDetailView } from '../components/lead-detail-view';
import { LeadListView } from '../components/lead-list-view';

describe('LeadListView', () => {
  it('renders mock lead list with filters and KPI strip', () => {
    render(<LeadListView />);

    expect(screen.getByTestId('lead-list')).toBeInTheDocument();
    expect(screen.getByText('Leadler')).toBeInTheDocument();
    expect(screen.getByText('Canlı önizleme')).toBeInTheDocument();
    expect(screen.getByTestId('lead-kpi-strip')).toBeInTheDocument();
    expect(screen.getByTestId('lead-list-items')).toBeInTheDocument();
    expect(screen.getByTestId('lead-row-lead-001')).toBeInTheDocument();
    expect(screen.getByText('Elif Demir')).toBeInTheDocument();
  });

  it('filters leads by search query', async () => {
    const user = userEvent.setup();
    render(<LeadListView />);

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
