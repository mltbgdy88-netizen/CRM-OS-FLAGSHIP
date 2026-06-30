'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { listCustomers, type CustomerSummary } from '../lib/api/customers-client';
import { TableSkeleton } from './table-skeleton';

type CustomerTab = 'all' | 'active' | 'inactive';
type ListView = 'list' | 'kanban' | 'timeline';

interface CustomerListViewProps {
  onSelectCustomer?: (id: string) => void;
  onOpenCreate?: () => void;
  selectedCustomerId?: string | null;
}

function statusPillClass(status: string) {
  if (status === 'active') {
    return 'status-pill status-pill--success';
  }
  if (status === 'inactive' || status === 'lost') {
    return 'status-pill status-pill--muted';
  }
  return 'status-pill status-pill--info';
}

export function CustomerListView({
  onSelectCustomer,
  onOpenCreate,
  selectedCustomerId,
}: CustomerListViewProps) {
  const [state, setState] = useState<
    'loading' | 'empty' | 'error' | 'forbidden' | 'success'
  >('loading');
  const [items, setItems] = useState<CustomerSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<CustomerTab>('all');
  const [listView, setListView] = useState<ListView>('list');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredItems = useMemo(() => {
    let result = items;
    if (activeTab === 'active') {
      result = result.filter((item) => item.status === 'active');
    } else if (activeTab === 'inactive') {
      result = result.filter((item) => item.status !== 'active');
    }
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return result;
    }
    return result.filter(
      (item) =>
        item.displayName.toLowerCase().includes(query) ||
        (item.email?.toLowerCase().includes(query) ?? false),
    );
  }, [activeTab, items, searchQuery]);

  const activeCount = useMemo(
    () => items.filter((item) => item.status === 'active').length,
    [items],
  );

  function handleRowClick(customer: CustomerSummary) {
    onSelectCustomer?.(customer.id);
  }

  return (
    <section className="workspace-card" data-testid="customer-list">
      <header className="entity-toolbar">
        <div className="entity-toolbar__title-row">
          <h1 className="entity-toolbar__title">Contacts</h1>
          {onOpenCreate ? (
            <button
              type="button"
              className="btn-accent-green"
              onClick={onOpenCreate}
              data-testid="customer-create-link"
            >
              + Create
            </button>
          ) : (
            <Link href="/customers/new" className="btn-accent-green" data-testid="customer-create-link">
              + Create
            </Link>
          )}
        </div>

        <div className="entity-toolbar__filters">
          <span className="filter-chip filter-chip--active">All contacts</span>
          <input
            type="search"
            className="entity-toolbar__search"
            placeholder="Filter and search…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Filter customers"
          />
        </div>

        <div className="entity-toolbar__views" role="tablist" aria-label="View mode">
          {(
            [
              ['list', 'List'],
              ['kanban', 'Kanban'],
              ['timeline', 'Activities'],
            ] as const
          ).map(([view, label]) => (
            <button
              key={view}
              type="button"
              role="tab"
              aria-selected={listView === view}
              disabled={view !== 'list'}
              className={
                listView === view ? 'view-pill view-pill--active' : 'view-pill view-pill--disabled'
              }
              onClick={() => view === 'list' && setListView(view)}
              title={view !== 'list' ? 'Coming soon' : undefined}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {state === 'success' ? (
        <div className="kpi-strip" data-testid="customer-kpi-strip">
          <article className="kpi-card">
            <p className="kpi-card__label">Total</p>
            <p className="kpi-card__value">{total}</p>
          </article>
          <article className="kpi-card">
            <p className="kpi-card__label">Active</p>
            <p className="kpi-card__value">{activeCount}</p>
          </article>
          <article className="kpi-card">
            <p className="kpi-card__label">On page</p>
            <p className="kpi-card__value">{filteredItems.length}</p>
          </article>
        </div>
      ) : null}

      <div className="crm-tabs crm-tabs--inline" role="tablist" aria-label="Customer filters">
        {(
          [
            ['all', 'All'],
            ['active', 'Customer'],
            ['inactive', 'Lost'],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={activeTab === tab ? 'crm-tabs__tab crm-tabs__tab--active' : 'crm-tabs__tab'}
            onClick={() => setActiveTab(tab)}
          >
            {label}
          </button>
        ))}
      </div>

      {state === 'loading' && (
        <>
          <p className="state-message state-message--inline" data-testid="customer-list-loading">
            Loading customers…
          </p>
          <TableSkeleton />
        </>
      )}

      {state === 'empty' && (
        <div className="empty-state" data-testid="customer-list-empty">
          <span className="empty-state__icon" aria-hidden>
            ∅
          </span>
          <p>No customers yet.</p>
        </div>
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

      {state === 'success' && filteredItems.length === 0 && (
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden>
            ∅
          </span>
          <p>No matches for current filters.</p>
        </div>
      )}

      {state === 'success' && filteredItems.length > 0 && (
        <div className="data-table-wrap data-table-wrap--flush">
          <table className="data-table" data-testid="customer-list-items">
            <thead>
              <tr>
                <th className="data-table__col-check" aria-label="Select" />
                <th>Contact</th>
                <th>Activity</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((customer) => (
                <tr
                  key={customer.id}
                  className={
                    selectedCustomerId === customer.id
                      ? 'data-table__row data-table__row--selected'
                      : 'data-table__row'
                  }
                  onClick={() => handleRowClick(customer)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleRowClick(customer);
                    }
                  }}
                  tabIndex={onSelectCustomer ? 0 : -1}
                  role={onSelectCustomer ? 'button' : undefined}
                  data-testid={`customer-row-${customer.id}`}
                >
                  <td className="data-table__col-check" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" disabled aria-label="Bulk select disabled" />
                  </td>
                  <td>
                    <div className="data-table__primary">
                      <span className="data-table__avatar" aria-hidden>
                        {customer.displayName.charAt(0).toUpperCase()}
                      </span>
                      {onSelectCustomer ? (
                        <span className="data-table__link">{customer.displayName}</span>
                      ) : (
                        <Link href={`/customers/${customer.id}`}>{customer.displayName}</Link>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="activity-dot activity-dot--idle" title="No recent activity" />
                  </td>
                  <td>{customer.email ?? '—'}</td>
                  <td>{customer.phone ?? '—'}</td>
                  <td>
                    <span className={statusPillClass(customer.status)}>{customer.status}</span>
                  </td>
                  <td className="data-table__muted">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className="entity-footer">
        <p className="entity-footer__hint" data-testid="no-upload-ui-notice">
          Bulk actions and file upload are disabled in Sprint-03/04.
        </p>
        <div className="entity-footer__pagination">
          <span data-testid="customer-list-pagination">
            Records: {pageSize} · Page {page} · {total} total
          </span>
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
        </div>
      </footer>
    </section>
  );
}
