import Link from 'next/link';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="login-page login-page--premium-dark" data-testid="login-page">
      <section className="login-page__hero" aria-label="CRM OS">
        <div className="login-page__hero-brand">
          <span className="login-page__hero-mark" aria-hidden>
            C
          </span>
          <div>
            <p className="login-page__hero-title">CRM OS</p>
            <p className="login-page__hero-tagline">Akıllı CRM İşletim Sistemi</p>
          </div>
        </div>
        <p className="login-page__hero-headline">
          Müşterilerinizi anlayın, ilişkilerinizi büyütün.
        </p>
      </section>
      <section className="login-page__form-col">
        <div className="login-page__panel-card">
          <p className="login-page__brand">CRM OS</p>
          <h2>Hoş geldiniz!</h2>
          <p className="login-page__panel-sub">Çalışma alanınıza giriş yapın</p>
          <LoginForm />
          <p className="login-page__back">
            <Link href="/">Ana sayfaya dön</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
