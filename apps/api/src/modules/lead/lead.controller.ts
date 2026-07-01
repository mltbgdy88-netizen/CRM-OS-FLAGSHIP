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
import { ConvertLeadDto } from '../sales/dto/convert-lead.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ListLeadsQueryDto } from './dto/list-leads-query.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadService } from './lead.service';

@Controller('leads')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(TenantContextInterceptor)
@RequireTenantContext()
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.LEAD_READ)
  async list(
    @TenantContextParam() context: RequestTenantContext,
    @Query() query: ListLeadsQueryDto,
  ) {
    const result = await this.leadService.listLeads(context, query);
    return okEnvelope(result);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.LEAD_CREATE)
  async create(
    @TenantContextParam() context: RequestTenantContext,
    @Body() dto: CreateLeadDto,
  ) {
    const lead = await this.leadService.createLead(context, dto);
    return okEnvelope(lead);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.LEAD_UPDATE)
  async update(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    const lead = await this.leadService.updateLead(context, id, dto);
    return okEnvelope(lead);
  }

  @Post(':id/convert')
  @RequirePermissions(PERMISSIONS.LEAD_CONVERT)
  async convert(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConvertLeadDto,
  ) {
    const opportunity = await this.leadService.convertLead(context, id, dto);
    return okEnvelope(opportunity);
  }
}
