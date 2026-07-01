import type { Activity, Task, TaskAssignee } from '@prisma/client';
import type { ActivityResponseDto, TaskResponseDto } from './dto/task-response.dto';

type TaskRecord = Task & {
  assignees: TaskAssignee[];
};

export function mapTaskSummary(task: TaskRecord): TaskResponseDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueAt: task.dueAt?.toISOString() ?? null,
    relatedType: task.relatedType,
    relatedId: task.relatedId,
    assignedUserId: task.assignedUserId,
    assignees: task.assignees.map((assignee) => ({
      userId: assignee.userId,
      isPrimary: assignee.isPrimary,
    })),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt?.toISOString() ?? null,
    version: task.version,
  };
}

export function mapActivitySummary(activity: Activity): ActivityResponseDto {
  return {
    id: activity.id,
    activityType: activity.activityType,
    title: activity.title,
    body: activity.body,
    relatedType: activity.relatedType,
    relatedId: activity.relatedId,
    taskId: activity.taskId,
    dueAt: activity.dueAt?.toISOString() ?? null,
    completedAt: activity.completedAt?.toISOString() ?? null,
    createdAt: activity.createdAt.toISOString(),
    updatedAt: activity.updatedAt?.toISOString() ?? null,
    version: activity.version,
  };
}
