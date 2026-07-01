import { CRM_OS_SERVICE_NAME, CRM_OS_VERSION } from '@crm-os/shared';
import Link from 'next/link';

export default function HealthPage() {
  return (
    <main className="public-page" data-testid="health-page">
      <div className="public-page__card">
        <p className="login-page__brand">CRM OS</p>
        <h1>Sistem Durumu</h1>
        <p className="login-page__panel-sub">Web ve API sağlık özeti</p>
        <div className="health-status-grid">
          <article className="health-status-card health-status-card--ok">
            <span className="health-status-card__dot" aria-hidden />
            <div>
              <p className="health-status-card__label">Web</p>
              <p className="health-status-card__value">Çalışıyor</p>
            </div>
          </article>
          <article className="health-status-card">
            <span className="health-status-card__dot health-status-card__dot--muted" aria-hidden />
            <div>
              <p className="health-status-card__label">Servis</p>
              <p className="health-status-card__value">{CRM_OS_SERVICE_NAME}</p>
            </div>
          </article>
          <article className="health-status-card">
            <span className="health-status-card__dot health-status-card__dot--muted" aria-hidden />
            <div>
              <p className="health-status-card__label">Sürüm</p>
              <p className="health-status-card__value">{CRM_OS_VERSION}</p>
            </div>
          </article>
        </div>
        <p className="health-page__hint">
          API sağlığı ayrı uç noktada: <code>http://localhost:3001/health</code>
        </p>
        <p className="public-page__links">
          <Link href="/">← Ana sayfa</Link>
        </p>
      </div>
    </main>
  );
}
