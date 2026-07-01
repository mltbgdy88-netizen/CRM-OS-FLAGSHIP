'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { getOrder, type OrderDetail } from '../lib/api/orders-client';
import { orderStatusClass, orderStatusLabel } from '../lib/mock/orders-mock';
import { TableSkeleton } from './table-skeleton';

interface OrderDetailViewProps {
  orderId: string;
}

function formatAmount(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const [state, setState] = useState<'loading' | 'error' | 'forbidden' | 'success'>('loading');
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState('loading');
      try {
        const result = await getOrder(orderId);
        if (cancelled) {
          return;
        }
        setOrder(result);
        setState('success');
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiClientError && error.kind === 'forbidden') {
          setState('forbidden');
          return;
        }
        if (error instanceof ApiClientError && error.kind === 'not_found') {
          setErrorMessage('Sipariş bulunamadı.');
          setState('error');
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Sipariş yüklenemedi');
        setState('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (state === 'loading') {
    return (
      <section className="workspace-card entity-page" data-testid="order-detail">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">Sipariş Detayı</h1>
          </div>
        </header>
        <TableSkeleton rows={6} testId="order-detail-loading" />
      </section>
    );
  }

  if (state === 'forbidden') {
    return (
      <section className="workspace-card entity-page" data-testid="order-detail">
        <p className="state-message state-message--forbidden" data-testid="order-detail-forbidden">
          Sipariş detayını görüntüleme yetkiniz yok.
        </p>
      </section>
    );
  }

  if (state === 'error' || !order) {
    return (
      <section className="workspace-card entity-page" data-testid="order-detail">
        <p className="state-message state-message--error" data-testid="order-detail-error">
          {errorMessage}
        </p>
      </section>
    );
  }

  const sortedHistory = [...order.statusHistory].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <section className="workspace-card entity-page" data-testid="order-detail">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">{order.number}</h1>
          <span className={orderStatusClass(order.status)}>{orderStatusLabel(order.status)}</span>
        </div>
        <div className="entity-page__header-actions">
          <Link href="/orders" className="btn-ghost">
            ← Liste
          </Link>
        </div>
      </header>

      <dl className="detail-info-grid" data-testid="order-detail-header">
        <div>
          <dt>Müşteri</dt>
          <dd>{order.customer.displayName}</dd>
        </div>
        <div>
          <dt>Para birimi</dt>
          <dd>{order.currencyCode}</dd>
        </div>
        <div>
          <dt>Oluşturulma</dt>
          <dd>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</dd>
        </div>
        <div>
          <dt>Son güncelleme</dt>
          <dd>
            {order.updatedAt
              ? new Date(order.updatedAt).toLocaleDateString('tr-TR')
              : new Date(order.createdAt).toLocaleDateString('tr-TR')}
          </dd>
        </div>
      </dl>

      <h2 className="customer-360__section-title">Kalemler</h2>
      {order.items.length === 0 ? (
        <p className="detail-tab-panel__empty" data-testid="order-detail-items-empty">
          Kalem kaydı yok.
        </p>
      ) : (
        <div className="data-table-wrap data-table-wrap--flush">
          <table className="data-table data-table--premium" data-testid="order-detail-items">
            <thead>
              <tr>
                <th>Ürün / Hizmet</th>
                <th>Miktar</th>
                <th>Birim fiyat</th>
                <th>Satır toplamı</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} data-testid={`order-item-${item.id}`}>
                  <td>
                    <span className="data-table__primary">{item.name}</span>
                    {item.description ? (
                      <span className="data-table__muted"> — {item.description}</span>
                    ) : null}
                  </td>
                  <td>{item.quantity}</td>
                  <td className="data-table__muted">
                    {formatAmount(item.unitPrice, order.currencyCode)}
                  </td>
                  <td className="data-table__primary">
                    {formatAmount(item.lineTotal, order.currencyCode)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="customer-360__section-title">Fiyat özeti</h2>
      <dl className="detail-info-grid" data-testid="order-detail-summary">
        <div>
          <dt>Ara toplam</dt>
          <dd>{formatAmount(order.subtotal, order.currencyCode)}</dd>
        </div>
        <div>
          <dt>Vergi</dt>
          <dd>{formatAmount(order.taxTotal, order.currencyCode)}</dd>
        </div>
        <div>
          <dt>Genel toplam</dt>
          <dd className="data-table__primary">{formatAmount(order.total, order.currencyCode)}</dd>
        </div>
      </dl>

      <h2 className="customer-360__section-title">Teslimat zaman çizelgesi</h2>
      {sortedHistory.length === 0 ? (
        <p className="detail-tab-panel__empty" data-testid="order-detail-timeline-empty">
          Durum geçmişi kaydı yok.
        </p>
      ) : (
        <ul className="detail-timeline-list" data-testid="order-detail-timeline">
          {sortedHistory.map((entry) => (
            <li key={entry.id} className="detail-timeline-list__item" data-testid={`order-timeline-${entry.id}`}>
              <p className="detail-timeline-list__title">
                <span className={orderStatusClass(entry.fromStatus)}>
                  {orderStatusLabel(entry.fromStatus)}
                </span>
                {' → '}
                <span className={orderStatusClass(entry.toStatus)}>
                  {orderStatusLabel(entry.toStatus)}
                </span>
              </p>
              <p className="detail-timeline-list__meta">
                {new Date(entry.createdAt).toLocaleString('tr-TR')}
              </p>
              {entry.reason ? (
                <p className="detail-timeline-list__meta">{entry.reason}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {order.notes ? (
        <>
          <h2 className="customer-360__section-title">Notlar</h2>
          <p className="detail-tab-panel__empty" data-testid="order-detail-notes">
            {order.notes}
          </p>
        </>
      ) : null}
    </section>
  );
}
