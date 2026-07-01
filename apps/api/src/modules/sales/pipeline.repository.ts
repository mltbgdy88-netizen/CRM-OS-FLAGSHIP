import { Injectable } from '@nestjs/common';
import type { TenantContext } from '@crm-os/database';
import { withTenantContext } from '@crm-os/database';
import { PrismaService } from '../../database/prisma.service';

const pipelineSummaryInclude = {
  stages: {
    where: { deletedAt: null },
    orderBy: { sortOrder: 'asc' as const },
  },
  opportunities: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' as const },
  },
} as const;

@Injectable()
export class PipelineRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countPipelines(context: TenantContext): Promise<number> {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.pipeline.count({ where: { deletedAt: null } }),
    );
  }

  async listPipelines(context: TenantContext, input: { skip: number; take: number }) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.pipeline.findMany({
        where: { deletedAt: null },
        include: pipelineSummaryInclude,
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
        skip: input.skip,
        take: input.take,
      }),
    );
  }

  async findPipelineById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.pipeline.findFirst({
        where: { id, deletedAt: null },
        include: pipelineSummaryInclude,
      }),
    );
  }

  async findDefaultPipeline(context: TenantContext) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.pipeline.findFirst({
        where: { deletedAt: null, isDefault: true },
        include: pipelineSummaryInclude,
      }),
    );
  }

  async findStageById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.pipelineStage.findFirst({
        where: { id, deletedAt: null },
      }),
    );
  }

  async findStageByPipelineAndCode(context: TenantContext, pipelineId: string, code: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.pipelineStage.findFirst({
        where: { pipelineId, code, deletedAt: null },
      }),
    );
  }
}
