'use client';

import { useEffect, useMemo, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { listOpportunities, type OpportunitySummary } from '../lib/api/opportunities-client';
import { TableSkeleton } from './table-skeleton';

interface OpportunityListViewProps {
  onSelectOpportunity?: (id: string) => void;
  selectedOpportunityId?: string | null;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function OpportunityListView({
  onSelectOpportunity,
  selectedOpportunityId,
}: OpportunityListViewProps) {
  const [state, setState] = useState<'loading' | 'empty' | 'error' | 'forbidden' | 'success'>(
    'loading',
  );
  const [items, setItems] = useState<OpportunitySummary[]>([]);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState('loading');
      try {
        const result = await listOpportunities(1, 50);
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
        setErrorMessage(error instanceof Error ? error.message : 'Fırsatlar yüklenemedi');
        setState('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return items;
    }
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.companyName.toLowerCase().includes(query) ||
        item.stage.name.toLowerCase().includes(query),
    );
  }, [items, searchQuery]);

  function handleRowClick(opportunity: OpportunitySummary) {
    onSelectOpportunity?.(opportunity.id);
  }

  if (state === 'loading') {
    return (
      <section className="workspace-card entity-page" data-testid="opportunity-list">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">Fırsatlar</h1>
          </div>
        </header>
        <TableSkeleton rows={6} data-testid="opportunity-list-loading" />
      </section>
    );
  }

  if (state === 'forbidden') {
    return (
      <section className="workspace-card entity-page" data-testid="opportunity-list">
        <p
          className="state-message state-message--forbidden"
          data-testid="opportunity-list-forbidden"
        >
          Fırsat listesini görüntüleme yetkiniz yok.
        </p>
      </section>
    );
  }

  if (state === 'error') {
    return (
      <section className="workspace-card entity-page" data-testid="opportunity-list">
        <p className="state-message state-message--error" data-testid="opportunity-list-error">
          {errorMessage}
        </p>
      </section>
    );
  }

  if (state === 'empty') {
    return (
      <section className="workspace-card entity-page" data-testid="opportunity-list">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">Fırsatlar</h1>
            <span className="entity-page__count">0 kayıt</span>
          </div>
        </header>
        <div className="empty-state" data-testid="opportunity-list-empty">
          <span className="empty-state__icon" aria-hidden>
            ◇
          </span>
          <p>Henüz fırsat kaydı yok.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="workspace-card entity-page" data-testid="opportunity-list">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">Fırsatlar</h1>
          <span className="entity-page__count">{total} kayıt</span>
        </div>
        <div className="entity-page__header-actions">
          <button type="button" className="btn-accent-green" disabled title="Sprint-07 sonrası">
            + Yeni Fırsat
          </button>
        </div>
      </header>

      <div className="entity-page__filters">
        <div className="entity-page__search-wrap">
          <span className="entity-page__search-icon" aria-hidden>
            ⌕
          </span>
          <input
            type="search"
            className="entity-page__search"
            placeholder="Fırsat veya şirket ara…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Fırsat ara"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden>
            ⌕
          </span>
          <p>Filtrelere uygun fırsat bulunamadı.</p>
        </div>
      ) : (
        <div className="data-table-wrap data-table-wrap--flush">
          <table className="data-table data-table--premium" data-testid="opportunity-list-items">
            <thead>
              <tr>
                <th className="data-table__col-check" aria-label="Seç" />
                <th>Başlık</th>
                <th>Şirket</th>
                <th>Tutar</th>
                <th>Aşama</th>
                <th>Olasılık</th>
                <th className="data-table__col-chevron" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((opportunity) => (
                <tr
                  key={opportunity.id}
                  className={
                    selectedOpportunityId === opportunity.id
                      ? 'data-table__row data-table__row--selected'
                      : 'data-table__row'
                  }
                  onClick={() => handleRowClick(opportunity)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleRowClick(opportunity);
                    }
                  }}
                  tabIndex={onSelectOpportunity ? 0 : -1}
                  role={onSelectOpportunity ? 'button' : undefined}
                  data-testid={`opportunity-row-${opportunity.id}`}
                >
                  <td className="data-table__col-check" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" disabled aria-label="Toplu seçim kapalı" />
                  </td>
                  <td>
                    <div className="data-table__primary">
                      <span className="data-table__avatar" aria-hidden>
                        {opportunity.title.charAt(0).toUpperCase()}
                      </span>
                      <span className="data-table__link">{opportunity.title}</span>
                    </div>
                  </td>
                  <td className="data-table__muted">{opportunity.companyName}</td>
                  <td className="data-table__muted">{formatAmount(opportunity.amount)}</td>
                  <td className="data-table__muted">{opportunity.stage.name}</td>
                  <td>
                    <span className="lead-score lead-score--blue">%{opportunity.probability}</span>
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
        <p className="entity-footer__hint" data-testid="opportunity-api-notice">
          Canlı API — toplu işlem kapalıdır.
        </p>
      </footer>
    </section>
  );
}
