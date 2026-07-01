'use client';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { patchOpportunityStage } from '../lib/api/opportunities-client';
import {
  getPipelineBoard,
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

function OpportunityCardContent({
  opportunity,
  stageColor,
}: {
  opportunity: PipelineCardView;
  stageColor: string;
}) {
  return (
    <>
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
    </>
  );
}

function DraggableOpportunityCard({
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
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: opportunity.id,
  });

  const style = {
    borderLeftColor: stageColor,
    transform: CSS.Translate.toString(transform),
  };

  const className = [
    'pipeline-card',
    selected ? 'pipeline-card--selected' : '',
    isDragging ? 'pipeline-card--dragging' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={className}
      style={style}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      data-testid={`pipeline-card-${opportunity.id}`}
    >
      <OpportunityCardContent opportunity={opportunity} stageColor={stageColor} />
    </article>
  );
}

function DroppableColumn({
  stage,
  stageColor,
  cards,
  selectedId,
  onSelect,
}: {
  stage: PipelineStageSummary;
  stageColor: string;
  cards: PipelineCardView[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = cards.reduce((sum, opp) => sum + opp.amount, 0);

  return (
    <div
      className={isOver ? 'pipeline-column pipeline-column--over' : 'pipeline-column'}
      data-testid={`pipeline-column-${stage.code}`}
    >
      <header className="pipeline-column__header" style={{ borderTopColor: stageColor }}>
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
      <div ref={setNodeRef} className="pipeline-column__cards">
        {cards.map((opp) => (
          <DraggableOpportunityCard
            key={opp.id}
            opportunity={opp}
            stageColor={stageColor}
            selected={selectedId === opp.id}
            onSelect={() => onSelect(opp.id)}
          />
        ))}
        {cards.length === 0 ? (
          <p className="pipeline-column__empty">Bu aşamada fırsat yok</p>
        ) : null}
      </div>
    </div>
  );
}

function resolveStageDrop(
  activeId: string | number,
  overId: string | number | undefined,
  opportunities: PipelineCardView[],
): { opportunityId: string; previousStageId: string; targetStageId: string } | null {
  if (overId === undefined) {
    return null;
  }

  const opportunityId = String(activeId);
  const targetStageId = String(overId);
  const opportunity = opportunities.find((opp) => opp.id === opportunityId);

  if (!opportunity || opportunity.stageId === targetStageId) {
    return null;
  }

  return {
    opportunityId,
    previousStageId: opportunity.stageId,
    targetStageId,
  };
}

export async function applyPipelineStageDrop(
  drop: { opportunityId: string; previousStageId: string; targetStageId: string },
  setPipeline: Dispatch<SetStateAction<PipelineSummary | null>>,
): Promise<void> {
  const { opportunityId, previousStageId, targetStageId } = drop;

  setPipeline((current) => {
    if (!current) {
      return current;
    }
    return {
      ...current,
      opportunities: (current.opportunities ?? []).map((opp) =>
        opp.id === opportunityId ? { ...opp, stageId: targetStageId } : opp,
      ),
    };
  });

  try {
    await patchOpportunityStage(opportunityId, { stageId: targetStageId });
  } catch {
    setPipeline((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        opportunities: (current.opportunities ?? []).map((opp) =>
          opp.id === opportunityId ? { ...opp, stageId: previousStageId } : opp,
        ),
      };
    });
  }
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
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

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
        if (!activePipeline) {
          setPipeline(null);
          setState('empty');
          return;
        }

        const board = await getPipelineBoard(activePipeline.id);
        if (cancelled) {
          return;
        }

        if (board.stages.length === 0) {
          setPipeline(null);
          setState('empty');
          return;
        }

        setPipeline(board);
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

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null);

      const drop = resolveStageDrop(event.active.id, event.over?.id, opportunities);
      if (!drop || !pipeline) {
        return;
      }

      void applyPipelineStageDrop(drop, setPipeline);
    },
    [opportunities, pipeline],
  );

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
  const activeDragOpportunity = activeDragId
    ? opportunities.find((opp) => opp.id === activeDragId)
    : undefined;
  const activeDragStageColor =
    activeDragOpportunity && stageById.get(activeDragOpportunity.stageId)?.color
      ? (stageById.get(activeDragOpportunity.stageId)?.color ?? '#ff6a00')
      : '#ff6a00';

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

        <div data-testid="pipeline-board-dnd">
          <DndContext
            sensors={sensors}
            onDragStart={(event) => setActiveDragId(String(event.active.id))}
            onDragEnd={handleDragEnd}
          >
            <div className="pipeline-board" data-testid="pipeline-board">
              {stages.map((stage) => {
                const cards = filteredOpportunities.filter((opp) => opp.stageId === stage.id);
                const stageColor = stage.color ?? '#ff6a00';

                return (
                  <DroppableColumn
                    key={stage.id}
                    stage={stage}
                    stageColor={stageColor}
                    cards={cards}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                  />
                );
              })}
            </div>
            <DragOverlay>
              {activeDragOpportunity ? (
                <article
                  className="pipeline-card pipeline-card--dragging"
                  style={{ borderLeftColor: activeDragStageColor }}
                >
                  <OpportunityCardContent
                    opportunity={activeDragOpportunity}
                    stageColor={activeDragStageColor}
                  />
                </article>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        <footer className="entity-footer">
          <p className="entity-footer__hint" data-testid="pipeline-api-notice">
            Canlı API — kartları sürükleyerek aşama değiştirebilirsiniz.
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
