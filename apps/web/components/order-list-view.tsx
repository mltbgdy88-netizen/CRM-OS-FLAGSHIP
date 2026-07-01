'use client';

import { useMemo, useState } from 'react';
import {
  formatTry,
  MOCK_ORDERS,
  orderStatusClass,
  orderStatusLabel,
  type OrderStatus,
} from '../lib/mock/orders-mock';
import { MockPreviewBadge } from './mock-preview-badge';

type StatusFilter = 'all' | OrderStatus;

export function OrderListView() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    let result = MOCK_ORDERS;
    if (statusFilter !== 'all') {
      result = result.filter((order) => order.status === statusFilter);
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (order) =>
          order.number.toLowerCase().includes(query) ||
          order.customer.toLowerCase().includes(query),
      );
    }
    return result;
  }, [searchQuery, statusFilter]);

  const totalValue = MOCK_ORDERS.reduce((sum, o) => sum + o.total, 0);
  const activeCount = MOCK_ORDERS.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled',
  ).length;

  return (
    <section className="workspace-card entity-page" data-testid="order-list">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">Siparişler</h1>
          <span className="entity-page__count">{MOCK_ORDERS.length} kayıt</span>
        </div>
        <div className="entity-page__header-actions">
          <MockPreviewBadge />
          <button type="button" className="btn-accent-green" disabled title="Sprint-07 ile aktif olacak">
            + Yeni Sipariş
          </button>
        </div>
      </header>

      <div className="kpi-strip kpi-strip--compact">
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--orange" aria-hidden>▥</span>
          <div>
            <p className="kpi-card__label">Toplam değer</p>
            <p className="kpi-card__value">{formatTry(totalValue)}</p>
          </div>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--blue" aria-hidden>◷</span>
          <div>
            <p className="kpi-card__label">Aktif</p>
            <p className="kpi-card__value">{activeCount}</p>
          </div>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--green" aria-hidden>✓</span>
          <div>
            <p className="kpi-card__label">Teslim</p>
            <p className="kpi-card__value">
              {MOCK_ORDERS.filter((o) => o.status === 'delivered').length}
            </p>
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
            <option value="processing">İşleniyor</option>
            <option value="shipped">Kargoda</option>
            <option value="delivered">Teslim</option>
            <option value="cancelled">İptal</option>
          </select>
        </label>
        <div className="entity-page__search-wrap">
          <span className="entity-page__search-icon" aria-hidden>⌕</span>
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
                <td><span className="data-table__link">{order.number}</span></td>
                <td className="data-table__muted">{order.customer}</td>
                <td className="data-table__primary">{formatTry(order.total)}</td>
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

      <footer className="entity-footer">
        <p className="entity-footer__hint" data-testid="order-mock-notice">
          Demo veri — sipariş detay ve stok Sprint-07 ile gelecek.
        </p>
      </footer>
    </section>
  );
}
