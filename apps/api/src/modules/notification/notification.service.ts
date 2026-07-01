import { Injectable, NotFoundException } from '@nestjs/common';
import type { RequestTenantContext } from '../../common/tenant/tenant-context.types';
import { IamRepository } from '../iam/repositories/iam.repository';
import type { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { mapNotificationSummary } from './notification.mapper';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly iamRepository: IamRepository,
  ) {}

  async listNotifications(context: RequestTenantContext, query: ListNotificationsQueryDto) {
    const skip = (query.page - 1) * query.pageSize;
    const [total, notifications] = await Promise.all([
      this.notificationRepository.countNotificationsForUser(context, context.userId),
      this.notificationRepository.listNotificationsForUser(context, context.userId, {
        skip,
        take: query.pageSize,
      }),
    ]);

    return {
      items: notifications.map((notification) =>
        mapNotificationSummary(notification, context.userId),
      ),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async markNotificationRead(context: RequestTenantContext, notificationId: string) {
    const recipient = await this.notificationRepository.findRecipientByNotificationId(
      context,
      notificationId,
      context.userId,
    );

    if (!recipient) {
      throw new NotFoundException('Notification not found');
    }

    const readAt = new Date();
    const updated =
      recipient.isRead && recipient.readAt
        ? recipient
        : await this.notificationRepository.markRecipientRead(context, recipient.id, readAt);

    await this.iamRepository.writeAuditLog(context, {
      action: 'notification.read',
      entityType: 'notification',
      entityId: notificationId,
      payload: {
        recipientId: updated.id,
        readAt: (updated.readAt ?? readAt).toISOString(),
      },
    });

    return mapNotificationSummary(updated.notification, context.userId);
  }
}
