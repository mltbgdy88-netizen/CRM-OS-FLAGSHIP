import type {
  Opportunity,
  OpportunityActivity,
  OpportunityContact,
  OpportunityNote,
  OpportunityProduct,
  Pipeline,
  PipelineStage,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

type OpportunityRecord = Opportunity & {
  pipeline: Pipeline;
  stage: PipelineStage;
};

type OpportunityDetailRecord = OpportunityRecord & {
  products: OpportunityProduct[];
  contacts: OpportunityContact[];
  activities: OpportunityActivity[];
  notes: OpportunityNote[];
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

export function mapOpportunityDetail(opportunity: OpportunityDetailRecord) {
  return {
    ...mapOpportunitySummary(opportunity),
    products: opportunity.products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      quantity: product.quantity,
      unitPrice: decimalToNumber(product.unitPrice),
      createdAt: product.createdAt.toISOString(),
      version: product.version,
    })),
    contacts: opportunity.contacts.map((contact) => ({
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      title: contact.title,
      isPrimary: contact.isPrimary,
      createdAt: contact.createdAt.toISOString(),
      version: contact.version,
    })),
    activities: opportunity.activities.map((activity) => ({
      id: activity.id,
      activityType: activity.activityType,
      title: activity.title,
      body: activity.body,
      dueAt: activity.dueAt?.toISOString() ?? null,
      createdAt: activity.createdAt.toISOString(),
      version: activity.version,
    })),
    notes: opportunity.notes.map((note) => ({
      id: note.id,
      title: note.title,
      body: note.body,
      createdAt: note.createdAt.toISOString(),
      version: note.version,
    })),
  };
}
