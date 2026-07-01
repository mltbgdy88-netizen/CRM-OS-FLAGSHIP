'use client';

import { useEffect, useMemo, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { listLeads, type LeadSummary } from '../lib/api/leads-client';
import {
  leadStatusLabel,
  leadStatusPillClass,
  scoreTone,
  type LeadStatus,
} from '../lib/mock/leads-mock';
import { TableSkeleton } from './table-skeleton';

type StatusFilter = 'all' | LeadStatus;

interface LeadListViewProps {
  onSelectLead?: (id: string) => void;
  selectedLeadId?: string | null;
}

function ScoreBadge({ score }: { score: number }) {
  const tone = scoreTone(score);
  return (
    <span className={`lead-score lead-score--${tone}`} data-testid={`lead-score-${score}`}>
      {score}
    </span>
  );
}

function ownerLabel(lead: LeadSummary): string {
  return lead.assignedUserId ? 'Atanmış' : 'Atanmamış';
}

export function LeadListView({ onSelectLead, selectedLeadId }: LeadListViewProps) {
  const [state, setState] = useState<'loading' | 'empty' | 'error' | 'forbidden' | 'success'>(
    'loading',
  );
  const [items, setItems] = useState<LeadSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState('loading');
      try {
        const result = await listLeads(1, 50);
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
        setErrorMessage(error instanceof Error ? error.message : 'Leadler yüklenemedi');
        setState('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sources = useMemo(
    () => [...new Set(items.map((lead) => lead.source.name))].sort(),
    [items],
  );

  const owners = useMemo(
    () => [...new Set(items.map((lead) => ownerLabel(lead)))].sort(),
    [items],
  );

  const filteredItems = useMemo(() => {
    let result = items;
    if (statusFilter !== 'all') {
      result = result.filter((lead) => lead.status === statusFilter);
    }
    if (sourceFilter !== 'all') {
      result = result.filter((lead) => lead.source.name === sourceFilter);
    }
    if (ownerFilter !== 'all') {
      result = result.filter((lead) => ownerLabel(lead) === ownerFilter);
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (lead) =>
          lead.fullName.toLowerCase().includes(query) ||
          lead.companyName.toLowerCase().includes(query) ||
          (lead.email ?? '').toLowerCase().includes(query),
      );
    }
    return result;
  }, [items, ownerFilter, searchQuery, sourceFilter, statusFilter]);

  const qualifiedCount = items.filter((lead) => lead.status === 'qualified').length;
  const newCount = items.filter((lead) => lead.status === 'new').length;
  const avgScore =
    items.length === 0
      ? 0
      : Math.round(items.reduce((sum, lead) => sum + lead.score, 0) / items.length);

  function handleRowClick(lead: LeadSummary) {
    onSelectLead?.(lead.id);
  }

  function resetFilters() {
    setStatusFilter('all');
    setSourceFilter('all');
    setOwnerFilter('all');
    setSearchQuery('');
  }

  if (state === 'loading') {
    return (
      <section className="workspace-card entity-page" data-testid="lead-list">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">Leadler</h1>
          </div>
        </header>
        <TableSkeleton rows={6} data-testid="lead-list-loading" />
      </section>
    );
  }

  if (state === 'forbidden') {
    return (
      <section className="workspace-card entity-page" data-testid="lead-list">
        <p className="state-message state-message--forbidden" data-testid="lead-list-forbidden">
          Lead listesini görüntüleme yetkiniz yok.
        </p>
      </section>
    );
  }

  if (state === 'error') {
    return (
      <section className="workspace-card entity-page" data-testid="lead-list">
        <p className="state-message state-message--error" data-testid="lead-list-error">
          {errorMessage}
        </p>
      </section>
    );
  }

  if (state === 'empty') {
    return (
      <section className="workspace-card entity-page" data-testid="lead-list">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">Leadler</h1>
            <span className="entity-page__count">0 kayıt</span>
          </div>
        </header>
        <div className="empty-state" data-testid="lead-list-empty">
          <span className="empty-state__icon" aria-hidden>
            ◇
          </span>
          <p>Henüz lead kaydı yok.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="workspace-card entity-page" data-testid="lead-list">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">Leadler</h1>
          <span className="entity-page__count">{total} kayıt</span>
        </div>
        <div className="entity-page__header-actions">
          <button type="button" className="btn-accent-green" disabled title="Sprint-05 sonrası">
            + Yeni Lead
          </button>
        </div>
      </header>

      <div className="kpi-strip kpi-strip--compact" data-testid="lead-kpi-strip">
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--blue" aria-hidden>
            ◇
          </span>
          <div>
            <p className="kpi-card__label">Toplam</p>
            <p className="kpi-card__value">{items.length}</p>
          </div>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--orange" aria-hidden>
            ★
          </span>
          <div>
            <p className="kpi-card__label">Yeni</p>
            <p className="kpi-card__value">{newCount}</p>
          </div>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--green" aria-hidden>
            ✓
          </span>
          <div>
            <p className="kpi-card__label">Nitelikli</p>
            <p className="kpi-card__value">{qualifiedCount}</p>
          </div>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--blue" aria-hidden>
            ◎
          </span>
          <div>
            <p className="kpi-card__label">Ort. skor</p>
            <p className="kpi-card__value">{avgScore}</p>
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
            <option value="new">Yeni</option>
            <option value="contacted">İletişimde</option>
            <option value="qualified">Nitelikli</option>
            <option value="lost">Kayıp</option>
          </select>
        </label>
        <label className="entity-page__filter">
          <span className="entity-page__filter-label">Kaynak</span>
          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            aria-label="Kaynak filtresi"
          >
            <option value="all">Tümü</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </label>
        <label className="entity-page__filter">
          <span className="entity-page__filter-label">Sahip</span>
          <select
            value={ownerFilter}
            onChange={(event) => setOwnerFilter(event.target.value)}
            aria-label="Sahip filtresi"
          >
            <option value="all">Tümü</option>
            {owners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </label>
        <div className="entity-page__search-wrap">
          <span className="entity-page__search-icon" aria-hidden>
            ⌕
          </span>
          <input
            type="search"
            className="entity-page__search"
            placeholder="Lead veya şirket ara…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Lead ara"
          />
        </div>
        <button type="button" className="btn-ghost btn-ghost--compact" onClick={resetFilters}>
          Filtreleri sıfırla
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden>
            ⌕
          </span>
          <p>Filtrelere uygun lead bulunamadı.</p>
        </div>
      ) : (
        <div className="data-table-wrap data-table-wrap--flush">
          <table className="data-table data-table--premium" data-testid="lead-list-items">
            <thead>
              <tr>
                <th className="data-table__col-check" aria-label="Seç" />
                <th>Lead</th>
                <th>Şirket</th>
                <th>Kaynak</th>
                <th>Sahip</th>
                <th>Durum</th>
                <th>Skor</th>
                <th className="data-table__col-chevron" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((lead) => (
                <tr
                  key={lead.id}
                  className={
                    selectedLeadId === lead.id
                      ? 'data-table__row data-table__row--selected'
                      : 'data-table__row'
                  }
                  onClick={() => handleRowClick(lead)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleRowClick(lead);
                    }
                  }}
                  tabIndex={onSelectLead ? 0 : -1}
                  role={onSelectLead ? 'button' : undefined}
                  data-testid={`lead-row-${lead.id}`}
                >
                  <td className="data-table__col-check" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" disabled aria-label="Toplu seçim kapalı" />
                  </td>
                  <td>
                    <div className="data-table__primary">
                      <span className="data-table__avatar" aria-hidden>
                        {lead.fullName.charAt(0).toUpperCase()}
                      </span>
                      <span className="data-table__link">{lead.fullName}</span>
                    </div>
                  </td>
                  <td className="data-table__muted">{lead.companyName}</td>
                  <td className="data-table__muted">{lead.source.name}</td>
                  <td className="data-table__muted">{ownerLabel(lead)}</td>
                  <td>
                    <span className={leadStatusPillClass(lead.status as LeadStatus)}>
                      {leadStatusLabel(lead.status as LeadStatus)}
                    </span>
                  </td>
                  <td>
                    <ScoreBadge score={lead.score} />
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
        <p className="entity-footer__hint" data-testid="lead-api-notice">
          Canlı API — toplu işlem kapalıdır.
        </p>
      </footer>
    </section>
  );
}
