'use client';

import { useEffect, useMemo, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import {
  listPipelines,
  pickDefaultPipeline,
  type OpportunitySummary,
  type PipelineStageSummary,
  type PipelineSummary,
} from '../lib/api/pipelines-client';
import { formatTryAmount } from '../lib/mock/pipeline-mock';
import { SlideOver } from './slide-over';
import { TableSkeleton } from './table-skeleton';

interface PipelineCardView {
  id: string;
  title: string;
  company: string;
  amount: number;
  probability: number;
  owner: string;
  stageId: string;
  nextActivityAt: string;
  nextActivityLabel: string;
}

function ownerLabel(opportunity: OpportunitySummary): string {
  return opportunity.assignedUserId ? 'Atanmış' : 'Atanmamış';
}

function mapOpportunityForCard(opportunity: OpportunitySummary): PipelineCardView {
  return {
    id: opportunity.id,
    title: opportunity.title,
    company: opportunity.companyName,
    amount: opportunity.amount,
    probability: opportunity.probability,
    owner: ownerLabel(opportunity),
    stageId: opportunity.stageId,
    nextActivityAt:
      opportunity.nextActivityAt ?? opportunity.updatedAt ?? opportunity.createdAt,
    nextActivityLabel: opportunity.nextActivityLabel ?? opportunity.status,
  };
}

function OpportunityCard({
  opportunity,
  stageColor,
  selected,
  onSelect,
}: {
  opportunity: PipelineCardView;
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

function OpportunityPreview({
  opportunity,
  stage,
  onClose,
}: {
  opportunity: PipelineCardView;
  stage: PipelineStageSummary | undefined;
  onClose: () => void;
}) {
  return (
    <div className="pipeline-preview" data-testid="pipeline-opportunity-preview">
      <header className="pipeline-preview__header">
        <h3>{opportunity.title}</h3>
        <span
          className="pipeline-preview__stage"
          style={{ background: `${stage?.color ?? '#ff6a00'}22`, color: stage?.color ?? '#ff6a00' }}
        >
          {stage?.name ?? '—'}
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
  const [state, setState] = useState<'loading' | 'empty' | 'error' | 'forbidden' | 'success'>(
    'loading',
  );
  const [pipeline, setPipeline] = useState<PipelineSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<string>('Tümü');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState('loading');
      try {
        const result = await listPipelines();
        if (cancelled) {
          return;
        }

        const activePipeline = pickDefaultPipeline(result.items);
        if (!activePipeline || activePipeline.stages.length === 0) {
          setPipeline(null);
          setState('empty');
          return;
        }

        setPipeline(activePipeline);
        setState('success');
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiClientError && error.kind === 'forbidden') {
          setState('forbidden');
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Pipeline yüklenemedi');
        setState('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stages = pipeline?.stages ?? [];
  const opportunities = useMemo(
    () => (pipeline?.opportunities ?? []).map(mapOpportunityForCard),
    [pipeline],
  );

  const stageById = useMemo(
    () => new Map(stages.map((stage) => [stage.id, stage])),
    [stages],
  );

  const owners = useMemo(
    () => ['Tümü', ...new Set(opportunities.map((opp) => opp.owner))].sort((a, b) => {
      if (a === 'Tümü') {
        return -1;
      }
      if (b === 'Tümü') {
        return 1;
      }
      return a.localeCompare(b, 'tr');
    }),
    [opportunities],
  );

  const filteredOpportunities = useMemo(() => {
    if (ownerFilter === 'Tümü') {
      return opportunities;
    }
    return opportunities.filter((opp) => opp.owner === ownerFilter);
  }, [opportunities, ownerFilter]);

  const isClosedStage = (stageId: string) => {
    const code = stageById.get(stageId)?.code;
    return code === 'won' || code === 'lost';
  };

  const isWonStage = (stageId: string) => stageById.get(stageId)?.code === 'won';

  const openPipelineValue = filteredOpportunities
    .filter((opp) => !isClosedStage(opp.stageId))
    .reduce((sum, opp) => sum + opp.amount, 0);

  const avgProbability = Math.round(
    filteredOpportunities.reduce((sum, opp) => sum + opp.probability, 0) /
      Math.max(1, filteredOpportunities.length),
  );

  const wonCount = filteredOpportunities.filter((opp) => isWonStage(opp.stageId)).length;
  const selectedOpportunity = selectedId
    ? opportunities.find((opp) => opp.id === selectedId)
    : undefined;
  const selectedStage = selectedOpportunity
    ? stageById.get(selectedOpportunity.stageId)
    : undefined;

  if (state === 'loading') {
    return (
      <section className="workspace-card entity-page pipeline-page" data-testid="pipeline-page">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">Satış Pipeline</h1>
          </div>
        </header>
        <TableSkeleton rows={4} columns={3} testId="pipeline-loading" />
      </section>
    );
  }

  if (state === 'forbidden') {
    return (
      <section className="workspace-card entity-page pipeline-page" data-testid="pipeline-page">
        <p className="state-message state-message--forbidden" data-testid="pipeline-forbidden">
          Pipeline görüntüleme yetkiniz yok.
        </p>
      </section>
    );
  }

  if (state === 'error') {
    return (
      <section className="workspace-card entity-page pipeline-page" data-testid="pipeline-page">
        <p className="state-message state-message--error" data-testid="pipeline-error">
          {errorMessage}
        </p>
      </section>
    );
  }

  if (state === 'empty') {
    return (
      <section className="workspace-card entity-page pipeline-page" data-testid="pipeline-page">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">Satış Pipeline</h1>
            <span className="entity-page__count">0 pipeline</span>
          </div>
        </header>
        <div className="empty-state" data-testid="pipeline-empty">
          <span className="empty-state__icon" aria-hidden>
            ◇
          </span>
          <p>Henüz pipeline tanımı yok.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="workspace-card entity-page pipeline-page" data-testid="pipeline-page">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">Satış Pipeline</h1>
            <span className="entity-page__count">{filteredOpportunities.length} fırsat</span>
          </div>
          <div className="entity-page__header-actions">
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
              <p className="kpi-card__value">{wonCount}</p>
            </div>
          </article>
        </div>

        <div className="entity-page__filters">
          <label className="entity-page__filter">
            <span className="entity-page__filter-label">Pipeline</span>
            <select
              value={pipeline?.id ?? 'default'}
              aria-label="Pipeline seçimi"
              disabled
            >
              <option value={pipeline?.id ?? 'default'}>{pipeline?.name ?? 'Pipeline'}</option>
            </select>
          </label>
          <label className="entity-page__filter">
            <span className="entity-page__filter-label">Sahip</span>
            <select
              value={ownerFilter}
              onChange={(event) => setOwnerFilter(event.target.value)}
              aria-label="Sahip filtresi"
            >
              {owners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </label>
          <label className="entity-page__filter">
            <span className="entity-page__filter-label">Dönem</span>
            <select defaultValue="quarter" aria-label="Dönem filtresi" disabled>
              <option value="month">Bu ay</option>
              <option value="quarter">Bu çeyrek</option>
              <option value="year">Bu yıl</option>
            </select>
          </label>
        </div>

        <div className="pipeline-board" data-testid="pipeline-board">
          {stages.map((stage) => {
            const cards = filteredOpportunities.filter((opp) => opp.stageId === stage.id);
            const total = cards.reduce((sum, opp) => sum + opp.amount, 0);
            const stageColor = stage.color ?? '#ff6a00';

            return (
              <div
                key={stage.id}
                className="pipeline-column"
                data-testid={`pipeline-column-${stage.code}`}
              >
                <header
                  className="pipeline-column__header"
                  style={{ borderTopColor: stageColor }}
                >
                  <div>
                    <h2 className="pipeline-column__title">{stage.name}</h2>
                    <p className="pipeline-column__count">
                      {cards.length} · {formatTryAmount(total)}
                    </p>
                  </div>
                  <span
                    className="pipeline-column__badge"
                    style={{ background: `${stageColor}22`, color: stageColor }}
                  >
                    {cards.length}
                  </span>
                </header>
                <div className="pipeline-column__cards">
                  {cards.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      stageColor={stageColor}
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
          <p className="entity-footer__hint" data-testid="pipeline-api-notice">
            Canlı API — sürükle-bırak Sprint-08 kapsamında.
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
            stage={selectedStage}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
      </SlideOver>
    </>
  );
}
