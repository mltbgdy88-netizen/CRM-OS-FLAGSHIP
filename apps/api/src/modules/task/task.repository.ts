import { Injectable } from '@nestjs/common';
import type { TenantContext } from '@crm-os/database';
import { withTenantContext } from '@crm-os/database';
import { PrismaService } from '../../database/prisma.service';

const taskSummaryInclude = {
  assignees: { where: { deletedAt: null } },
} as const;

@Injectable()
export class TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countTasks(context: TenantContext): Promise<number> {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.task.count({ where: { deletedAt: null } }),
    );
  }

  async listTasks(context: TenantContext, input: { skip: number; take: number }) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.task.findMany({
        where: { deletedAt: null },
        include: taskSummaryInclude,
        orderBy: { createdAt: 'desc' },
        skip: input.skip,
        take: input.take,
      }),
    );
  }

  async findTaskById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.task.findFirst({
        where: { id, deletedAt: null },
        include: taskSummaryInclude,
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

  async createTask(
    context: TenantContext,
    input: {
      title: string;
      description?: string;
      priority?: string;
      status?: string;
      dueAt?: Date | null;
      relatedType?: string | null;
      relatedId?: string | null;
      assignedUserId?: string | null;
      assignees?: { userId: string; isPrimary?: boolean }[];
    },
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.task.create({
        data: {
          tenantId: context.tenantId,
          title: input.title,
          description: input.description,
          priority: input.priority ?? 'medium',
          status: input.status ?? 'pending',
          dueAt: input.dueAt ?? null,
          relatedType: input.relatedType ?? null,
          relatedId: input.relatedId ?? null,
          assignedUserId: input.assignedUserId ?? null,
          createdBy: context.userId,
          assignees: input.assignees?.length
            ? {
                create: input.assignees.map((assignee) => ({
                  tenantId: context.tenantId,
                  userId: assignee.userId,
                  isPrimary: assignee.isPrimary ?? false,
                  createdBy: context.userId,
                })),
              }
            : undefined,
        },
        include: taskSummaryInclude,
      }),
    );
  }

  async createActivity(
    context: TenantContext,
    input: {
      activityType: string;
      title: string;
      body?: string | null;
      relatedType?: string | null;
      relatedId?: string | null;
      taskId?: string | null;
      dueAt?: Date | null;
      completedAt?: Date | null;
    },
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.activity.create({
        data: {
          tenantId: context.tenantId,
          activityType: input.activityType,
          title: input.title,
          body: input.body ?? null,
          relatedType: input.relatedType ?? null,
          relatedId: input.relatedId ?? null,
          taskId: input.taskId ?? null,
          dueAt: input.dueAt ?? null,
          completedAt: input.completedAt ?? null,
          createdBy: context.userId,
        },
      }),
    );
  }
}
