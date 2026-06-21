'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { listCustomers, type CustomerSummary } from '../lib/api/customers-client';

export function CustomerListView() {
  const [state, setState] = useState<
    'loading' | 'empty' | 'error' | 'forbidden' | 'success'
  >('loading');
  const [items, setItems] = useState<CustomerSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState('loading');
      try {
        const result = await listCustomers(page, pageSize);
        if (cancelled) {
          return;
        }
        setItems(result.items);
        setTotal(result.total);
        setState(result.items.length === 0 ? 'empty' : 'success');
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiClientError && error.kind === 'forbidden') {
          setState('forbidden');
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load customers');
        setState('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize]);

  return (
    <section data-testid="customer-list">
      <div className="page-header">
        <h1>Customers</h1>
        <Link href="/customers/new" data-testid="customer-create-link">
          New customer
        </Link>
      </div>

      {state === 'loading' && (
        <p className="state-message" data-testid="customer-list-loading">
          Loading customers…
        </p>
      )}

      {state === 'empty' && (
        <p className="state-message" data-testid="customer-list-empty">
          No customers yet.
        </p>
      )}

      {state === 'error' && (
        <p className="state-message state-message--error" data-testid="customer-list-error">
          {errorMessage}
        </p>
      )}

      {state === 'forbidden' && (
        <p className="state-message state-message--error" data-testid="customer-list-forbidden">
          You do not have permission to view customers.
        </p>
      )}

      {state === 'success' && (
        <>
          <ul className="customer-list" data-testid="customer-list-items">
            {items.map((customer) => (
              <li key={customer.id}>
                <Link href={`/customers/${customer.id}`}>{customer.displayName}</Link>
                <span className="customer-list__meta">{customer.email ?? '—'}</span>
              </li>
            ))}
          </ul>
          <p className="pagination" data-testid="customer-list-pagination">
            Page {page} · {pageSize} per page · {total} total
          </p>
          <div className="pagination-controls">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page * pageSize >= total}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      <p className="security-warning" data-testid="no-upload-ui-notice">
        File upload is not available in Sprint-03.
      </p>
    </section>
  );
}
