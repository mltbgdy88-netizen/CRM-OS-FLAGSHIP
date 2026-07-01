import type { Opportunity, Pipeline, PipelineStage } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

type OpportunityRecord = Opportunity & {
  pipeline: Pipeline;
  stage: PipelineStage;
};

function decimalToNumber(value: Decimal | number): number {
  if (value instanceof Decimal) {
    return value.toNumber();
  }
  return value;
}

export function mapOpportunitySummary(opportunity: OpportunityRecord) {
  return {
    id: opportunity.id,
    pipelineId: opportunity.pipelineId,
    stageId: opportunity.stageId,
    leadId: opportunity.leadId,
    customerId: opportunity.customerId,
    title: opportunity.title,
    companyName: opportunity.companyName,
    amount: decimalToNumber(opportunity.amount),
    probability: opportunity.probability,
    status: opportunity.status,
    assignedUserId: opportunity.assignedUserId,
    pipeline: {
      id: opportunity.pipeline.id,
      name: opportunity.pipeline.name,
      code: opportunity.pipeline.code,
    },
    stage: {
      id: opportunity.stage.id,
      name: opportunity.stage.name,
      code: opportunity.stage.code,
    },
    createdAt: opportunity.createdAt.toISOString(),
    updatedAt: opportunity.updatedAt?.toISOString() ?? null,
    version: opportunity.version,
  };
}
