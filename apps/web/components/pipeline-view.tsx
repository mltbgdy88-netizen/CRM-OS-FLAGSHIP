'use client';

import { useMemo, useState } from 'react';
import {
  formatTryAmount,
  getMockOpportunity,
  MOCK_OPPORTUNITIES,
  MOCK_PIPELINE_STAGES,
  stageTotalAmount,
  type MockOpportunity,
} from '../lib/mock/pipeline-mock';
import { MockPreviewBadge } from './mock-preview-badge';
import { SlideOver } from './slide-over';

const OWNERS = ['Tümü', 'Ahmet Yılmaz', 'Selin Yılmaz', 'Mehmet Ak'] as const;

function OpportunityCard({
  opportunity,
  stageColor,
  selected,
  onSelect,
}: {
  opportunity: MockOpportunity;
  stageColor: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <article
      className={selected ? 'pipeline-card pipeline-card--selected' : 'pipeline-card'}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
      role="button"
      data-testid={`pipeline-card-${opportunity.id}`}
      style={{ borderLeftColor: stageColor }}
    >
      <h3 className="pipeline-card__title">{opportunity.title}</h3>
      <p className="pipeline-card__company">{opportunity.company}</p>
      <div className="pipeline-card__meta">
        <span className="pipeline-card__amount">{formatTryAmount(opportunity.amount)}</span>
        <span className="pipeline-card__probability">%{opportunity.probability}</span>
      </div>
      <footer className="pipeline-card__footer">
        <span className="pipeline-card__owner">{opportunity.owner}</span>
        <time className="pipeline-card__next" dateTime={opportunity.nextActivityAt}>
          {new Date(opportunity.nextActivityAt).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
          })}
        </time>
      </footer>
    </article>
  );
}

function OpportunityPreview({ opportunity, onClose }: { opportunity: MockOpportunity; onClose: () => void }) {
  const stage = MOCK_PIPELINE_STAGES.find((s) => s.id === opportunity.stageId);

  return (
    <div className="pipeline-preview" data-testid="pipeline-opportunity-preview">
      <header className="pipeline-preview__header">
        <h3>{opportunity.title}</h3>
        <span
          className="pipeline-preview__stage"
          style={{ background: `${stage?.color ?? '#ff6a00'}22`, color: stage?.color }}
        >
          {stage?.name}
        </span>
      </header>
      <dl className="detail-info-grid">
        <div>
          <dt>Şirket</dt>
          <dd>{opportunity.company}</dd>
        </div>
        <div>
          <dt>Tutar</dt>
          <dd>{formatTryAmount(opportunity.amount)}</dd>
        </div>
        <div>
          <dt>Olasılık</dt>
          <dd>%{opportunity.probability}</dd>
        </div>
        <div>
          <dt>Sahip</dt>
          <dd>{opportunity.owner}</dd>
        </div>
        <div>
          <dt>Sonraki aktivite</dt>
          <dd>{opportunity.nextActivityLabel}</dd>
        </div>
        <div>
          <dt>Tarih</dt>
          <dd>{new Date(opportunity.nextActivityAt).toLocaleString('tr-TR')}</dd>
        </div>
      </dl>
      <p className="pipeline-preview__ai">
        AI: Bu fırsat için <strong>teklif revizyonu</strong> önerilir — benzer kapanışlar ortalama 9 gün
        sürüyor.
      </p>
      <footer className="detail-slide-footer">
        <button type="button" className="btn-ghost" onClick={onClose}>
          Kapat
        </button>
      </footer>
    </div>
  );
}

