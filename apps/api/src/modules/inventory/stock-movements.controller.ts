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
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { InventoryService } from './inventory.service';

@Controller('stock-movements')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(TenantContextInterceptor)
@RequireTenantContext()
export class StockMovementsController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.INVENTORY_ADJUST)
  async create(
    @TenantContextParam() context: RequestTenantContext,
    @Body() dto: CreateStockMovementDto,
  ) {
    const movement = await this.inventoryService.createStockMovement(context, dto);
    return okEnvelope(movement);
  }
}
