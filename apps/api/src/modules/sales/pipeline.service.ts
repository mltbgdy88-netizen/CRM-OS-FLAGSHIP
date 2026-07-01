import { Injectable } from '@nestjs/common';
import type { RequestTenantContext } from '../../common/tenant/tenant-context.types';
import { mapPipelineSummary } from './pipeline.mapper';
import { PipelineRepository } from './pipeline.repository';
import type { ListPipelinesQueryDto } from './dto/list-pipelines-query.dto';

@Injectable()
export class PipelineService {
  constructor(private readonly pipelineRepository: PipelineRepository) {}

  async listPipelines(context: RequestTenantContext, query: ListPipelinesQueryDto) {
    const skip = (query.page - 1) * query.pageSize;
    const [total, pipelines] = await Promise.all([
      this.pipelineRepository.countPipelines(context),
      this.pipelineRepository.listPipelines(context, {
        skip,
        take: query.pageSize,
      }),
    ]);

    return {
      items: pipelines.map(mapPipelineSummary),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }
}
