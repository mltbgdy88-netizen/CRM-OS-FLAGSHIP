'use client';

import { useEffect, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { listStocks, type StockListItem } from '../lib/api/inventory-client';
import { formatQuantity } from '../lib/mock/inventory-mock';
import { TableSkeleton } from './table-skeleton';

interface StockLedgerViewProps {
  embedded?: boolean;
}

export function StockLedgerView({ embedded = false }: StockLedgerViewProps) {
  const [state, setState] = useState<'loading' | 'empty' | 'error' | 'forbidden' | 'success'>(
    'loading',
  );
  const [items, setItems] = useState<StockListItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState('loading');
      try {
        const result = await listStocks(1, 100);
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
        setErrorMessage(error instanceof Error ? error.message : 'Stok defteri yüklenemedi');
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
      return <TableSkeleton rows={6} testId="stock-ledger-loading" />;
    }

    if (state === 'forbidden') {
      return (
        <p className="state-message state-message--forbidden" data-testid="stock-ledger-forbidden">
          Stok defterini görüntüleme yetkiniz yok.
        </p>
      );
    }

    if (state === 'error') {
      return (
        <p className="state-message state-message--error" data-testid="stock-ledger-error">
          {errorMessage}
        </p>
      );
    }

    if (state === 'empty') {
      return (
        <p className="state-message state-message--empty" data-testid="stock-ledger-empty">
          Stok kaydı bulunamadı.
        </p>
      );
    }

    return (
      <div className="data-table-wrap">
        <table className="data-table data-table--premium">
          <thead>
            <tr>
              <th>Depo</th>
              <th>Ürün</th>
              <th>Varyant</th>
              <th>Fiziki</th>
              <th>Rezerve</th>
              <th>Satılabilir</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody data-testid="stock-ledger-items">
            {items.map((stock) => (
              <tr key={stock.id} data-testid={`stock-row-${stock.id}`}>
                <td>{stock.warehouse.name}</td>
                <td>{stock.productVariant.product.name}</td>
                <td>{stock.productVariant.sku}</td>
                <td>{formatQuantity(stock.quantityOnHand)}</td>
                <td>{formatQuantity(stock.quantityReserved)}</td>
                <td>{formatQuantity(stock.quantityAvailable)}</td>
                <td>
                  {stock.isCritical ? (
                    <span className="status-pill status-pill--danger">Kritik</span>
                  ) : (
                    <span className="status-pill status-pill--success">Normal</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  })();

  if (embedded) {
    return <div data-testid="stock-ledger">{content}</div>;
  }

  return (
    <section className="workspace-card entity-page" data-testid="stock-ledger">
      <header className="entity-page__header">
        <h1 className="entity-page__title">Stok Defteri</h1>
      </header>
      {content}
    </section>
  );
}
