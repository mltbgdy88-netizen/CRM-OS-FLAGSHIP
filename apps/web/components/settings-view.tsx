'use client';

import { MockPreviewBadge } from './mock-preview-badge';

export function SettingsView() {
  return (
    <section className="workspace-card settings-page" data-testid="settings-page">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">Ayarlar</h1>
          <span className="entity-page__count">Workspace &amp; profil</span>
        </div>
        <MockPreviewBadge />
      </header>

      <div className="settings-sections">
        <article className="settings-card">
          <h2>Çalışma alanı</h2>
          <dl className="detail-info-grid">
            <div>
              <dt>Ad</dt>
              <dd>Default Workspace</dd>
            </div>
            <div>
              <dt>Slug</dt>
              <dd>default</dd>
            </div>
            <div>
              <dt>Plan</dt>
              <dd>
                <span className="status-pill status-pill--success">Enterprise</span>
              </dd>
            </div>
            <div>
              <dt>Tenant ID</dt>
              <dd className="data-table__muted">demo-tenant-001</dd>
            </div>
          </dl>
        </article>

        <article className="settings-card">
          <h2>Profil</h2>
          <div className="settings-profile">
            <span className="customer-detail-hero__avatar" aria-hidden>AY</span>
            <div>
              <p className="settings-profile__name">Ahmet Yılmaz</p>
              <p className="settings-profile__email">admin@default.local</p>
              <p className="settings-profile__role">Tenant Admin</p>
            </div>
          </div>
        </article>

        <article className="settings-card settings-card--disabled">
          <h2>Güvenlik</h2>
          <ul className="settings-disabled-list">
            <li>Şifre değiştirme — Sprint-11</li>
            <li>İki faktörlü doğrulama (2FA) — Sprint-11</li>
            <li>Oturum yönetimi — Sprint-11</li>
          </ul>
        </article>

        <article className="settings-card settings-card--disabled">
          <h2>Kullanıcılar &amp; Roller</h2>
          <p className="settings-card__hint">
            API mevcut (<code>GET /api/v1/users</code>) — yönetim UI Sprint-11 ile gelecek.
          </p>
          <button type="button" className="btn-ghost" disabled>
            Kullanıcıları yönet
          </button>
        </article>
      </div>

      <footer className="entity-footer">
        <p className="entity-footer__hint" data-testid="settings-mock-notice">
          Kısmi demo — tam ayarlar paneli Sprint-11 kapsamında.
        </p>
      </footer>
    </section>
  );
}
