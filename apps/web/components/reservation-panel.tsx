'use client';

import { formatQuantity, MOCK_RESERVATIONS } from '../lib/mock/inventory-mock';

interface ReservationPanelProps {
  embedded?: boolean;
}

export function ReservationPanel({ embedded = false }: ReservationPanelProps) {
  const content = (
    <div data-testid="reservation-panel-content">
      <p className="entity-section__hint">
        Rezervasyon yönetimi Sprint-17 ile canlı API&apos;ye bağlanacak. Şimdilik mock veri
        gösteriliyor.
      </p>
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
            {MOCK_RESERVATIONS.map((reservation) => (
              <tr key={reservation.id} data-testid={`reservation-row-${reservation.id}`}>
                <td>{reservation.orderNumber}</td>
                <td>{reservation.productSku}</td>
                <td>{reservation.warehouseCode}</td>
                <td>{formatQuantity(reservation.quantity)}</td>
                <td>
                  <span
                    className={`status-pill${
                      reservation.status === 'active'
                        ? ' status-pill--success'
                        : ' status-pill--warning'
                    }`}
                  >
                    {reservation.status === 'active' ? 'Aktif' : 'Bekliyor'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

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
