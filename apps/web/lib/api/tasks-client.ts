import { authenticatedFetch, parseApiResponse } from './authenticated-fetch';

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'done';

export interface TaskAssignee {
  userId: string;
  isPrimary: boolean;
}

export interface TaskListItem {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueAt: string | null;
  relatedType: string | null;
  relatedId: string | null;
  assignedUserId: string | null;
  assignees: TaskAssignee[];
  createdAt: string;
  updatedAt: string | null;
  version: number;
}

export interface TaskListResult {
  items: TaskListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateTaskAssigneeInput {
  userId: string;
  isPrimary?: boolean;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueAt?: string;
  relatedType?: string;
  relatedId?: string;
  assignedUserId?: string | null;
  assignees?: CreateTaskAssigneeInput[];
}

export interface ActivitySummary {
  id: string;
  activityType: string;
  title: string;
  body: string | null;
  relatedType: string | null;
  relatedId: string | null;
  taskId: string | null;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  version: number;
}

export interface CreateActivityInput {
  activityType: string;
  title: string;
  body?: string;
  relatedType?: string;
  relatedId?: string;
  taskId?: string;
  dueAt?: string;
  completedAt?: string;
}

export async function listTasks(page = 1, pageSize = 20): Promise<TaskListResult> {
  const response = await authenticatedFetch(`/api/v1/tasks?page=${page}&pageSize=${pageSize}`);
  return parseApiResponse<TaskListResult>(response);
}

export async function createTask(input: CreateTaskInput): Promise<TaskListItem> {
  const response = await authenticatedFetch('/api/v1/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseApiResponse<TaskListItem>(response);
}

export async function createActivity(input: CreateActivityInput): Promise<ActivitySummary> {
  const response = await authenticatedFetch('/api/v1/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseApiResponse<ActivitySummary>(response);
}
