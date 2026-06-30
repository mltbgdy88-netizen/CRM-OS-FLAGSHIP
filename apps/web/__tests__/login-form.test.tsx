import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { LoginForm } from '../app/login/login-form';
import { AuthClientError } from '../lib/api/auth-client';

vi.mock('../lib/api/auth-client', () => ({
  login: vi.fn(),
  AuthClientError: class AuthClientError extends Error {
    status: number;
    kind: 'auth' | 'network' | 'unknown';
    constructor(message: string, status: number, kind: 'auth' | 'network' | 'unknown') {
      super(message);
      this.status = status;
      this.kind = kind;
    }
  },
}));

vi.mock('../lib/auth/token-storage', () => ({
  storeAccessToken: vi.fn(),
}));

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

import { login } from '../lib/api/auth-client';
import { storeAccessToken } from '../lib/auth/token-storage';

describe('LoginForm', () => {
  beforeEach(() => {
    vi.mocked(login).mockReset();
    vi.mocked(storeAccessToken).mockReset();
    push.mockReset();
  });

  it('renders login form fields', () => {
    render(<LoginForm />);

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByTestId('login-email')).toBeInTheDocument();
    expect(screen.getByTestId('login-password')).toBeInTheDocument();
    expect(screen.getByTestId('login-tenant-slug')).toHaveValue('default');
    expect(screen.getByTestId('token-storage-warning')).toBeInTheDocument();
  });

  it('submits login payload', async () => {
    vi.mocked(login).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      tenantId: 'tenant-1',
      user: {
        id: 'user-1',
        email: 'admin@default.local',
        firstName: 'Default',
        lastName: 'Admin',
      },
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByTestId('login-email'), 'admin@default.local');
    await user.type(screen.getByTestId('login-password'), 'Admin123!');
    await user.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'admin@default.local',
        password: 'Admin123!',
        tenantSlug: 'default',
      });
    });
  });

  it('shows loading state while submitting', async () => {
    let resolveLogin!: (value: Awaited<ReturnType<typeof login>>) => void;
    vi.mocked(login).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        }),
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByTestId('login-email'), 'admin@default.local');
    await user.type(screen.getByTestId('login-password'), 'Admin123!');
    await user.click(screen.getByTestId('login-submit'));

    expect(screen.getByTestId('login-submit')).toHaveTextContent('Signing in…');
    expect(screen.getByTestId('login-submit')).toBeDisabled();

    resolveLogin({
      accessToken: 'token',
      refreshToken: 'refresh',
      tokenType: 'Bearer',
      tenantId: 't1',
      user: { id: '1', email: 'a@b.c', firstName: 'A', lastName: 'B' },
    });

    await waitFor(() => {
      expect(screen.getByTestId('login-success')).toBeInTheDocument();
    });
  });

  it('shows auth error state', async () => {
    vi.mocked(login).mockRejectedValue(new AuthClientError('Invalid credentials or tenant.', 401, 'auth'));

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByTestId('login-email'), 'bad@example.com');
    await user.type(screen.getByTestId('login-password'), 'wrong');
    await user.click(screen.getByTestId('login-submit'));

    expect(await screen.findByTestId('login-auth-error')).toHaveTextContent(
      'Invalid credentials or tenant.',
    );
  });

  it('redirects to customers and stores access token on success', async () => {
    vi.mocked(login).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      tenantId: 'tenant-1',
      user: {
        id: 'user-1',
        email: 'admin@default.local',
        firstName: 'Default',
        lastName: 'Admin',
      },
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByTestId('login-email'), 'admin@default.local');
    await user.type(screen.getByTestId('login-password'), 'Admin123!');
    await user.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(storeAccessToken).toHaveBeenCalledWith('access-token');
      expect(push).toHaveBeenCalledWith('/customers');
    });
  });
});
