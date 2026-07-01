export interface TaskAssigneeResponseDto {
  userId: string;
  isPrimary: boolean;
}

export interface TaskResponseDto {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueAt: string | null;
  relatedType: string | null;
  relatedId: string | null;
  assignedUserId: string | null;
  assignees: TaskAssigneeResponseDto[];
  createdAt: string;
  updatedAt: string | null;
  version: number;
}

export interface ActivityResponseDto {
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
