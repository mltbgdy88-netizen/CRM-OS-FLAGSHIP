'use client';

import { useEffect, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { listStockReservations, type StockReservationItem } from '../lib/api/inventory-client';
import { formatQuantity } from '../lib/mock/inventory-mock';
import { TableSkeleton } from './table-skeleton';

interface ReservationPanelProps {
  embedded?: boolean;
}

export function ReservationPanel({ embedded = false }: ReservationPanelProps) {
  const [state, setState] = useState<'loading' | 'empty' | 'error' | 'forbidden' | 'success'>(
    'loading',
  );
  const [items, setItems] = useState<StockReservationItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState('loading');
      try {
        const result = await listStockReservations(1, 50);
        if (cancelled) {
          return;
        }
        setItems(result.items);
        setState(result.items.length === 0 ? 'empty' : 'success');
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiClientError && error.kind === 'forbidden') {
          setState('forbidden');
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Rezervasyonlar yüklenemedi');
        setState('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const content = (() => {
    if (state === 'loading') {
      return <TableSkeleton rows={4} testId="reservation-panel-loading" />;
    }

    if (state === 'forbidden') {
      return (
        <p className="state-message state-message--forbidden" data-testid="reservation-panel-forbidden">
          Rezervasyonları görüntüleme yetkiniz yok.
        </p>
      );
    }

    if (state === 'error') {
      return (
        <p className="state-message state-message--error" data-testid="reservation-panel-error">
          {errorMessage}
        </p>
      );
    }

    if (state === 'empty') {
      return (
        <p className="state-message state-message--empty" data-testid="reservation-panel-empty">
          Aktif rezervasyon bulunamadı.
        </p>
      );
    }

    return (
      <div className="data-table-wrap">
        <table className="data-table data-table--premium">
          <thead>
            <tr>
              <th>Sipariş</th>
              <th>SKU</th>
              <th>Depo</th>
              <th>Miktar</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody data-testid="reservation-panel-items">
            {items.map((reservation) => (
              <tr key={reservation.id} data-testid={`reservation-row-${reservation.id}`}>
                <td>{reservation.orderNumber}</td>
                <td>{reservation.productVariant.sku}</td>
                <td>{reservation.warehouse.code}</td>
                <td>{formatQuantity(reservation.quantity)}</td>
                <td>
                  <span
                    className={`status-pill${
                      reservation.status === 'active'
                        ? ' status-pill--success'
                        : ' status-pill--warning'
                    }`}
                  >
                    {reservation.status === 'active' ? 'Aktif' : 'Serbest'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  })();

  if (embedded) {
    return <div data-testid="reservation-panel">{content}</div>;
  }

  return (
    <section className="workspace-card entity-page" data-testid="reservation-panel">
      <header className="entity-page__header">
        <h1 className="entity-page__title">Rezervasyonlar</h1>
      </header>
      {content}
    </section>
  );
}
