'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { clearAccessToken, getAccessToken } from '../lib/auth/token-storage';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'required'>(
    'checking',
  );

  useEffect(() => {
    setAuthState(getAccessToken() ? 'authenticated' : 'required');
  }, []);

  function handleSignOut() {
    clearAccessToken();
    router.push('/login');
  }

  if (authState === 'checking') {
    return (
      <div className="app-shell" data-testid="app-shell-loading">
        <p>Checking session…</p>
      </div>
    );
  }

  if (authState === 'required') {
    return (
      <div className="app-shell" data-testid="app-shell-auth-required">
        <h1>Sign in required</h1>
        <p>You must sign in to access customer screens.</p>
        <Link href="/login">Go to login</Link>
      </div>
    );
  }

  return (
    <div className="app-shell" data-testid="app-shell">
      <aside className="app-shell__sidebar" aria-label="Primary navigation">
        <div className="app-shell__brand">CRM OS</div>
        <nav className="app-shell__sidebar-nav">
          <Link href="/customers">Customers</Link>
          <Link href="/health">Health</Link>
        </nav>
      </aside>
      <div className="app-shell__main">
        <header className="app-shell__topbar">
          <div className="app-shell__topbar-title">Workspace</div>
          <div className="app-shell__topbar-actions">
            <span className="app-shell__tenant">default</span>
            <button type="button" onClick={handleSignOut} data-testid="app-shell-sign-out">
              Sign out
            </button>
          </div>
        </header>
        <div className="app-shell__content">{children}</div>
      </div>
    </div>
  );
}
