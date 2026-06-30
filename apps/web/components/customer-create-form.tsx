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
      });
      if (onSuccess) {
        onSuccess(customer.id);
        return;
      }
      router.push(`/customers/${customer.id}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Create failed');
      setSubmitting(false);
    }
  }

  const formBody = (
  <>
      <form onSubmit={handleSubmit} className="customer-create-form">
        <label htmlFor="create-display-name">Display name</label>
        <input
          id="create-display-name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          required
          data-testid="customer-create-display-name"
        />
        <label htmlFor="create-email">Email</label>
        <input
          id="create-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          data-testid="customer-create-email"
        />
        <div className="form-actions">
          {variant === 'modal' && onCancel ? (
            <button type="button" className="btn-ghost" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create customer'}
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
    return (
      <div data-testid="customer-create-form">
        {formBody}
      </div>
    );
  }

  return (
    <section className="card crm-page" data-testid="customer-create-form">
      <h1>New customer</h1>
      <p>
        <Link href="/customers">← Back to customers</Link>
      </p>
      {formBody}
    </section>
  );
}
