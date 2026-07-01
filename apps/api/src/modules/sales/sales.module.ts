import { Module } from '@nestjs/common';
import { JwtAuthGuard, PermissionGuard } from '../../common/auth/auth.guards';
import { IamModule } from '../iam/iam.module';
import { OpportunityController } from './opportunity.controller';
import { OpportunityRepository } from './opportunity.repository';
import { OpportunityService } from './opportunity.service';
import { PipelineController } from './pipeline.controller';
import { PipelineRepository } from './pipeline.repository';
import { PipelineService } from './pipeline.service';

@Module({
  imports: [IamModule],
  controllers: [PipelineController, OpportunityController],
  providers: [
    PipelineRepository,
    PipelineService,
    OpportunityRepository,
    OpportunityService,
    JwtAuthGuard,
    PermissionGuard,
  ],
  exports: [OpportunityService, PipelineRepository, OpportunityRepository],
})
export class SalesModule {}
