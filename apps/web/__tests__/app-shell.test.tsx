import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AppShell } from '../components/app-shell';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../lib/auth/token-storage', () => ({
  getAccessToken: vi.fn(),
  clearAccessToken: vi.fn(),
}));

import { getAccessToken } from '../lib/auth/token-storage';

describe('AppShell', () => {
  beforeEach(() => {
    vi.mocked(getAccessToken).mockReset();
  });

  it('shows auth-required state without token', async () => {
    vi.mocked(getAccessToken).mockReturnValue(null);
    render(
      <AppShell>
        <div>Protected</div>
      </AppShell>,
    );

    expect(await screen.findByTestId('app-shell-auth-required')).toBeInTheDocument();
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
  });

  it('renders shell navigation when token exists', async () => {
    vi.mocked(getAccessToken).mockReturnValue('token');
    render(
      <AppShell>
        <div>Protected content</div>
      </AppShell>,
    );

    expect(await screen.findByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(screen.getByTestId('app-shell-sign-out')).toBeInTheDocument();
  });
});
