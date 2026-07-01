import { Injectable, NotFoundException } from '@nestjs/common';
import {
  createActivityLoggedEvent,
  createTaskCompletedEvent,
  createTaskCreatedEvent,
} from '@crm-os/events';
import type { RequestTenantContext } from '../../common/tenant/tenant-context.types';
import { IamRepository } from '../iam/repositories/iam.repository';
import { DomainEventPublisher } from '../iam/services/audit.service';
import type { CreateActivityDto } from './dto/create-activity.dto';
import type { CreateTaskDto } from './dto/create-task.dto';
import type { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { mapActivitySummary, mapTaskSummary } from './task.mapper';
import { TaskRepository } from './task.repository';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly iamRepository: IamRepository,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async listTasks(context: RequestTenantContext, query: ListTasksQueryDto) {
    const skip = (query.page - 1) * query.pageSize;
    const [total, tasks] = await Promise.all([
      this.taskRepository.countTasks(context),
      this.taskRepository.listTasks(context, {
        skip,
        take: query.pageSize,
      }),
    ]);

    return {
      items: tasks.map(mapTaskSummary),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async createTask(context: RequestTenantContext, dto: CreateTaskDto) {
    if (dto.assignedUserId) {
      await this.assertAssignableUser(context, dto.assignedUserId);
    }

    if (dto.assignees?.length) {
      for (const assignee of dto.assignees) {
        await this.assertAssignableUser(context, assignee.userId);
      }
    }

    const task = await this.taskRepository.createTask(context, {
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      status: dto.status,
      dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
      relatedType: dto.relatedType ?? null,
      relatedId: dto.relatedId ?? null,
      assignedUserId: dto.assignedUserId ?? null,
      assignees: dto.assignees,
    });

    await this.iamRepository.writeAuditLog(context, {
      action: 'task.created',
      entityType: 'task',
      entityId: task.id,
      payload: {
        title: task.title,
        status: task.status,
        priority: task.priority,
      },
    });

    this.eventPublisher.publish(
      createTaskCreatedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        taskId: task.id,
        title: task.title,
      }),
    );

    if (task.status === 'done') {
      await this.iamRepository.writeAuditLog(context, {
        action: 'task.completed',
        entityType: 'task',
        entityId: task.id,
        payload: { status: task.status },
      });
      this.eventPublisher.publish(
        createTaskCompletedEvent({
          tenantId: context.tenantId,
          actorId: context.userId,
          taskId: task.id,
        }),
      );
    }

    return mapTaskSummary(task);
  }

  async createActivity(context: RequestTenantContext, dto: CreateActivityDto) {
    if (dto.taskId) {
      const task = await this.taskRepository.findTaskById(context, dto.taskId);
      if (!task) {
        throw new NotFoundException('Task not found');
      }
    }

    const activity = await this.taskRepository.createActivity(context, {
      activityType: dto.activityType,
      title: dto.title,
      body: dto.body ?? null,
      relatedType: dto.relatedType ?? null,
      relatedId: dto.relatedId ?? null,
      taskId: dto.taskId ?? null,
      dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
      completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
    });

    const subjectType = activity.relatedType ?? (activity.taskId ? 'task' : 'activity');
    const subjectId = activity.relatedId ?? activity.taskId ?? activity.id;

    await this.iamRepository.writeAuditLog(context, {
      action: 'activity.logged',
      entityType: 'activity',
      entityId: activity.id,
      payload: {
        activityType: activity.activityType,
        title: activity.title,
        taskId: activity.taskId,
        relatedType: activity.relatedType,
        relatedId: activity.relatedId,
      },
    });

    this.eventPublisher.publish(
      createActivityLoggedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        activityId: activity.id,
        activityType: activity.activityType,
        subjectType,
        subjectId,
      }),
    );

    return mapActivitySummary(activity);
  }

  private async assertAssignableUser(context: RequestTenantContext, userId: string) {
    const membership = await this.taskRepository.findTenantMemberByUserId(context, userId);
    if (!membership) {
      throw new NotFoundException('Assignable user not found in tenant');
    }
  }
}
