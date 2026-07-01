import { authenticatedFetch, parseApiResponse } from './authenticated-fetch';

export interface NotificationItem {
  id: string;
  title: string;
  body: string | null;
  category: string;
  severity: string;
  sourceType: string | null;
  sourceId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResult {
  items: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listNotifications(
  page = 1,
  pageSize = 20,
): Promise<NotificationListResult> {
  const response = await authenticatedFetch(
    `/api/v1/notifications?page=${page}&pageSize=${pageSize}`,
  );
  return parseApiResponse<NotificationListResult>(response);
}

export async function markNotificationRead(id: string): Promise<NotificationItem> {
  const response = await authenticatedFetch(`/api/v1/notifications/${id}/read`, {
    method: 'PATCH',
  });
  return parseApiResponse<NotificationItem>(response);
}
