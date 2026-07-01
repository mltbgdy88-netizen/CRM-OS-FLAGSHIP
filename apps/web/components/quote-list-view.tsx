'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { listQuotes, type QuoteListItem, type QuoteStatus } from '../lib/api/quotes-client';
import { formatTry, quoteStatusClass, quoteStatusLabel } from '../lib/mock/quotes-mock';
import { TableSkeleton } from './table-skeleton';

type StatusFilter = 'all' | QuoteStatus;

function formatAmount(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

function createdByLabel(quote: QuoteListItem): string {
  return quote.createdByName ?? '—';
}

export function QuoteListView() {
  const [state, setState] = useState<'loading' | 'empty' | 'error' | 'forbidden' | 'success'>(
    'loading',
  );
  const [items, setItems] = useState<QuoteListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState('loading');
      try {
        const result = await listQuotes(1, 50);
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
        setErrorMessage(error instanceof Error ? error.message : 'Teklifler yüklenemedi');
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
      result = result.filter((quote) => quote.status === statusFilter);
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (quote) =>
          quote.number.toLowerCase().includes(query) ||
          quote.customerName.toLowerCase().includes(query),
      );
    }
    return result;
  }, [items, searchQuery, statusFilter]);

  const totalValue = items.reduce((sum, quote) => sum + quote.total, 0);
  const acceptedCount = items.filter((quote) => quote.status === 'accepted').length;
  const avgMargin =
    items.length > 0
      ? Math.round(items.reduce((sum, quote) => sum + quote.marginPercent, 0) / items.length)
      : 0;
  const pendingCount = items.filter((quote) => quote.status === 'sent').length;

  if (state === 'loading') {
    return (
      <section className="workspace-card entity-page" data-testid="quote-list">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">Teklifler</h1>
          </div>
        </header>
        <TableSkeleton rows={6} data-testid="quote-list-loading" />
      </section>
    );
  }

  if (state === 'forbidden') {
    return (
      <section className="workspace-card entity-page" data-testid="quote-list">
        <p className="state-message state-message--forbidden" data-testid="quote-list-forbidden">
          Teklif listesini görüntüleme yetkiniz yok.
        </p>
      </section>
    );
  }

  if (state === 'error') {
    return (
      <section className="workspace-card entity-page" data-testid="quote-list">
        <p className="state-message state-message--error" data-testid="quote-list-error">
          {errorMessage}
        </p>
      </section>
    );
  }

  if (state === 'empty') {
    return (
      <section className="workspace-card entity-page" data-testid="quote-list">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">Teklifler</h1>
            <span className="entity-page__count">0 kayıt</span>
          </div>
        </header>
        <div className="empty-state" data-testid="quote-list-empty">
          <span className="empty-state__icon" aria-hidden>
            ◇
          </span>
          <p>Henüz teklif kaydı yok.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="workspace-card entity-page" data-testid="quote-list">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">Teklifler</h1>
          <span className="entity-page__count">{total} kayıt</span>
        </div>
        <div className="entity-page__header-actions">
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
            <p className="kpi-card__value">{pendingCount}</p>
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
                    <Link href={`/quotes/${quote.id}`} className="data-table__link">
                      {quote.number}
                    </Link>
                  </td>
                  <td className="data-table__muted">{quote.customerName}</td>
                  <td className="data-table__primary">
                    {formatAmount(quote.total, quote.currencyCode)}
                  </td>
                  <td>%{quote.marginPercent}</td>
                  <td>
                    <span className={quoteStatusClass(quote.status)}>
                      {quoteStatusLabel(quote.status)}
                    </span>
                  </td>
                  <td className="data-table__muted">{createdByLabel(quote)}</td>
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
        <p className="entity-footer__hint" data-testid="quote-api-notice">
          Canlı API — toplu işlem kapalıdır.
        </p>
      </footer>
    </section>
  );
}
