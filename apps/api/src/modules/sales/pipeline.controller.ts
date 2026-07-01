import { Controller, Get, Post, Body, Query, UseGuards, UseInterceptors } from '@nestjs/common';
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
import { ListPipelinesQueryDto } from './dto/list-pipelines-query.dto';
import { PipelineService } from './pipeline.service';

@Controller('pipelines')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(TenantContextInterceptor)
@RequireTenantContext()
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.PIPELINE_MANAGE)
  async list(
    @TenantContextParam() context: RequestTenantContext,
    @Query() query: ListPipelinesQueryDto,
  ) {
    const result = await this.pipelineService.listPipelines(context, query);
    return okEnvelope(result);
  }
}
