import type { Opportunity, Pipeline, PipelineStage } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

type PipelineRecord = Pipeline & {
  stages: PipelineStage[];
  opportunities?: Opportunity[];
};

function decimalToNumber(value: Decimal | number): number {
  if (value instanceof Decimal) {
    return value.toNumber();
  }
  return value;
}

function mapOpportunityCard(opportunity: Opportunity) {
  return {
    id: opportunity.id,
    title: opportunity.title,
    companyName: opportunity.companyName,
    amount: decimalToNumber(opportunity.amount),
    probability: opportunity.probability,
    stageId: opportunity.stageId,
    status: opportunity.status,
    assignedUserId: opportunity.assignedUserId,
    createdAt: opportunity.createdAt.toISOString(),
    updatedAt: opportunity.updatedAt?.toISOString() ?? null,
    version: opportunity.version,
  };
}

export function mapPipelineSummary(pipeline: PipelineRecord) {
  const opportunities = (pipeline.opportunities ?? [])
    .filter((opportunity) => opportunity.deletedAt === null)
    .map(mapOpportunityCard);

  const opportunitiesByStage = new Map<string, ReturnType<typeof mapOpportunityCard>[]>();
  for (const opportunity of opportunities) {
    const bucket = opportunitiesByStage.get(opportunity.stageId) ?? [];
    bucket.push(opportunity);
    opportunitiesByStage.set(opportunity.stageId, bucket);
  }

  return {
    id: pipeline.id,
    name: pipeline.name,
    code: pipeline.code,
    isDefault: pipeline.isDefault,
    stages: pipeline.stages
      .filter((stage) => stage.deletedAt === null)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((stage) => ({
        id: stage.id,
        name: stage.name,
        code: stage.code,
        sortOrder: stage.sortOrder,
        color: stage.color,
        opportunities: opportunitiesByStage.get(stage.id) ?? [],
      })),
    opportunities,
    createdAt: pipeline.createdAt.toISOString(),
    updatedAt: pipeline.updatedAt?.toISOString() ?? null,
    version: pipeline.version,
  };
}
