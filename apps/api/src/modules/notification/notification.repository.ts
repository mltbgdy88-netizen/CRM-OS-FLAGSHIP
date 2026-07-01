import { Injectable } from '@nestjs/common';
import type { TenantContext } from '@crm-os/database';
import { withTenantContext } from '@crm-os/database';
import { PrismaService } from '../../database/prisma.service';

const notificationInclude = {
  recipients: {
    where: { deletedAt: null },
  },
} as const;

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countNotificationsForUser(context: TenantContext, userId: string): Promise<number> {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.notification.count({
        where: {
          deletedAt: null,
          recipients: {
            some: {
              userId,
              deletedAt: null,
            },
          },
        },
      }),
    );
  }

  async listNotificationsForUser(
    context: TenantContext,
    userId: string,
    input: { skip: number; take: number },
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.notification.findMany({
        where: {
          deletedAt: null,
          recipients: {
            some: {
              userId,
              deletedAt: null,
            },
          },
        },
        include: notificationInclude,
        orderBy: { createdAt: 'desc' },
        skip: input.skip,
        take: input.take,
      }),
    );
  }

  async findRecipientByNotificationId(
    context: TenantContext,
    notificationId: string,
    userId: string,
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.notificationRecipient.findFirst({
        where: {
          notificationId,
          userId,
          deletedAt: null,
          notification: {
            deletedAt: null,
          },
        },
        include: {
          notification: {
            include: notificationInclude,
          },
        },
      }),
    );
  }

  async markRecipientRead(
    context: TenantContext,
    recipientId: string,
    readAt: Date,
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.notificationRecipient.update({
        where: { id: recipientId },
        data: {
          isRead: true,
          readAt,
          updatedBy: context.userId,
          updatedAt: readAt,
        },
        include: {
          notification: {
            include: notificationInclude,
          },
        },
      }),
    );
  }
}
