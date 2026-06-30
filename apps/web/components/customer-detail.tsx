'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import {
  getCustomer360,
  type Customer360View,
} from '../lib/api/customer-360-client';
import { getCustomer, type CustomerDetail } from '../lib/api/customers-client';
import { AiAssistDock } from './ai-assist-dock';
import { CustomerTimelineSection } from './customer-timeline';

interface CustomerDetailViewProps {
  customerId: string;
}

type View360State = 'loading' | 'error' | 'forbidden' | 'empty' | 'success';

export function CustomerDetailView({ customerId }: CustomerDetailViewProps) {
  const [state, setState] = useState<'loading' | 'error' | 'forbidden' | 'success'>('loading');
  const [view360State, setView360State] = useState<View360State>('loading');
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [customer360, setCustomer360] = useState<Customer360View | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [view360Error, setView360Error] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState('loading');
      setView360State('loading');

      try {
        const [coreResult, view360Result] = await Promise.allSettled([
          getCustomer(customerId),
          getCustomer360(customerId),
        ]);

        if (cancelled) {
          return;
        }

        if (coreResult.status === 'rejected') {
          const error = coreResult.reason;
          if (error instanceof ApiClientError && error.kind === 'forbidden') {
            setState('forbidden');
            return;
          }
          setErrorMessage(error instanceof Error ? error.message : 'Failed to load customer');
          setState('error');
          return;
        }

        setCustomer(coreResult.value);
        setState('success');

        if (view360Result.status === 'fulfilled') {
          setCustomer360(view360Result.value);
          const has360Data =
            view360Result.value.scores.length > 0 ||
            view360Result.value.riskScore !== null ||
            view360Result.value.lifetimeValue !== null ||
            view360Result.value.notes.length > 0 ||
            view360Result.value.files.length > 0 ||
            view360Result.value.timelinePreview.length > 0;
          setView360State(has360Data ? 'success' : 'empty');
        } else {
          const error = view360Result.reason;
          if (error instanceof ApiClientError && error.kind === 'forbidden') {
            setView360State('forbidden');
          } else {
            setView360Error(
              error instanceof Error ? error.message : 'Failed to load customer 360 view',
            );
            setView360State('error');
          }
        }
      } catch (error) {
        if (cancelled) {
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

  const notes = customer360?.notes ?? customer.notes;
  const files = customer360?.files ?? customer.files;

  return (
    <section className="customer-detail-layout" data-testid="customer-detail">
      <div className="customer-detail-layout__workspace">
        <p className="customer-detail-layout__breadcrumb">
          <Link href="/customers">Customers</Link> / {customer.displayName}
        </p>
        <h1>{customer.displayName}</h1>
        <p>
          {customer.email ?? '—'} · {customer.phone ?? '—'} · {customer.status}
        </p>

      <section className="card" data-testid="customer-360-panel">
        <h2>Customer 360</h2>

        {view360State === 'loading' && (
          <p className="state-message" data-testid="customer-360-loading">
            Loading customer 360…
          </p>
        )}

        {view360State === 'forbidden' && (
          <p className="state-message state-message--error" data-testid="customer-360-forbidden">
            You do not have permission to view customer 360 data.
          </p>
        )}

        {view360State === 'error' && (
          <p className="state-message state-message--error" data-testid="customer-360-error">
            {view360Error}
          </p>
        )}

        {view360State === 'empty' && (
          <p className="state-message" data-testid="customer-360-empty">
            No customer 360 analytics data yet.
          </p>
        )}

        {view360State === 'success' && customer360 && (
          <>
            <section data-testid="customer-360-scores">
              <h3>Scores</h3>
              {customer360.scores.length === 0 ? (
                <p>No scores</p>
              ) : (
                <ul>
                  {customer360.scores.map((score) => (
                    <li key={score.id}>
                      {score.metricCode}: {score.scoreValue}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section data-testid="customer-360-risk">
              <h3>Risk</h3>
              {customer360.riskScore ? (
                <p>
                  {customer360.riskScore.riskLevel} · {customer360.riskScore.riskScore}
                </p>
              ) : (
                <p>No risk score</p>
              )}
            </section>

            <section data-testid="customer-360-ltv">
              <h3>Lifetime value</h3>
              {customer360.lifetimeValue ? (
                <p>
                  {customer360.lifetimeValue.ltvValue} {customer360.lifetimeValue.currency}
                </p>
              ) : (
                <p>No lifetime value</p>
              )}
            </section>

            <section data-testid="customer-360-timeline-preview">
              <h3>Timeline preview</h3>
              {customer360.timelinePreview.length === 0 ? (
                <p>No timeline preview</p>
              ) : (
                <ul>
                  {customer360.timelinePreview.map((event) => (
                    <li key={event.id}>
                      {event.title} · {event.eventType} · {event.occurredAt}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </section>

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
        {notes.length === 0 ? (
          <p>No notes</p>
        ) : (
          <ul>
            {notes.map((note) => (
              <li key={note.id}>
                <strong>{note.title ?? 'Note'}</strong>: {note.body}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card" data-testid="customer-360-files">
        <h2>Files (metadata only)</h2>
        {files.length === 0 ? (
          <p>No files</p>
        ) : (
          <ul>
            {files.map((file) => (
              <li key={file.id}>
                {file.fileName} · {file.mimeType ?? 'unknown'} · {file.byteSize ?? 0} bytes
              </li>
            ))}
          </ul>
        )}
        <p data-testid="no-file-upload-control">Upload not available in Sprint-03.</p>
      </section>

      <CustomerTimelineSection customerId={customerId} />
      </div>
      <AiAssistDock />
    </section>
  );
}
