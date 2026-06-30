import { Injectable } from '@nestjs/common';
import type { TenantContext } from '@crm-os/database';
import { withTenantContext } from '@crm-os/database';
import { PrismaService } from '../../../database/prisma.service';

const TIMELINE_PREVIEW_LIMIT = 5;

@Injectable()
export class Customer360Repository {
  constructor(private readonly prisma: PrismaService) {}

  async findCustomerById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.customer.findFirst({
        where: { id, deletedAt: null },
      }),
    );
  }

  async findScoresForCustomer(context: TenantContext, customerId: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.customerScore.findMany({
        where: { customerId, deletedAt: null },
        orderBy: { recordedAt: 'desc' },
      }),
    );
  }

  async findRiskScoresForCustomer(context: TenantContext, customerId: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.customerRiskScore.findMany({
        where: { customerId, deletedAt: null },
        orderBy: { assessedAt: 'desc' },
      }),
    );
  }

  async findLifetimeValuesForCustomer(context: TenantContext, customerId: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.customerLifetimeValue.findMany({
        where: { customerId, deletedAt: null },
        orderBy: { calculatedAt: 'desc' },
      }),
    );
  }

  async findNotesForCustomer(context: TenantContext, customerId: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.customerNote.findMany({
        where: { customerId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async findFilesForCustomer(context: TenantContext, customerId: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.customerFile.findMany({
        where: { customerId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async findTimelinePreview(context: TenantContext, customerId: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.customerTimelineEvent.findMany({
        where: { customerId, deletedAt: null },
        orderBy: { occurredAt: 'desc' },
        take: TIMELINE_PREVIEW_LIMIT,
      }),
    );
  }

  async countTimelineEvents(context: TenantContext, customerId: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.customerTimelineEvent.count({
        where: { customerId, deletedAt: null },
      }),
    );
  }

  async listTimelineEvents(
    context: TenantContext,
    customerId: string,
    input: { skip: number; take: number },
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.customerTimelineEvent.findMany({
        where: { customerId, deletedAt: null },
        orderBy: { occurredAt: 'desc' },
        skip: input.skip,
        take: input.take,
      }),
    );
  }
}
