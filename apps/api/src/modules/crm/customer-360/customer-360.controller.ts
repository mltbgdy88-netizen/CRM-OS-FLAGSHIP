import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards, UseInterceptors } from '@nestjs/common';
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
import { Customer360Service } from './customer-360.service';
import { ListTimelineQueryDto } from './dto/list-timeline-query.dto';

@Controller('customers')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(TenantContextInterceptor)
@RequireTenantContext()
export class Customer360Controller {
  constructor(private readonly customer360Service: Customer360Service) {}

  @Get(':id/360')
  @RequirePermissions(PERMISSIONS.CUSTOMER_READ)
  async get360(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const view = await this.customer360Service.getCustomer360(context, id);
    return okEnvelope(view);
  }

  @Get(':id/timeline')
  @RequirePermissions(PERMISSIONS.CUSTOMER_TIMELINE_READ)
  async getTimeline(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ListTimelineQueryDto,
  ) {
    const result = await this.customer360Service.listCustomerTimeline(context, id, query);
    return okEnvelope(result);
  }
}
