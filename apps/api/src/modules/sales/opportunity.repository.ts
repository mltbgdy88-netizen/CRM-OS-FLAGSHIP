import { Injectable } from '@nestjs/common';
import type { TenantContext } from '@crm-os/database';
import { withTenantContext } from '@crm-os/database';
import { PrismaService } from '../../database/prisma.service';

const opportunitySummaryInclude = {
  pipeline: true,
  stage: true,
} as const;

const opportunityDetailInclude = {
  ...opportunitySummaryInclude,
  products: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' as const },
  },
  contacts: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' as const },
  },
  activities: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' as const },
  },
  notes: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' as const },
  },
} as const;

@Injectable()
export class OpportunityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countOpportunities(context: TenantContext): Promise<number> {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.opportunity.count({ where: { deletedAt: null } }),
    );
  }

  async listOpportunities(context: TenantContext, input: { skip: number; take: number }) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.opportunity.findMany({
        where: { deletedAt: null },
        include: opportunitySummaryInclude,
        orderBy: { createdAt: 'desc' },
        skip: input.skip,
        take: input.take,
      }),
    );
  }

  async findOpportunityById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.opportunity.findFirst({
        where: { id, deletedAt: null },
        include: opportunitySummaryInclude,
      }),
    );
  }

  async findOpportunityDetailById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.opportunity.findFirst({
        where: { id, deletedAt: null },
        include: opportunityDetailInclude,
      }),
    );
  }

  async updateOpportunity(
    context: TenantContext,
    id: string,
    input: {
      title?: string;
      companyName?: string;
      amount?: number;
      probability?: number;
      status?: string;
      stageId?: string;
      assignedUserId?: string | null;
    },
  ) {
    const data: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy: context.userId,
      version: { increment: 1 },
    };

    if (input.title !== undefined) data.title = input.title;
    if (input.companyName !== undefined) data.companyName = input.companyName;
    if (input.amount !== undefined) data.amount = input.amount;
    if (input.probability !== undefined) data.probability = input.probability;
    if (input.status !== undefined) data.status = input.status;
    if (input.stageId !== undefined) data.stageId = input.stageId;
    if (Object.prototype.hasOwnProperty.call(input, 'assignedUserId')) {
      data.assignedUserId = input.assignedUserId ?? null;
    }

    return withTenantContext(this.prisma, context, async (tx) =>
      tx.opportunity.update({
        where: { id },
        data,
        include: opportunitySummaryInclude,
      }),
    );
  }

  async findCustomerById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.customer.findFirst({
        where: { id, deletedAt: null },
      }),
    );
  }

  async findLeadById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.lead.findFirst({
        where: { id, deletedAt: null },
      }),
    );
  }

  async findTenantMemberByUserId(context: TenantContext, userId: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.tenantMember.findFirst({
        where: {
          tenantId: context.tenantId,
          userId,
          deletedAt: null,
        },
      }),
    );
  }

  async createOpportunity(
    context: TenantContext,
    input: {
      pipelineId: string;
      stageId: string;
      leadId?: string | null;
      customerId?: string | null;
      title: string;
      companyName: string;
      amount?: number;
      probability?: number;
      assignedUserId?: string | null;
    },
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.opportunity.create({
        data: {
          tenantId: context.tenantId,
          pipelineId: input.pipelineId,
          stageId: input.stageId,
          leadId: input.leadId ?? null,
          customerId: input.customerId ?? null,
          title: input.title,
          companyName: input.companyName,
          amount: input.amount ?? 0,
          probability: input.probability ?? 0,
          status: 'open',
          assignedUserId: input.assignedUserId ?? null,
          createdBy: context.userId,
        },
        include: opportunitySummaryInclude,
      }),
    );
  }

  async appendStageHistory(
    context: TenantContext,
    input: {
      opportunityId: string;
      fromStageId: string | null;
      toStageId: string;
    },
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.opportunityStageHistory.create({
        data: {
          tenantId: context.tenantId,
          opportunityId: input.opportunityId,
          fromStageId: input.fromStageId,
          toStageId: input.toStageId,
          createdBy: context.userId,
        },
      }),
    );
  }

  async appendLeadConversionLog(
    context: TenantContext,
    input: {
      leadId: string;
      opportunityId: string;
      customerId: string;
    },
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.leadConversionLog.create({
        data: {
          tenantId: context.tenantId,
          leadId: input.leadId,
          opportunityId: input.opportunityId,
          customerId: input.customerId,
          convertedAt: new Date(),
          createdBy: context.userId,
        },
      }),
    );
  }

  async updateLeadStatus(context: TenantContext, leadId: string, status: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.lead.update({
        where: { id: leadId },
        data: {
          status,
          updatedAt: new Date(),
          updatedBy: context.userId,
          version: { increment: 1 },
        },
      }),
    );
  }
}
