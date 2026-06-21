import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
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
import { CreateRoleDto } from '../dto/create-role.dto';
import { RolesService } from '../services/users-roles.service';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(TenantContextInterceptor)
@RequireTenantContext()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.ROLE_MANAGE)
  async create(
    @TenantContextParam() context: RequestTenantContext,
    @Body() dto: CreateRoleDto,
  ) {
    const role = await this.rolesService.createRole(context, dto);
    return okEnvelope(role);
  }
}
