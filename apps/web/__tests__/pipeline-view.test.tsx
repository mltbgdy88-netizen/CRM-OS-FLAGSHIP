import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PipelineView } from '../components/pipeline-view';

describe('PipelineView', () => {
  it('renders kanban columns and opportunity cards', () => {
    render(<PipelineView />);

    expect(screen.getByTestId('pipeline-page')).toBeInTheDocument();
    expect(screen.getByText('Satış Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Canlı önizleme')).toBeInTheDocument();
    expect(screen.getByTestId('pipeline-board')).toBeInTheDocument();
    expect(screen.getByTestId('pipeline-column-proposal')).toBeInTheDocument();
    expect(screen.getByTestId('pipeline-card-opp-001')).toBeInTheDocument();
    expect(screen.getByText('Kurumsal CRM lisansı')).toBeInTheDocument();
  });

  it('opens opportunity preview slide-over on card click', async () => {
    const user = userEvent.setup();
    render(<PipelineView />);

    await user.click(screen.getByTestId('pipeline-card-opp-001'));

    expect(screen.getByTestId('pipeline-slide-over')).toBeInTheDocument();
    expect(screen.getByTestId('pipeline-opportunity-preview')).toBeInTheDocument();
    expect(screen.getByText('Demo görüşmesi')).toBeInTheDocument();
  });
});
