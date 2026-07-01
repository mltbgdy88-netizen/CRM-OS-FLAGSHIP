'use client';

import { useMemo, useState } from 'react';
import {
  leadStatusLabel,
  leadStatusPillClass,
  MOCK_LEADS,
  scoreTone,
  type LeadStatus,
  type MockLead,
} from '../lib/mock/leads-mock';
import { MockPreviewBadge } from './mock-preview-badge';

type StatusFilter = 'all' | LeadStatus;
type SourceFilter = 'all' | string;

interface LeadListViewProps {
  onSelectLead?: (id: string) => void;
  selectedLeadId?: string | null;
}

const SOURCES = ['Web formu', 'LinkedIn', 'Referans', 'Fuar', 'Soğuk arama'] as const;

function ScoreBadge({ score }: { score: number }) {
  const tone = scoreTone(score);
  return (
    <span className={`lead-score lead-score--${tone}`} data-testid={`lead-score-${score}`}>
      {score}
    </span>
  );
}

export function LeadListView({ onSelectLead, selectedLeadId }: LeadListViewProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const owners = useMemo(
    () => [...new Set(MOCK_LEADS.map((lead) => lead.owner))].sort(),
    [],
  );

  const filteredItems = useMemo(() => {
    let result = MOCK_LEADS;
    if (statusFilter !== 'all') {
      result = result.filter((lead) => lead.status === statusFilter);
    }
    if (sourceFilter !== 'all') {
      result = result.filter((lead) => lead.source === sourceFilter);
    }
    if (ownerFilter !== 'all') {
      result = result.filter((lead) => lead.owner === ownerFilter);
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (lead) =>
          lead.displayName.toLowerCase().includes(query) ||
          lead.company.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query),
      );
    }
    return result;
  }, [ownerFilter, searchQuery, sourceFilter, statusFilter]);

  const qualifiedCount = MOCK_LEADS.filter((lead) => lead.status === 'qualified').length;
  const newCount = MOCK_LEADS.filter((lead) => lead.status === 'new').length;
  const avgScore = Math.round(
    MOCK_LEADS.reduce((sum, lead) => sum + lead.score, 0) / MOCK_LEADS.length,
  );

  function handleRowClick(lead: MockLead) {
    onSelectLead?.(lead.id);
  }

  function resetFilters() {
    setStatusFilter('all');
    setSourceFilter('all');
    setOwnerFilter('all');
    setSearchQuery('');
  }

  return (
    <section className="workspace-card entity-page" data-testid="lead-list">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">Leadler</h1>
          <span className="entity-page__count">{MOCK_LEADS.length} kayıt</span>
        </div>
        <div className="entity-page__header-actions">
          <MockPreviewBadge />
          <button type="button" className="btn-accent-green" disabled title="Sprint-05 ile aktif olacak">
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
            <p className="kpi-card__value">{MOCK_LEADS.length}</p>
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
            {SOURCES.map((source) => (
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
                        {lead.displayName.charAt(0).toUpperCase()}
                      </span>
                      <span className="data-table__link">{lead.displayName}</span>
                    </div>
                  </td>
                  <td className="data-table__muted">{lead.company}</td>
                  <td className="data-table__muted">{lead.source}</td>
                  <td className="data-table__muted">{lead.owner}</td>
                  <td>
                    <span className={leadStatusPillClass(lead.status)}>
                      {leadStatusLabel(lead.status)}
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
        <p className="entity-footer__hint" data-testid="lead-mock-notice">
          Demo veri — gerçek API Sprint-05 ile bağlanacak. Toplu işlem kapalıdır.
        </p>
      </footer>
    </section>
  );
}
