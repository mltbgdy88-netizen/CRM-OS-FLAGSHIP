'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { listCustomers, type CustomerSummary } from '../lib/api/customers-client';
import { TableSkeleton } from './table-skeleton';

type StatusFilter = 'all' | 'active' | 'inactive';

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
    return 'status-pill status-pill--danger';
  }
  return 'status-pill status-pill--warning';
}

function statusLabel(status: string) {
  if (status === 'active') {
    return 'Aktif';
  }
  if (status === 'inactive' || status === 'lost') {
    return 'Pasif';
  }
  return 'Potansiyel';
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
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
        setErrorMessage(error instanceof Error ? error.message : 'Müşteriler yüklenemedi');
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
    if (statusFilter === 'active') {
      result = result.filter((item) => item.status === 'active');
    } else if (statusFilter === 'inactive') {
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
  }, [items, searchQuery, statusFilter]);

  const activeCount = useMemo(
    () => items.filter((item) => item.status === 'active').length,
    [items],
  );

  function handleRowClick(customer: CustomerSummary) {
    onSelectCustomer?.(customer.id);
  }

  function resetFilters() {
    setStatusFilter('all');
    setSearchQuery('');
  }

  return (
    <section className="workspace-card entity-page" data-testid="customer-list">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">Müşteriler</h1>
          {state === 'success' ? (
            <span className="entity-page__count">{total} kayıt</span>
          ) : null}
        </div>
        {onOpenCreate ? (
          <button
            type="button"
            className="btn-accent-green"
            onClick={onOpenCreate}
            data-testid="customer-create-link"
          >
            + Yeni Müşteri
          </button>
        ) : (
          <Link href="/customers/new" className="btn-accent-green" data-testid="customer-create-link">
            + Yeni Müşteri
          </Link>
        )}
      </header>

      {state === 'success' ? (
        <div className="kpi-strip kpi-strip--compact" data-testid="customer-kpi-strip">
          <article className="kpi-card">
            <span className="kpi-card__icon kpi-card__icon--orange" aria-hidden>
              ◎
            </span>
            <div>
              <p className="kpi-card__label">Toplam</p>
              <p className="kpi-card__value">{total}</p>
            </div>
          </article>
          <article className="kpi-card">
            <span className="kpi-card__icon kpi-card__icon--green" aria-hidden>
              ✓
            </span>
            <div>
              <p className="kpi-card__label">Aktif</p>
              <p className="kpi-card__value">{activeCount}</p>
            </div>
          </article>
          <article className="kpi-card">
            <span className="kpi-card__icon kpi-card__icon--blue" aria-hidden>
              ◷
            </span>
            <div>
              <p className="kpi-card__label">Bu sayfa</p>
              <p className="kpi-card__value">{filteredItems.length}</p>
            </div>
          </article>
        </div>
      ) : null}

      <div className="entity-page__filters">
        <label className="entity-page__filter">
          <span className="entity-page__filter-label">Durum</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            aria-label="Durum filtresi"
          >
            <option value="all">Tümü</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif / Potansiyel</option>
          </select>
        </label>
        <div className="entity-page__search-wrap">
          <span className="entity-page__search-icon" aria-hidden>
            ⌕
          </span>
          <input
            type="search"
            className="entity-page__search"
            placeholder="İsim veya e-posta ara…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Müşteri ara"
          />
        </div>
        <button type="button" className="btn-ghost btn-ghost--compact" onClick={resetFilters}>
          Filtreleri sıfırla
        </button>
      </div>

      {state === 'loading' && (
        <>
          <p className="state-message state-message--inline" data-testid="customer-list-loading">
            Müşteriler yükleniyor…
          </p>
          <TableSkeleton />
        </>
      )}

      {state === 'empty' && (
        <div className="empty-state" data-testid="customer-list-empty">
          <span className="empty-state__icon" aria-hidden>
            ◎
          </span>
          <p>Henüz müşteri kaydı yok.</p>
          <Link href="/customers/new" className="btn-accent-green">
            + İlk müşteriyi ekle
          </Link>
        </div>
      )}

      {state === 'error' && (
        <p className="state-message state-message--error" data-testid="customer-list-error">
          {errorMessage}
        </p>
      )}

      {state === 'forbidden' && (
        <p className="state-message state-message--error" data-testid="customer-list-forbidden">
          Müşterileri görüntüleme yetkiniz yok.
        </p>
      )}

      {state === 'success' && filteredItems.length === 0 && (
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden>
            ⌕
          </span>
          <p>Filtrelere uygun kayıt bulunamadı.</p>
        </div>
      )}

      {state === 'success' && filteredItems.length > 0 && (
        <div className="data-table-wrap data-table-wrap--flush">
          <table className="data-table data-table--premium" data-testid="customer-list-items">
            <thead>
              <tr>
                <th className="data-table__col-check" aria-label="Seç" />
                <th>Müşteri</th>
                <th>E-posta</th>
                <th>Telefon</th>
                <th>Durum</th>
                <th>Son güncelleme</th>
                <th className="data-table__col-chevron" aria-hidden />
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
                    <input type="checkbox" disabled aria-label="Toplu seçim kapalı" />
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
                  <td className="data-table__muted">{customer.email ?? '—'}</td>
                  <td className="data-table__muted">{customer.phone ?? '—'}</td>
                  <td>
                    <span className={statusPillClass(customer.status)}>
                      {statusLabel(customer.status)}
                    </span>
                  </td>
                  <td className="data-table__muted">
                    {new Date(customer.updatedAt ?? customer.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="data-table__col-chevron" aria-hidden>
                    ›
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className="entity-footer">
        <p className="entity-footer__hint" data-testid="no-upload-ui-notice">
          Toplu işlem ve dosya yükleme Sprint-04 kapsamı dışında kapalıdır.
        </p>
        <div className="entity-footer__pagination">
          <span data-testid="customer-list-pagination">
            Sayfa {page} · {pageSize} kayıt · {total} toplam
          </span>
          <div className="pagination-controls pagination-controls--premium">
            <button
              type="button"
              className="pagination-controls__btn"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              ‹
            </button>
            <span className="pagination-controls__page pagination-controls__page--active">
              {page}
            </span>
            <button
              type="button"
              className="pagination-controls__btn"
              disabled={page * pageSize >= total}
              onClick={() => setPage((current) => current + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
}
