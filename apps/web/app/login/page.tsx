import Link from 'next/link';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="login-page login-page--nexora" data-testid="login-page">
      <div className="login-page__backdrop" aria-hidden />
      <section className="login-page__center">
        <div className="login-page__panel-card">
          <p className="login-page__brand">NEXORA</p>
          <h2>Sign in</h2>
          <p className="login-page__panel-sub">Workspace access for your team</p>
          <LoginForm />
          <p className="login-page__back">
            <Link href="/">Back to home</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
