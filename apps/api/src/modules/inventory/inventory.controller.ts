import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
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
import { InventoryService } from './inventory.service';

@Controller('inventory')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(TenantContextInterceptor)
@RequireTenantContext()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.INVENTORY_READ)
  async getOverview(@TenantContextParam() context: RequestTenantContext) {
    const overview = await this.inventoryService.getOverview(context);
    return okEnvelope(overview);
  }
}
