import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { ListOpportunitiesQueryDto } from './dto/list-opportunities-query.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { UpdateOpportunityStageDto } from './dto/update-opportunity-stage.dto';
import { OpportunityService } from './opportunity.service';

@Controller('opportunities')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(TenantContextInterceptor)
@RequireTenantContext()
export class OpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.OPPORTUNITY_READ)
  async list(
    @TenantContextParam() context: RequestTenantContext,
    @Query() query: ListOpportunitiesQueryDto,
  ) {
    const result = await this.opportunityService.listOpportunities(context, query);
    return okEnvelope(result);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.OPPORTUNITY_READ)
  async getById(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const opportunity = await this.opportunityService.getOpportunityById(context, id);
    return okEnvelope(opportunity);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.OPPORTUNITY_CREATE)
  async create(
    @TenantContextParam() context: RequestTenantContext,
    @Body() dto: CreateOpportunityDto,
  ) {
    const opportunity = await this.opportunityService.createOpportunity(context, dto);
    return okEnvelope(opportunity);
  }

  @Patch(':id/stage')
  @RequirePermissions(PERMISSIONS.OPPORTUNITY_UPDATE_STAGE)
  async updateStage(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOpportunityStageDto,
  ) {
    const opportunity = await this.opportunityService.updateOpportunityStage(context, id, dto);
    return okEnvelope(opportunity);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.OPPORTUNITY_UPDATE)
  async update(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOpportunityDto,
  ) {
    const opportunity = await this.opportunityService.updateOpportunity(context, id, dto);
    return okEnvelope(opportunity);
  }
}
