'use client';

import { useMemo, useState } from 'react';
import {
  formatTry,
  MOCK_QUOTES,
  quoteStatusClass,
  quoteStatusLabel,
  type QuoteStatus,
} from '../lib/mock/quotes-mock';
import { MockPreviewBadge } from './mock-preview-badge';

type StatusFilter = 'all' | QuoteStatus;

export function QuoteListView() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    let result = MOCK_QUOTES;
    if (statusFilter !== 'all') {
      result = result.filter((quote) => quote.status === statusFilter);
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (quote) =>
          quote.number.toLowerCase().includes(query) ||
          quote.customer.toLowerCase().includes(query),
      );
    }
    return result;
  }, [searchQuery, statusFilter]);

  const totalValue = MOCK_QUOTES.reduce((sum, q) => sum + q.amount, 0);
  const acceptedCount = MOCK_QUOTES.filter((q) => q.status === 'accepted').length;
  const avgMargin = Math.round(
    MOCK_QUOTES.reduce((sum, q) => sum + q.marginPercent, 0) / MOCK_QUOTES.length,
  );

  return (
    <section className="workspace-card entity-page" data-testid="quote-list">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">Teklifler</h1>
          <span className="entity-page__count">{MOCK_QUOTES.length} kayıt</span>
        </div>
        <div className="entity-page__header-actions">
          <MockPreviewBadge />
          <button type="button" className="btn-accent-green" disabled title="Sprint-07 ile aktif olacak">
            + Yeni Teklif
          </button>
        </div>
      </header>

      <div className="kpi-strip kpi-strip--compact" data-testid="quote-kpi-strip">
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--orange" aria-hidden>
            ▤
          </span>
          <div>
            <p className="kpi-card__label">Toplam değer</p>
            <p className="kpi-card__value">{formatTry(totalValue)}</p>
          </div>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--green" aria-hidden>
            ✓
          </span>
          <div>
            <p className="kpi-card__label">Kabul edilen</p>
            <p className="kpi-card__value">{acceptedCount}</p>
          </div>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--blue" aria-hidden>
            %
          </span>
          <div>
            <p className="kpi-card__label">Ort. marj</p>
            <p className="kpi-card__value">%{avgMargin}</p>
          </div>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--orange" aria-hidden>
            ◷
          </span>
          <div>
            <p className="kpi-card__label">Bekleyen</p>
            <p className="kpi-card__value">
              {MOCK_QUOTES.filter((q) => q.status === 'sent').length}
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
            <option value="draft">Taslak</option>
            <option value="sent">Gönderildi</option>
            <option value="accepted">Kabul</option>
            <option value="rejected">Reddedildi</option>
          </select>
        </label>
        <div className="entity-page__search-wrap">
          <span className="entity-page__search-icon" aria-hidden>
            ⌕
          </span>
          <input
            type="search"
            className="entity-page__search"
            placeholder="Teklif no veya müşteri ara…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Teklif ara"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden>
            ⌕
          </span>
          <p>Filtrelere uygun teklif bulunamadı.</p>
        </div>
      ) : (
        <div className="data-table-wrap data-table-wrap--flush">
          <table className="data-table data-table--premium" data-testid="quote-list-items">
            <thead>
              <tr>
                <th className="data-table__col-check" aria-label="Seç" />
                <th>Teklif No</th>
                <th>Müşteri</th>
                <th>Tutar</th>
                <th>Marj</th>
                <th>Durum</th>
                <th>Oluşturan</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((quote) => (
                <tr key={quote.id} className="data-table__row" data-testid={`quote-row-${quote.id}`}>
                  <td className="data-table__col-check">
                    <input type="checkbox" disabled aria-label="Toplu seçim kapalı" />
                  </td>
                  <td>
                    <span className="data-table__link">{quote.number}</span>
                  </td>
                  <td className="data-table__muted">{quote.customer}</td>
                  <td className="data-table__primary">{formatTry(quote.amount)}</td>
                  <td>%{quote.marginPercent}</td>
                  <td>
                    <span className={quoteStatusClass(quote.status)}>
                      {quoteStatusLabel(quote.status)}
                    </span>
                  </td>
                  <td className="data-table__muted">{quote.createdBy}</td>
                  <td className="data-table__muted">
                    {new Date(quote.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className="entity-footer">
        <p className="entity-footer__hint" data-testid="quote-mock-notice">
          Demo veri — teklif oluşturucu Sprint-07 ile gelecek.
        </p>
      </footer>
    </section>
  );
}
