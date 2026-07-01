'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AuthClientError, login } from '../../lib/api/auth-client';
import { storeAccessToken } from '../../lib/auth/token-storage';

type FormStatus = 'idle' | 'loading' | 'validation_error' | 'auth_error' | 'network_error' | 'success';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState('default');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
      router.push('/customers');
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
    <div className="login-card">
      <p className="security-warning" data-testid="token-storage-warning">
        Yerel geliştirme: token sessionStorage&apos;da tutulur (XSS riski). Prodüksiyonda
        kullanmayın.
      </p>

      <form onSubmit={handleSubmit} aria-busy={isLoading} data-testid="login-form">
        <label htmlFor="email">E-posta</label>
        <div className="login-field">
          <span className="login-field__icon" aria-hidden>
            @
          </span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="admin@default.local"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading}
            data-testid="login-email"
          />
        </div>

        <label htmlFor="password">Şifre</label>
        <div className="login-field">
          <span className="login-field__icon" aria-hidden>
            ◆
          </span>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
            data-testid="login-password"
          />
          <button
            type="button"
            className="login-field__toggle"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
          >
            {showPassword ? '◉' : '○'}
          </button>
        </div>

        <label htmlFor="tenantSlug">Çalışma alanı (tenant)</label>
        <div className="login-field">
          <span className="login-field__icon" aria-hidden>
            ⌂
          </span>
          <input
            id="tenantSlug"
            name="tenantSlug"
            type="text"
            value={tenantSlug}
            onChange={(event) => setTenantSlug(event.target.value)}
            disabled={isLoading}
            data-testid="login-tenant-slug"
          />
        </div>

        <div className="login-form__row">
          <label className="login-form__remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              disabled={isLoading}
            />
            Beni hatırla
          </label>
          <span className="login-form__forgot">Şifremi unuttum?</span>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary btn-primary--full" data-testid="login-submit">
          {isLoading ? 'Giriş yapılıyor…' : 'Giriş Yap →'}
        </button>
      </form>

      {status === 'validation_error' && (
        <p className="form-message form-message--error" role="alert" data-testid="login-validation-error">
          E-posta ve şifre zorunludur.
        </p>
      )}

      {status === 'auth_error' && (
        <p className="form-message form-message--error" role="alert" data-testid="login-auth-error">
          Geçersiz kimlik bilgileri veya tenant.
        </p>
      )}

      {status === 'network_error' && (
        <p className="form-message form-message--error" role="alert" data-testid="login-network-error">
          Ağ hatası. API bağlantısını kontrol edin.
        </p>
      )}

      {status === 'success' && (
        <p className="form-message form-message--success" role="status" data-testid="login-success">
          {successEmail} olarak giriş yapıldı.
          {tokenReceived && (
            <span data-testid="login-token-received"> Token alındı.</span>
          )}
        </p>
      )}
    </div>
  );
}
