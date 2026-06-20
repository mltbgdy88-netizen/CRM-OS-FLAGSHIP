import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { PERMISSIONS } from '@crm-os/permissions';
import { JwtAuthGuard, PermissionGuard } from '../../../common/auth/auth.guards';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { okEnvelope } from '../../../common/http/api-envelope';
import {
  RequireTenantContext,
  TenantContextInterceptor,
} from '../../../common/tenant/tenant-context.interceptor';
import { TenantContextParam } from '../../../common/tenant/tenant-context.decorator';
import type { RequestTenantContext } from '../../../common/tenant/tenant-context.types';
import { UsersService } from '../services/users-roles.service';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(TenantContextInterceptor)
@RequireTenantContext()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.USER_MANAGE)
  async list(@TenantContextParam() context: RequestTenantContext) {
    const users = await this.usersService.listUsers(context);
    return okEnvelope({ items: users, total: users.length });
  }
}
