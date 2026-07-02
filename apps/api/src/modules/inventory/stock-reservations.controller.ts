import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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
import { ListStockReservationsQueryDto } from './dto/reserve-stock.dto';
import { InventoryService } from './inventory.service';

@Controller('stock-reservations')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(TenantContextInterceptor)
@RequireTenantContext()
export class StockReservationsController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.INVENTORY_READ)
  async list(
    @TenantContextParam() context: RequestTenantContext,
    @Query() query: ListStockReservationsQueryDto,
  ) {
    const result = await this.inventoryService.listStockReservations(context, query);
    return okEnvelope(result);
  }

  @Post(':id/release')
  @RequirePermissions(PERMISSIONS.INVENTORY_RELEASE)
  async release(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const reservation = await this.inventoryService.releaseStockReservation(context, id);
    return okEnvelope(reservation);
  }
}
