import { Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { PERMISSIONS } from '@crm-os/permissions';
import { JwtAuthGuard, PermissionGuard } from '../../common/auth/auth.guards';
import { RequirePermissions } from '../../common/auth/require-permissions.decorator';
import { okEnvelope } from '../../common/http/api-envelope';
import {
  RequireTenantContext,
  TenantContextInterceptor,
} from '../../common/tenant/tenant-context.interceptor';
import { TenantContextParam } from '../../common/tenant/tenant-context.decorator';
import type { RequestTenantContext } from '../../common/tenant/tenant-context.types';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(TenantContextInterceptor)
@RequireTenantContext()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.NOTIFICATION_READ)
  async list(
    @TenantContextParam() context: RequestTenantContext,
    @Query() query: ListNotificationsQueryDto,
  ) {
    const result = await this.notificationService.listNotifications(context, query);
    return okEnvelope(result);
  }

  @Patch(':id/read')
  @RequirePermissions(PERMISSIONS.NOTIFICATION_READ)
  async markRead(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const notification = await this.notificationService.markNotificationRead(context, id);
    return okEnvelope(notification);
  }
}