export function PipelineView() {
  const [ownerFilter, setOwnerFilter] = useState<string>('Tümü');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredOpportunities = useMemo(() => {
    if (ownerFilter === 'Tümü') {
      return MOCK_OPPORTUNITIES;
    }
    return MOCK_OPPORTUNITIES.filter((opp) => opp.owner === ownerFilter);
  }, [ownerFilter]);

  const openPipelineValue = filteredOpportunities
    .filter((opp) => opp.stageId !== 'won' && opp.stageId !== 'lost')
    .reduce((sum, opp) => sum + opp.amount, 0);

  const avgProbability = Math.round(
    filteredOpportunities.reduce((sum, opp) => sum + opp.probability, 0) /
      Math.max(1, filteredOpportunities.length),
  );

  const wonThisMonth = filteredOpportunities.filter((opp) => opp.stageId === 'won').length;
  const selectedOpportunity = selectedId ? getMockOpportunity(selectedId) : undefined;

  return (
    <>
      <section className="workspace-card entity-page pipeline-page" data-testid="pipeline-page">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">Satış Pipeline</h1>
            <span className="entity-page__count">{filteredOpportunities.length} fırsat</span>
          </div>
          <div className="entity-page__header-actions">
            <MockPreviewBadge />
            <button type="button" className="btn-accent-green" disabled title="Sprint-06 ile aktif olacak">
              + Yeni Fırsat
            </button>
          </div>
        </header>

        <div className="kpi-strip kpi-strip--compact" data-testid="pipeline-kpi-strip">
          <article className="kpi-card">
            <span className="kpi-card__icon kpi-card__icon--orange" aria-hidden>
              ₺
            </span>
            <div>
              <p className="kpi-card__label">Açık pipeline</p>
              <p className="kpi-card__value">{formatTryAmount(openPipelineValue)}</p>
            </div>
          </article>
          <article className="kpi-card">
            <span className="kpi-card__icon kpi-card__icon--blue" aria-hidden>
              ◆
            </span>
            <div>
              <p className="kpi-card__label">Fırsat</p>
              <p className="kpi-card__value">{filteredOpportunities.length}</p>
            </div>
          </article>
          <article className="kpi-card">
            <span className="kpi-card__icon kpi-card__icon--green" aria-hidden>
              %
            </span>
            <div>
              <p className="kpi-card__label">Ort. olasılık</p>
              <p className="kpi-card__value">%{avgProbability}</p>
            </div>
          </article>
          <article className="kpi-card">
            <span className="kpi-card__icon kpi-card__icon--green" aria-hidden>
              ✓
            </span>
            <div>
              <p className="kpi-card__label">Kazanılan</p>
              <p className="kpi-card__value">{wonThisMonth}</p>
            </div>
          </article>
        </div>

        <div className="entity-page__filters">
          <label className="entity-page__filter">
            <span className="entity-page__filter-label">Pipeline</span>
            <select defaultValue="default" aria-label="Pipeline seçimi" disabled>
              <option value="default">Ana Satış Pipeline</option>
            </select>
          </label>
          <label className="entity-page__filter">
            <span className="entity-page__filter-label">Sahip</span>
            <select
              value={ownerFilter}
              onChange={(event) => setOwnerFilter(event.target.value)}
              aria-label="Sahip filtresi"
            >
              {OWNERS.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </label>
          <label className="entity-page__filter">
            <span className="entity-page__filter-label">Dönem</span>
            <select defaultValue="quarter" aria-label="Dönem filtresi">
              <option value="month">Bu ay</option>
              <option value="quarter">Bu çeyrek</option>
              <option value="year">Bu yıl</option>
            </select>
          </label>
        </div>

        <div className="pipeline-board" data-testid="pipeline-board">
          {MOCK_PIPELINE_STAGES.map((stage) => {
            const cards = filteredOpportunities.filter((opp) => opp.stageId === stage.id);
            const total = stageTotalAmount(stage.id);

            return (
              <div key={stage.id} className="pipeline-column" data-testid={`pipeline-column-${stage.id}`}>
                <header
                  className="pipeline-column__header"
                  style={{ borderTopColor: stage.color }}
                >
                  <div>
                    <h2 className="pipeline-column__title">{stage.name}</h2>
                    <p className="pipeline-column__count">
                      {cards.length} · {formatTryAmount(total)}
                    </p>
                  </div>
                  <span className="pipeline-column__badge" style={{ background: `${stage.color}22`, color: stage.color }}>
                    {cards.length}
                  </span>
                </header>
                <div className="pipeline-column__cards">
                  {cards.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      stageColor={stage.color}
                      selected={selectedId === opp.id}
                      onSelect={() => setSelectedId(opp.id)}
                    />
                  ))}
                  {cards.length === 0 ? (
                    <p className="pipeline-column__empty">Bu aşamada fırsat yok</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <footer className="entity-footer">
          <p className="entity-footer__hint" data-testid="pipeline-mock-notice">
            Demo kanban — gerçek API Sprint-06 ile bağlanacak. Sürükle-bırak Sprint-06 kapsamında.
          </p>
        </footer>
      </section>

      <SlideOver
        open={Boolean(selectedOpportunity)}
        title={selectedOpportunity?.title ?? 'Fırsat Detayı'}
        onClose={() => setSelectedId(null)}
        testId="pipeline-slide-over"
      >
        {selectedOpportunity ? (
          <OpportunityPreview
            opportunity={selectedOpportunity}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
      </SlideOver>
    </>
  );
}
