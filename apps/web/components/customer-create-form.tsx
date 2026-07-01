'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCustomer } from '../lib/api/customers-client';

interface CustomerCreateFormProps {
  variant?: 'page' | 'modal';
  onCancel?: () => void;
  onSuccess?: (customerId: string) => void;
}

export function CustomerCreateForm({
  variant = 'page',
  onCancel,
  onSuccess,
}: CustomerCreateFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    try {
      const customer = await createCustomer({
        displayName,
        email: email || undefined,
        phone: phone || undefined,
      });
      if (onSuccess) {
        onSuccess(customer.id);
        return;
      }
      router.push(`/customers/${customer.id}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Kayıt oluşturulamadı');
      setSubmitting(false);
    }
  }

  const formBody = (
    <>
      <div className="create-form__steps" aria-hidden>
        <span className="create-form__step create-form__step--active">1. Temel bilgi</span>
        <span className="create-form__step">2. İletişim</span>
        <span className="create-form__step">3. Özet</span>
      </div>
      <form onSubmit={handleSubmit} className="customer-create-form">
        <label htmlFor="create-display-name">Müşteri adı</label>
        <input
          id="create-display-name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Örn. Acme Teknoloji A.Ş."
          required
          data-testid="customer-create-display-name"
        />
        <label htmlFor="create-email">E-posta</label>
        <input
          id="create-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="info@sirket.com"
          data-testid="customer-create-email"
        />
        <label htmlFor="create-phone">Telefon</label>
        <input
          id="create-phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+90 555 000 0000"
          data-testid="customer-create-phone"
        />
        <div className="form-actions">
          {variant === 'modal' && onCancel ? (
            <button type="button" className="btn-ghost" onClick={onCancel}>
              İptal
            </button>
          ) : null}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Kaydediliyor…' : 'Kaydet ve devam et'}
          </button>
        </div>
      </form>
      {errorMessage && (
        <p className="form-message form-message--error" data-testid="customer-create-error">
          {errorMessage}
        </p>
      )}
    </>
  );

  if (variant === 'modal') {
    return <div data-testid="customer-create-form">{formBody}</div>;
  }

  return (
    <section className="workspace-card entity-page customer-create-page" data-testid="customer-create-form">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">Yeni Müşteri</h1>
          <span className="entity-page__count">Adım 1 / 3</span>
        </div>
      </header>
      <div className="customer-create-page__body">
        <div className="customer-create-page__form">{formBody}</div>
        <aside className="customer-create-page__hint card">
          <h2>Bilgi</h2>
          <p>
            Müşteri kaydı oluşturduktan sonra 360° görünüm, zaman çizelgesi ve AI önerileri bu
            profilde görüntülenir.
          </p>
          <p>
            <Link href="/customers">← Müşteri listesine dön</Link>
          </p>
        </aside>
      </div>
    </section>
  );
}
