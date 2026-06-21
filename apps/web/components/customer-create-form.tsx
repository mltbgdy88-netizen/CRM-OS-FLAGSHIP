'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCustomer } from '../lib/api/customers-client';

export function CustomerCreateForm() {
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
      router.push(`/customers/${customer.id}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Create failed');
      setSubmitting(false);
    }
  }

  return (
    <section className="card" data-testid="customer-create-form">
      <h1>New customer</h1>
      <p>
        <Link href="/customers">← Back to customers</Link>
      </p>
      <form onSubmit={handleSubmit}>
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
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create customer'}
        </button>
      </form>
      {errorMessage && (
        <p className="form-message form-message--error" data-testid="customer-create-error">
          {errorMessage}
        </p>
      )}
    </section>
  );
}
