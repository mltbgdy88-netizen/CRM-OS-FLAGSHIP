export interface NotificationResponseDto {
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
