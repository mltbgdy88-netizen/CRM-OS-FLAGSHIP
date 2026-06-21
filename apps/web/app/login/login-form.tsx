'use client';

import { FormEvent, useState } from 'react';
import { AuthClientError, login } from '../../lib/api/auth-client';
import { storeAccessToken } from '../../lib/auth/token-storage';

type FormStatus = 'idle' | 'loading' | 'validation_error' | 'auth_error' | 'network_error' | 'success';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState('default');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [tokenReceived, setTokenReceived] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setStatus('validation_error');
      return;
    }

    setStatus('loading');
    setSuccessEmail(null);
    setTokenReceived(false);

    try {
      const result = await login({ email: email.trim(), password, tenantSlug: tenantSlug.trim() });
      storeAccessToken(result.accessToken);
      setSuccessEmail(result.user.email);
      setTokenReceived(Boolean(result.accessToken));
      setStatus('success');
    } catch (error) {
      if (error instanceof AuthClientError) {
        setStatus(error.kind === 'network' ? 'network_error' : 'auth_error');
        return;
      }
      setStatus('network_error');
    }
  }

  const isLoading = status === 'loading';

  return (
    <div className="card login-card">
      <p className="security-warning" data-testid="token-storage-warning">
        Local dev only: access token is stored in sessionStorage (XSS risk). Do not use in
        production.
      </p>

      <form onSubmit={handleSubmit} aria-busy={isLoading} data-testid="login-form">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoading}
          data-testid="login-email"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoading}
          data-testid="login-password"
        />

        <label htmlFor="tenantSlug">Tenant slug</label>
        <input
          id="tenantSlug"
          name="tenantSlug"
          type="text"
          value={tenantSlug}
          onChange={(event) => setTenantSlug(event.target.value)}
          disabled={isLoading}
          data-testid="login-tenant-slug"
        />

        <button type="submit" disabled={isLoading} data-testid="login-submit">
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {status === 'validation_error' && (
        <p className="form-message form-message--error" role="alert" data-testid="login-validation-error">
          Email and password are required.
        </p>
      )}

      {status === 'auth_error' && (
        <p className="form-message form-message--error" role="alert" data-testid="login-auth-error">
          Invalid credentials or tenant.
        </p>
      )}

      {status === 'network_error' && (
        <p className="form-message form-message--error" role="alert" data-testid="login-network-error">
          Network error. Check API connectivity and try again.
        </p>
      )}

      {status === 'success' && (
        <p className="form-message form-message--success" role="status" data-testid="login-success">
          Signed in as {successEmail}. Access token stored for local dev.
          {tokenReceived && (
            <span data-testid="login-token-received"> Token received.</span>
          )}
        </p>
      )}
    </div>
  );
}
