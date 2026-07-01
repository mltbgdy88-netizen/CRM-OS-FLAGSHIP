import type { Notification, NotificationRecipient } from '@prisma/client';
import type { NotificationResponseDto } from './dto/notification-response.dto';

type NotificationWithRecipient = Notification & {
  recipients: NotificationRecipient[];
};

export function mapNotificationSummary(
  notification: NotificationWithRecipient,
  userId: string,
): NotificationResponseDto {
  const recipient =
    notification.recipients.find((row) => row.userId === userId) ?? notification.recipients[0];

  return {
    id: notification.id,
    title: notification.title,
    body: notification.body,
    category: notification.category,
    severity: notification.severity,
    sourceType: notification.sourceType,
    sourceId: notification.sourceId,
    isRead: recipient?.isRead ?? false,
    readAt: recipient?.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  };
}
