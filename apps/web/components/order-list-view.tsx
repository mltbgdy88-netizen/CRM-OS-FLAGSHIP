'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { listOrders, type OrderListItem, type OrderStatus } from '../lib/api/orders-client';
import { formatTry, orderStatusClass, orderStatusLabel } from '../lib/mock/orders-mock';
import { TableSkeleton } from './table-skeleton';

type StatusFilter = 'all' | OrderStatus;

function formatAmount(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function OrderListView() {
  const [state, setState] = useState<'loading' | 'empty' | 'error' | 'forbidden' | 'success'>(
    'loading',
  );
  const [items, setItems] = useState<OrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState('loading');
      try {
        const result = await listOrders(1, 50);
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
        setErrorMessage(error instanceof Error ? error.message : 'Siparişler yüklenemedi');
        setState('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    let result = items;
    if (statusFilter !== 'all') {
      result = result.filter((order) => order.status === statusFilter);
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (order) =>
          order.number.toLowerCase().includes(query) ||
          order.customer.displayName.toLowerCase().includes(query),
      );
    }
    return result;
  }, [items, searchQuery, statusFilter]);

  const totalValue = items.reduce((sum, order) => sum + order.total, 0);
  const activeCount = items.filter(
    (order) => order.status !== 'delivered' && order.status !== 'cancelled',
  ).length;
  const deliveredCount = items.filter((order) => order.status === 'delivered').length;

  if (state === 'loading') {
    return (
      <section className="workspace-card entity-page" data-testid="order-list">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">Siparişler</h1>
          </div>
        </header>
        <TableSkeleton rows={6} testId="order-list-loading" />
      </section>
    );
  }

  if (state === 'forbidden') {
    return (
      <section className="workspace-card entity-page" data-testid="order-list">
        <p className="state-message state-message--forbidden" data-testid="order-list-forbidden">
          Sipariş listesini görüntüleme yetkiniz yok.
        </p>
      </section>
    );
  }

  if (state === 'error') {
    return (
      <section className="workspace-card entity-page" data-testid="order-list">
        <p className="state-message state-message--error" data-testid="order-list-error">
          {errorMessage}
        </p>
      </section>
    );
  }

  if (state === 'empty') {
    return (
      <section className="workspace-card entity-page" data-testid="order-list">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">Siparişler</h1>
            <span className="entity-page__count">0 kayıt</span>
          </div>
        </header>
        <div className="empty-state" data-testid="order-list-empty">
          <span className="empty-state__icon" aria-hidden>
            ◇
          </span>
          <p>Henüz sipariş kaydı yok.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="workspace-card entity-page" data-testid="order-list">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">Siparişler</h1>
          <span className="entity-page__count">{total} kayıt</span>
        </div>
        <div className="entity-page__header-actions">
          <button type="button" className="btn-accent-green" disabled title="Sprint-07 ile aktif olacak">
            + Yeni Sipariş
          </button>
        </div>
      </header>

      <div className="kpi-strip kpi-strip--compact" data-testid="order-kpi-strip">
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--orange" aria-hidden>
            ▥
          </span>
          <div>
            <p className="kpi-card__label">Toplam değer</p>
            <p className="kpi-card__value">{formatTry(totalValue)}</p>
          </div>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--blue" aria-hidden>
            ◷
          </span>
          <div>
            <p className="kpi-card__label">Aktif</p>
            <p className="kpi-card__value">{activeCount}</p>
          </div>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--green" aria-hidden>
            ✓
          </span>
          <div>
            <p className="kpi-card__label">Teslim</p>
            <p className="kpi-card__value">{deliveredCount}</p>
          </div>
        </article>
      </div>

      <div className="entity-page__filters">
        <label className="entity-page__filter">
          <span className="entity-page__filter-label">Durum</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            aria-label="Durum filtresi"
          >
            <option value="all">Tümü</option>
            <option value="pending">Bekliyor</option>
            <option value="confirmed">Onaylandı</option>
            <option value="shipped">Kargoda</option>
            <option value="delivered">Teslim</option>
            <option value="cancelled">İptal</option>
          </select>
        </label>
        <div className="entity-page__search-wrap">
          <span className="entity-page__search-icon" aria-hidden>
            ⌕
          </span>
          <input
            type="search"
            className="entity-page__search"
            placeholder="Sipariş no veya müşteri ara…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Sipariş ara"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden>
            ⌕
          </span>
          <p>Filtrelere uygun sipariş bulunamadı.</p>
        </div>
      ) : (
        <div className="data-table-wrap data-table-wrap--flush">
          <table className="data-table data-table--premium" data-testid="order-list-items">
            <thead>
              <tr>
                <th className="data-table__col-check" aria-label="Seç" />
                <th>Sipariş No</th>
                <th>Müşteri</th>
                <th>Toplam</th>
                <th>Durum</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((order) => (
                <tr key={order.id} className="data-table__row" data-testid={`order-row-${order.id}`}>
                  <td className="data-table__col-check">
                    <input type="checkbox" disabled aria-label="Toplu seçim kapalı" />
                  </td>
                  <td>
                    <Link href={`/orders/${order.id}`} className="data-table__link">
                      {order.number}
                    </Link>
                  </td>
                  <td className="data-table__muted">{order.customer.displayName}</td>
                  <td className="data-table__primary">
                    {formatAmount(order.total, order.currencyCode)}
                  </td>
                  <td>
                    <span className={orderStatusClass(order.status)}>
                      {orderStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="data-table__muted">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className="entity-footer">
        <p className="entity-footer__hint" data-testid="order-api-notice">
          Canlı API — toplu işlem kapalıdır.
        </p>
      </footer>
    </section>
  );
}
