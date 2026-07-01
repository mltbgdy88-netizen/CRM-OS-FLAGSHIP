'use client';

import { useEffect, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import {
  getInventoryOverview,
  type InventoryOverview,
} from '../lib/api/inventory-client';
import { formatQuantity } from '../lib/mock/inventory-mock';
import { TableSkeleton } from './table-skeleton';
import { StockLedgerView } from './stock-ledger-view';
import { ReservationPanel } from './reservation-panel';

type TabId = 'overview' | 'ledger' | 'reservations';

export function InventoryOverviewView() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [state, setState] = useState<'loading' | 'empty' | 'error' | 'forbidden' | 'success'>(
    'loading',
  );
  const [overview, setOverview] = useState<InventoryOverview | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState('loading');
      try {
        const result = await getInventoryOverview();
        if (cancelled) {
          return;
        }
        setOverview(result);
        setState(result.totalSkus === 0 ? 'empty' : 'success');
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiClientError && error.kind === 'forbidden') {
          setState('forbidden');
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Envanter yüklenemedi');
        setState('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'loading') {
    return (
      <section className="workspace-card entity-page" data-testid="inventory-overview">
        <header className="entity-page__header">
          <h1 className="entity-page__title">Envanter</h1>
        </header>
        <TableSkeleton rows={4} testId="inventory-overview-loading" />
      </section>
    );
  }

  if (state === 'forbidden') {
    return (
      <section className="workspace-card entity-page" data-testid="inventory-overview">
        <p
          className="state-message state-message--forbidden"
          data-testid="inventory-overview-forbidden"
        >
          Envanter görüntüleme yetkiniz yok.
        </p>
      </section>
    );
  }

  if (state === 'error') {
    return (
      <section className="workspace-card entity-page" data-testid="inventory-overview">
        <p className="state-message state-message--error" data-testid="inventory-overview-error">
          {errorMessage}
        </p>
      </section>
    );
  }

  return (
    <section className="workspace-card entity-page" data-testid="inventory-overview">
      <header className="entity-page__header">
        <div>
          <h1 className="entity-page__title">Envanter</h1>
          <p className="entity-page__subtitle">Stok durumu, hareketler ve rezervasyonlar</p>
        </div>
      </header>

      <nav className="entity-tabs" aria-label="Envanter sekmeleri">
        {(
          [
            { id: 'overview', label: 'Özet' },
            { id: 'ledger', label: 'Stok Defteri' },
            { id: 'reservations', label: 'Rezervasyonlar' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`entity-tabs__tab${activeTab === tab.id ? ' entity-tabs__tab--active' : ''}`}
            data-testid={`inventory-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' && (
        <div data-testid="inventory-overview-content">
          {state === 'empty' ? (
            <p className="state-message state-message--empty" data-testid="inventory-overview-empty">
              Henüz stok kaydı yok.
            </p>
          ) : (
            overview && (
              <>
                <div className="kpi-row" data-testid="inventory-kpi-row">
                  <div className="kpi-card">
                    <span className="kpi-card__label">SKU</span>
                    <strong className="kpi-card__value">{overview.totalSkus}</strong>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-card__label">Fiziki Stok</span>
                    <strong className="kpi-card__value">{formatQuantity(overview.totalOnHand)}</strong>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-card__label">Rezerve</span>
                    <strong className="kpi-card__value">
                      {formatQuantity(overview.totalReserved)}
                    </strong>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-card__label">Kritik</span>
                    <strong className="kpi-card__value">{overview.criticalCount}</strong>
                  </div>
                </div>

                <section className="entity-section">
                  <h2 className="entity-section__title">Depolar</h2>
                  <div className="data-table-wrap">
                    <table className="data-table data-table--premium">
                      <thead>
                        <tr>
                          <th>Depo</th>
                          <th>Kod</th>
                          <th>SKU Sayısı</th>
                          <th>Toplam Stok</th>
                        </tr>
                      </thead>
                      <tbody data-testid="inventory-warehouse-rows">
                        {overview.warehouses.map((warehouse) => (
                          <tr key={warehouse.id} data-testid={`inventory-warehouse-${warehouse.id}`}>
                            <td>{warehouse.name}</td>
                            <td>{warehouse.code}</td>
                            <td>{warehouse.stockCount}</td>
                            <td>{formatQuantity(warehouse.onHandTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="entity-section">
                  <h2 className="entity-section__title">Son Hareketler</h2>
                  <div className="data-table-wrap">
                    <table className="data-table data-table--premium">
                      <thead>
                        <tr>
                          <th>Tarih</th>
                          <th>Tip</th>
                          <th>Ürün</th>
                          <th>Miktar</th>
                        </tr>
                      </thead>
                      <tbody data-testid="inventory-recent-movements">
                        {overview.recentMovements.map((movement) => (
                          <tr key={movement.id} data-testid={`inventory-movement-${movement.id}`}>
                            <td>{new Date(movement.movementAt).toLocaleString('tr-TR')}</td>
                            <td>{movement.movementType}</td>
                            <td>{movement.productVariant.sku}</td>
                            <td>{formatQuantity(movement.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )
          )}
        </div>
      )}

      {activeTab === 'ledger' && <StockLedgerView embedded />}
      {activeTab === 'reservations' && <ReservationPanel embedded />}
    </section>
  );
}
