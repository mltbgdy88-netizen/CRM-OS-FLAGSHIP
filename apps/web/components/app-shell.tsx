'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { MAIN_MENU, MENU_SECTION_LABELS, type MainMenuItem } from '../lib/navigation/main-menu';
import { clearAccessToken, getAccessToken } from '../lib/auth/token-storage';
import { NavIcon } from './nav-icon';

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

function pageTitle(pathname: string) {
  if (pathname.startsWith('/dashboard')) {
    return 'Gösterge Paneli';
  }
  if (pathname.startsWith('/customers/new')) {
    return 'Yeni Müşteri';
  }
  if (pathname.startsWith('/customers/')) {
    return 'Müşteri Detayı';
  }
  if (pathname.startsWith('/customers')) {
    return 'Müşteriler';
  }
  if (pathname.startsWith('/leads/')) {
    return 'Lead Detayı';
  }
  if (pathname.startsWith('/leads')) {
    return 'Leadler';
  }
  if (pathname.startsWith('/pipeline')) {
    return 'Pipeline';
  }
  return 'CRM OS';
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'required'>(
    'checking',
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuGroups = useMemo(() => groupMenuBySection(MAIN_MENU), []);
  const title = pageTitle(pathname);

  useEffect(() => {
    setAuthState(getAccessToken() ? 'authenticated' : 'required');
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === '1') {
      setSidebarCollapsed(true);
    }
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
        <p>Oturum kontrol ediliyor…</p>
      </div>
    );
  }

  if (authState === 'required') {
    return (
      <div className="app-shell app-shell--auth-required" data-testid="app-shell-auth-required">
        <h1>Giriş gerekli</h1>
        <p>Müşteri ekranlarına erişmek için oturum açın.</p>
        <Link href="/login">Giriş sayfasına git</Link>
      </div>
    );
  }

  return (
    <div
      className={
        sidebarCollapsed
          ? 'app-shell app-shell--premium app-shell--collapsed'
          : 'app-shell app-shell--premium'
      }
      data-testid="app-shell"
    >
      <div className="app-shell__ambient" aria-hidden />

      <aside className="app-shell__sidebar" aria-label="Ana menü">
        <div className="app-shell__brand" data-testid="app-shell-brand">
          <span className="app-shell__brand-mark" aria-hidden>
            C
          </span>
          {!sidebarCollapsed ? <span className="app-shell__brand-text">CRM OS</span> : null}
        </div>

        <button
          type="button"
          className="app-shell__collapse-btn"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
          data-testid="app-shell-sidebar-toggle"
        >
          {sidebarCollapsed ? '»' : '«'}
        </button>

        {menuGroups.map((group) => (
          <div key={group.section} className="app-shell__nav-group">
            {!sidebarCollapsed ? (
              <p className="app-shell__nav-group-label">{group.label}</p>
            ) : null}
            <nav className="app-shell__sidebar-nav" aria-label={group.label}>
              {group.items.map((item) => {
                const isActive = item.href ? pathname.startsWith(item.href) : false;
                const isDisabled = item.status === 'soon' || !item.href;

                if (isDisabled) {
                  return (
                    <span
                      key={item.id}
                      className="app-shell__nav-item app-shell__nav-item--soon"
                      title={`${item.label} — yakında`}
                      data-testid={`nav-soon-${item.id}`}
                    >
                      <NavIcon name={item.id} />
                      {!sidebarCollapsed ? <span>{item.label}</span> : null}
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
                    <NavIcon name={item.id} />
                    {!sidebarCollapsed ? <span>{item.label}</span> : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        <div className="app-shell__sidebar-footer">
          <div className="app-shell__user">
            <span className="app-shell__user-avatar" aria-hidden>
              AY
            </span>
            {!sidebarCollapsed ? (
              <div className="app-shell__user-meta">
                <span className="app-shell__user-name">Ahmet Yılmaz</span>
                <span className="app-shell__user-email">admin@default.local</span>
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      <div className="app-shell__main">
        <header className="app-shell__topbar">
          <div className="app-shell__breadcrumb">
            <span className="app-shell__breadcrumb-root">CRM OS</span>
            <span className="app-shell__breadcrumb-sep">/</span>
            <span className="app-shell__breadcrumb-current">{title}</span>
          </div>

          <div className="app-shell__search-wrap">
            <span className="app-shell__search-icon" aria-hidden>
              ⌕
            </span>
            <input
              type="search"
              placeholder="Ara…"
              aria-label="Global arama"
              disabled
              className="app-shell__search-input"
            />
            <kbd className="app-shell__search-kbd">⌘K</kbd>
          </div>

          <div className="app-shell__topbar-actions">
            <button type="button" className="app-shell__workspace-pill" disabled>
              Default Workspace
              <span className="app-shell__workspace-plan">Enterprise</span>
            </button>
            <button type="button" className="app-shell__icon-btn" disabled aria-label="Bildirimler">
              ◉
              <span className="app-shell__icon-badge">3</span>
            </button>
            <button type="button" className="app-shell__icon-btn" disabled aria-label="Yardım">
              ?
            </button>
            <Link
              href="/customers/new"
              className="app-shell__create-btn"
              aria-label="Yeni kayıt"
              title="Yeni kayıt"
            >
              +
            </Link>
            <button
              type="button"
              className="app-shell__profile"
              onClick={handleSignOut}
              data-testid="app-shell-sign-out"
              title="Çıkış yap"
            >
              AY
            </button>
          </div>
        </header>

        <div className="app-shell__content">
          <div key={pathname} className="app-shell__content-inner">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
