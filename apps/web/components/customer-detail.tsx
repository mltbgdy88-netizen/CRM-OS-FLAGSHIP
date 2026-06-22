'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import {
  getCustomer,
  updateCustomer,
  type CustomerDetail,
} from '../lib/api/customers-client';

interface CustomerDetailViewProps {
  customerId: string;
}

export function CustomerDetailView({ customerId }: CustomerDetailViewProps) {
  const [state, setState] = useState<'loading' | 'error' | 'forbidden' | 'success'>('loading');
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [editName, setEditName] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState('loading');
      try {
        const result = await getCustomer(customerId);
        if (cancelled) {
          return;
        }
        setCustomer(result);
        setEditName(result.displayName);
        setState('success');
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiClientError && error.kind === 'forbidden') {
          setState('forbidden');
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load customer');
        setState('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  async function handleUpdate(event: FormEvent) {
    event.preventDefault();
    setSaveMessage('');
    try {
      const updated = await updateCustomer(customerId, { displayName: editName });
      setCustomer((current) => (current ? { ...current, ...updated } : current));
      setSaveMessage('Customer updated.');
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Update failed');
    }
  }

  if (state === 'loading') {
    return (
      <p className="state-message" data-testid="customer-detail-loading">
        Loading customer…
      </p>
    );
  }

  if (state === 'forbidden') {
    return (
      <p className="state-message state-message--error" data-testid="customer-detail-forbidden">
        You do not have permission to view this customer.
      </p>
    );
  }

  if (state === 'error' || !customer) {
    return (
      <p className="state-message state-message--error" data-testid="customer-detail-error">
        {errorMessage}
      </p>
    );
  }

  return (
    <section data-testid="customer-detail">
      <p>
        <Link href="/customers">← Back to customers</Link>
      </p>
      <h1>{customer.displayName}</h1>
      <p>
        {customer.email ?? '—'} · {customer.phone ?? '—'} · {customer.status}
      </p>

      <form className="card edit-form" onSubmit={handleUpdate} data-testid="customer-edit-form">
        <h2>Edit core fields</h2>
        <label htmlFor="customer-display-name">Display name</label>
        <input
          id="customer-display-name"
          value={editName}
          onChange={(event) => setEditName(event.target.value)}
          data-testid="customer-edit-display-name"
        />
        <button type="submit">Save</button>
        {saveMessage && <p className="form-message">{saveMessage}</p>}
      </form>

      <section className="card" data-testid="customer-360-contacts">
        <h2>Contacts</h2>
        {customer.contacts.length === 0 ? (
          <p>No contacts</p>
        ) : (
          <ul>
            {customer.contacts.map((contact) => (
              <li key={contact.id}>
                {contact.firstName} {contact.lastName} · {contact.email ?? '—'}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card" data-testid="customer-360-addresses">
        <h2>Addresses</h2>
        {customer.addresses.length === 0 ? (
          <p>No addresses</p>
        ) : (
          <ul>
            {customer.addresses.map((address) => (
              <li key={address.id}>
                {address.line1}, {address.city ?? '—'}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card" data-testid="customer-360-tags">
        <h2>Tags</h2>
        {customer.tags.length === 0 ? (
          <p>No tags</p>
        ) : (
          <ul>
            {customer.tags.map((tag) => (
              <li key={tag.id}>{tag.name}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="card" data-testid="customer-360-notes">
        <h2>Notes</h2>
        {customer.notes.length === 0 ? (
          <p>No notes</p>
        ) : (
          <ul>
            {customer.notes.map((note) => (
              <li key={note.id}>
                <strong>{note.title ?? 'Note'}</strong>: {note.body}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card" data-testid="customer-360-files">
        <h2>Files (metadata only)</h2>
        {customer.files.length === 0 ? (
          <p>No files</p>
        ) : (
          <ul>
            {customer.files.map((file) => (
              <li key={file.id}>
                {file.fileName} · {file.mimeType ?? 'unknown'} · {file.byteSize ?? 0} bytes
              </li>
            ))}
          </ul>
        )}
        <p data-testid="no-file-upload-control">Upload not available in Sprint-03.</p>
      </section>
    </section>
  );
}
