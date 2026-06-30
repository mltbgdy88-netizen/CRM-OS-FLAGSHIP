'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  MAIN_MENU,
  MENU_SECTION_LABELS,
  NAV_ICONS,
  type MainMenuItem,
} from '../lib/navigation/main-menu';
import { clearAccessToken, getAccessToken } from '../lib/auth/token-storage';
import { CrmSectionNav } from './crm-section-nav';
import { UtilityRail } from './utility-rail';

interface AppShellProps {
  children: ReactNode;
}

function groupMenuBySection(items: MainMenuItem[]) {
  const order: MainMenuItem['section'][] = [
    'workspace',
    'crm',
    'operations',
    'intelligence',
    'admin',
  ];
  return order
    .map((section) => ({
      section,
      label: MENU_SECTION_LABELS[section],
      items: items.filter((item) => item.section === section),
    }))
    .filter((group) => group.items.length > 0);
}

const SIDEBAR_COLLAPSED_KEY = 'crm-os-sidebar-collapsed';

function formatClock(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'required'>(
    'checking',
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [clock, setClock] = useState('');

  const menuGroups = useMemo(() => groupMenuBySection(MAIN_MENU), []);
  const showCrmNav = pathname.startsWith('/customers');

  useEffect(() => {
    setAuthState(getAccessToken() ? 'authenticated' : 'required');
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === '0') {
      setSidebarCollapsed(false);
    } else if (stored === '1') {
      setSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    setClock(formatClock(new Date()));
    const timer = window.setInterval(() => setClock(formatClock(new Date())), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;
      sessionStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      return next;
    });
  }

  function handleSignOut() {
    clearAccessToken();
    router.push('/login');
  }

  if (authState === 'checking') {
    return (
      <div className="app-shell app-shell--loading" data-testid="app-shell-loading">
        <p>Checking session…</p>
      </div>
    );
  }

  if (authState === 'required') {
    return (
      <div className="app-shell app-shell--auth-required" data-testid="app-shell-auth-required">
        <h1>Sign in required</h1>
        <p>You must sign in to access customer screens.</p>
        <Link href="/login">Go to login</Link>
      </div>
    );
  }

  return (
    <div
      className={
        sidebarCollapsed
          ? 'app-shell app-shell--space app-shell--collapsed'
          : 'app-shell app-shell--space'
      }
      data-testid="app-shell"
    >
      <div className="app-shell__space-bg" aria-hidden />
      <aside className="app-shell__sidebar" aria-label="Primary navigation">
        <button
          type="button"
          className="app-shell__collapse-btn"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
          data-testid="app-shell-sidebar-toggle"
        >
          {sidebarCollapsed ? '»' : '«'}
        </button>
        {menuGroups.map((group) => (
          <div key={group.section} className="app-shell__nav-group">
            <nav className="app-shell__sidebar-nav" aria-label={group.label}>
              {group.items.map((item) => {
                const isActive = item.href ? pathname.startsWith(item.href) : false;
                const isDisabled = item.status === 'soon' || !item.href;
                const icon = NAV_ICONS[item.id] ?? '•';

                if (isDisabled) {
                  return (
                    <span
                      key={item.id}
                      className="app-shell__nav-item app-shell__nav-item--soon"
                      title={`${item.label} — coming soon`}
                      data-testid={`nav-soon-${item.id}`}
                    >
                      <span className="app-shell__nav-icon" aria-hidden>
                        {icon}
                      </span>
                    </span>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={item.href!}
                    className={
                      isActive
                        ? 'app-shell__nav-item app-shell__nav-item--active'
                        : 'app-shell__nav-item'
                    }
                    title={item.label}
                    data-testid={`nav-${item.id}`}
                  >
                    <span className="app-shell__nav-icon" aria-hidden>
                      {icon}
                    </span>
                    {!sidebarCollapsed ? <span>{item.label}</span> : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
        <div className="app-shell__sidebar-footer">
          <button type="button" className="app-shell__upgrade-btn" disabled title="Coming soon">
            ✦
          </button>
          <span className="app-shell__user-avatar" title="Admin" aria-hidden>
            A
          </span>
        </div>
      </aside>

      <div className="app-shell__workspace">
        <header className="app-shell__topbar">
          <div className="app-shell__topbar-row">
            {showCrmNav ? (
              <CrmSectionNav />
            ) : (
              <span className="app-shell__topbar-title app-shell__topbar-title--solo">NEXORA</span>
            )}
            <div className="app-shell__topbar-utils">
            <input
              type="search"
              placeholder="Search CRM OS…"
              aria-label="Global search"
              disabled
              className="app-shell__search-input"
            />
            <button type="button" className="app-shell__util-link" disabled>
              Invite
            </button>
            <button type="button" className="btn-accent-green" disabled>
              Upgrade
            </button>
            <button type="button" className="app-shell__util-link app-shell__util-link--badge" disabled>
              Help
              <span className="app-shell__badge">1</span>
            </button>
            <time className="app-shell__clock">{clock}</time>
            <button
              type="button"
              className="app-shell__profile"
              onClick={handleSignOut}
              data-testid="app-shell-sign-out"
              title="Sign out"
            >
              A
            </button>
            </div>
          </div>
        </header>

        <div className="app-shell__content">
          <div key={pathname} className="app-shell__content-inner">
            {children}
          </div>
        </div>

        <footer className="app-shell__footer">
          <span>NEXORA CRM OS</span>
          <span>© 2026</span>
          <button type="button" disabled>
            Themes
          </button>
        </footer>
      </div>

      <UtilityRail />
    </div>
  );
}
