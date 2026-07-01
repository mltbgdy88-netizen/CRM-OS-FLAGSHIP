import { Injectable } from '@nestjs/common';
import type { TenantContext } from '@crm-os/database';
import { withTenantContext } from '@crm-os/database';
import { PrismaService } from '../../database/prisma.service';

const leadSummaryInclude = {
  source: true,
  tags: { where: { deletedAt: null } },
} as const;

@Injectable()
export class LeadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countLeads(context: TenantContext): Promise<number> {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.lead.count({ where: { deletedAt: null } }),
    );
  }

  async listLeads(context: TenantContext, input: { skip: number; take: number }) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.lead.findMany({
        where: { deletedAt: null },
        include: leadSummaryInclude,
        orderBy: { createdAt: 'desc' },
        skip: input.skip,
        take: input.take,
      }),
    );
  }

  async findLeadById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.lead.findFirst({
        where: { id, deletedAt: null },
        include: leadSummaryInclude,
      }),
    );
  }

  async findLeadSourceById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.leadSource.findFirst({
        where: { id, deletedAt: null },
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

  async createLead(
    context: TenantContext,
    input: {
      fullName: string;
      companyName: string;
      email?: string;
      phone?: string;
      sourceId: string;
      status?: string;
      score?: number;
      assignedUserId?: string | null;
      customerId?: string | null;
    },
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.lead.create({
        data: {
          tenantId: context.tenantId,
          fullName: input.fullName,
          companyName: input.companyName,
          email: input.email,
          phone: input.phone,
          sourceId: input.sourceId,
          status: input.status ?? 'new',
          score: input.score ?? 0,
          assignedUserId: input.assignedUserId ?? null,
          customerId: input.customerId ?? null,
          createdBy: context.userId,
        },
        include: leadSummaryInclude,
      }),
    );
  }

  async updateLead(
    context: TenantContext,
    id: string,
    input: {
      fullName?: string;
      companyName?: string;
      email?: string;
      phone?: string;
      sourceId?: string;
      status?: string;
      score?: number;
      assignedUserId?: string | null;
      customerId?: string | null;
    },
  ) {
    const data: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy: context.userId,
      version: { increment: 1 },
    };

    if (input.fullName !== undefined) data.fullName = input.fullName;
    if (input.companyName !== undefined) data.companyName = input.companyName;
    if (input.email !== undefined) data.email = input.email;
    if (input.phone !== undefined) data.phone = input.phone;
    if (input.sourceId !== undefined) data.sourceId = input.sourceId;
    if (input.status !== undefined) data.status = input.status;
    if (input.score !== undefined) data.score = input.score;
    if (Object.prototype.hasOwnProperty.call(input, 'assignedUserId')) {
      data.assignedUserId = input.assignedUserId ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(input, 'customerId')) {
      data.customerId = input.customerId ?? null;
    }

    return withTenantContext(this.prisma, context, async (tx) =>
      tx.lead.update({
        where: { id },
        data,
        include: leadSummaryInclude,
      }),
    );
  }

  async appendLeadScore(context: TenantContext, leadId: string, scoreValue: number) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.leadScore.create({
        data: {
          tenantId: context.tenantId,
          leadId,
          scoreValue,
          createdBy: context.userId,
        },
      }),
    );
  }

  async appendLeadAssignment(
    context: TenantContext,
    leadId: string,
    assignedUserId: string | null,
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.leadAssignment.create({
        data: {
          tenantId: context.tenantId,
          leadId,
          assignedUserId,
          createdBy: context.userId,
        },
      }),
    );
  }

  async appendLeadActivity(
    context: TenantContext,
    leadId: string,
    input: { activityType: string; title: string; body?: string | null },
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.leadActivity.create({
        data: {
          tenantId: context.tenantId,
          leadId,
          activityType: input.activityType,
          title: input.title,
          body: input.body,
          createdBy: context.userId,
        },
      }),
    );
  }
}
