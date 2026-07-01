import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardView } from '../components/dashboard-view';

describe('DashboardView', () => {
  it('renders mock dashboard sections', () => {
    render(<DashboardView />);

    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    expect(screen.getByText('Gösterge Paneli')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-revenue-chart')).toBeInTheDocument();
    expect(screen.getByText('Canlı önizleme')).toBeInTheDocument();
    expect(screen.getByText('₺2.4M')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-pipeline')).toBeInTheDocument();
    expect(screen.getByText('Son Aktiviteler')).toBeInTheDocument();
    expect(screen.getByText('AI Asistan')).toBeInTheDocument();
  });
});
