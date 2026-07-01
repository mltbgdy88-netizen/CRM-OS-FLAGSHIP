import { authenticatedFetch, parseApiResponse } from './authenticated-fetch';

export interface OpportunitySummary {
  id: string;
  title: string;
  companyName: string;
  amount: number;
  probability: number;
  stageId: string;
  status: string;
  assignedUserId: string | null;
  nextActivityAt?: string | null;
  nextActivityLabel?: string | null;
  createdAt: string;
  updatedAt: string | null;
  version: number;
}

export interface PipelineStageSummary {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  color: string | null;
  opportunities?: OpportunitySummary[];
}

export interface PipelineSummary {
  id: string;
  name: string;
  code: string;
  isDefault: boolean;
  stages: PipelineStageSummary[];
  opportunities?: OpportunitySummary[];
}

export interface PipelineListResult {
  items: PipelineSummary[];
}

type RawPipelineList = PipelineSummary[] | PipelineListResult | PipelineSummary;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function normalizeOpportunity(raw: unknown): OpportunitySummary {
  const opp = isRecord(raw) ? raw : {};
  return {
    id: String(opp.id ?? ''),
    title: String(opp.title ?? ''),
    companyName: String(opp.companyName ?? opp.company_name ?? ''),
    amount: toNumber(opp.amount),
    probability: toNumber(opp.probability),
    stageId: String(opp.stageId ?? opp.stage_id ?? ''),
    status: String(opp.status ?? 'open'),
    assignedUserId:
      opp.assignedUserId === null || opp.assignedUserId === undefined
        ? opp.assigned_user_id === null || opp.assigned_user_id === undefined
          ? null
          : String(opp.assigned_user_id)
        : String(opp.assignedUserId),
    nextActivityAt:
      opp.nextActivityAt === undefined
        ? opp.next_activity_at === undefined
          ? undefined
          : opp.next_activity_at === null
            ? null
            : String(opp.next_activity_at)
        : opp.nextActivityAt === null
          ? null
          : String(opp.nextActivityAt),
    nextActivityLabel:
      opp.nextActivityLabel === undefined
        ? opp.next_activity_label === undefined
          ? undefined
          : opp.next_activity_label === null
            ? null
            : String(opp.next_activity_label)
        : opp.nextActivityLabel === null
          ? null
          : String(opp.nextActivityLabel),
    createdAt: String(opp.createdAt ?? opp.created_at ?? new Date(0).toISOString()),
    updatedAt:
      opp.updatedAt === null || opp.updatedAt === undefined
        ? opp.updated_at === null || opp.updated_at === undefined
          ? null
          : String(opp.updated_at)
        : String(opp.updatedAt),
    version: toNumber(opp.version, 1),
  };
}

function normalizeStage(raw: unknown): PipelineStageSummary {
  const stage = isRecord(raw) ? raw : {};
  const nestedOpportunities = Array.isArray(stage.opportunities)
    ? stage.opportunities.map(normalizeOpportunity)
    : undefined;

  return {
    id: String(stage.id ?? ''),
    code: String(stage.code ?? ''),
    name: String(stage.name ?? ''),
    sortOrder: toNumber(stage.sortOrder ?? stage.sort_order),
    color:
      stage.color === null || stage.color === undefined ? null : String(stage.color),
    opportunities: nestedOpportunities,
  };
}

function normalizePipeline(raw: unknown): PipelineSummary {
  const pipeline = isRecord(raw) ? raw : {};
  const stages = Array.isArray(pipeline.stages)
    ? pipeline.stages.map(normalizeStage).sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  const pipelineOpportunities = Array.isArray(pipeline.opportunities)
    ? pipeline.opportunities.map(normalizeOpportunity)
    : undefined;

  const stageOpportunities = stages.flatMap((stage) => stage.opportunities ?? []);
  const opportunities =
    pipelineOpportunities ??
    (stageOpportunities.length > 0 ? stageOpportunities : undefined) ??
    [];

  return {
    id: String(pipeline.id ?? ''),
    name: String(pipeline.name ?? ''),
    code: String(pipeline.code ?? ''),
    isDefault: Boolean(pipeline.isDefault ?? pipeline.is_default),
    stages,
    opportunities,
  };
}

function normalizePipelineList(raw: RawPipelineList): PipelineSummary[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizePipeline);
  }
  if (isRecord(raw) && Array.isArray(raw.items)) {
    return raw.items.map(normalizePipeline);
  }
  return [normalizePipeline(raw)];
}

export function pickDefaultPipeline(pipelines: PipelineSummary[]): PipelineSummary | null {
  if (pipelines.length === 0) {
    return null;
  }
  return pipelines.find((pipeline) => pipeline.isDefault) ?? pipelines[0] ?? null;
}

export async function listPipelines(): Promise<PipelineListResult> {
  const response = await authenticatedFetch('/api/v1/pipelines');
  const raw = await parseApiResponse<RawPipelineList>(response);
  return { items: normalizePipelineList(raw) };
}

export async function getPipelineBoard(pipelineId: string): Promise<PipelineSummary> {
  const response = await authenticatedFetch(`/api/v1/pipelines/${pipelineId}/board`);
  const raw = await parseApiResponse<unknown>(response);
  return normalizePipeline(raw);
}
