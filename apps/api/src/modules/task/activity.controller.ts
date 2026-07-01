import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
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
import { CreateActivityDto } from './dto/create-activity.dto';
import { TaskService } from './task.service';

@Controller('activities')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(TenantContextInterceptor)
@RequireTenantContext()
export class ActivityController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.ACTIVITY_CREATE)
  async create(
    @TenantContextParam() context: RequestTenantContext,
    @Body() dto: CreateActivityDto,
  ) {
    const activity = await this.taskService.createActivity(context, dto);
    return okEnvelope(activity);
  }
}
