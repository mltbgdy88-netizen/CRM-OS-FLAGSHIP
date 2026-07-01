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
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { OpportunityService } from './opportunity.service';

@Controller('opportunities')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(TenantContextInterceptor)
@RequireTenantContext()
export class OpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.OPPORTUNITY_CREATE)
  async create(
    @TenantContextParam() context: RequestTenantContext,
    @Body() dto: CreateOpportunityDto,
  ) {
    const opportunity = await this.opportunityService.createOpportunity(context, dto);
    return okEnvelope(opportunity);
  }
}
