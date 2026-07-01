import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  createLeadConvertedEvent,
  createOpportunityCreatedEvent,
  createOpportunityStageChangedEvent,
} from '@crm-os/events';
import type { RequestTenantContext } from '../../common/tenant/tenant-context.types';
import { IamRepository } from '../iam/repositories/iam.repository';
import { DomainEventPublisher } from '../iam/services/audit.service';
import type { ConvertLeadDto } from './dto/convert-lead.dto';
import type { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { mapOpportunitySummary } from './opportunity.mapper';
import { OpportunityRepository } from './opportunity.repository';
import { PipelineRepository } from './pipeline.repository';

const INITIAL_STAGE_CODE = 'new';

@Injectable()
export class OpportunityService {
  constructor(
    private readonly opportunityRepository: OpportunityRepository,
    private readonly pipelineRepository: PipelineRepository,
    private readonly iamRepository: IamRepository,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async createOpportunity(context: RequestTenantContext, dto: CreateOpportunityDto) {
    const pipeline = await this.pipelineRepository.findPipelineById(context, dto.pipelineId);
    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    let stageId = dto.stageId;
    if (stageId) {
      const stage = await this.pipelineRepository.findStageById(context, stageId);
      if (!stage || stage.pipelineId !== pipeline.id) {
        throw new NotFoundException('Pipeline stage not found');
      }
    } else {
      const newStage = await this.pipelineRepository.findStageByPipelineAndCode(
        context,
        pipeline.id,
        INITIAL_STAGE_CODE,
      );
      if (!newStage) {
        throw new NotFoundException('Initial pipeline stage not found');
      }
      stageId = newStage.id;
    }

    if (dto.customerId) {
      await this.assertCustomerExists(context, dto.customerId);
    }

    if (dto.leadId) {
      await this.assertLeadExists(context, dto.leadId);
    }

    if (dto.assignedUserId) {
      await this.assertAssignableUser(context, dto.assignedUserId);
    }

    const opportunity = await this.opportunityRepository.createOpportunity(context, {
      pipelineId: pipeline.id,
      stageId,
      leadId: dto.leadId,
      customerId: dto.customerId,
      title: dto.title,
      companyName: dto.companyName,
      amount: dto.amount,
      probability: dto.probability,
      assignedUserId: dto.assignedUserId,
    });

    await this.opportunityRepository.appendStageHistory(context, {
      opportunityId: opportunity.id,
      fromStageId: null,
      toStageId: stageId,
    });

    await this.iamRepository.writeAuditLog(context, {
      action: 'opportunity.created',
      entityType: 'opportunity',
      entityId: opportunity.id,
      payload: {
        pipelineId: opportunity.pipelineId,
        stageId: opportunity.stageId,
        title: opportunity.title,
        companyName: opportunity.companyName,
      },
    });

    this.eventPublisher.publish(
      createOpportunityCreatedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        opportunityId: opportunity.id,
        pipelineId: opportunity.pipelineId,
        stageId: opportunity.stageId,
        title: opportunity.title,
      }),
    );

    this.eventPublisher.publish(
      createOpportunityStageChangedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        opportunityId: opportunity.id,
        fromStageId: '',
        toStageId: stageId,
      }),
    );

    return mapOpportunitySummary(opportunity);
  }

  async convertLead(
    context: RequestTenantContext,
    leadId: string,
    dto: ConvertLeadDto,
  ) {
    const lead = await this.opportunityRepository.findLeadById(context, leadId);
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const customerId = dto.customerId ?? lead.customerId;
    if (!customerId) {
      throw new BadRequestException('customerId is required to convert a lead');
    }

    await this.assertCustomerExists(context, customerId);

    let pipelineId = dto.pipelineId;
    if (pipelineId) {
      const pipeline = await this.pipelineRepository.findPipelineById(context, pipelineId);
      if (!pipeline) {
        throw new NotFoundException('Pipeline not found');
      }
    } else {
      const defaultPipeline = await this.pipelineRepository.findDefaultPipeline(context);
      if (!defaultPipeline) {
        throw new NotFoundException('Default pipeline not found');
      }
      pipelineId = defaultPipeline.id;
    }

    const newStage = await this.pipelineRepository.findStageByPipelineAndCode(
      context,
      pipelineId,
      INITIAL_STAGE_CODE,
    );
    if (!newStage) {
      throw new NotFoundException('Initial pipeline stage not found');
    }

    const title = dto.title ?? `${lead.fullName} Opportunity`;

    const opportunity = await this.opportunityRepository.createOpportunity(context, {
      pipelineId,
      stageId: newStage.id,
      leadId: lead.id,
      customerId,
      title,
      companyName: lead.companyName,
      assignedUserId: lead.assignedUserId,
    });

    await this.opportunityRepository.appendStageHistory(context, {
      opportunityId: opportunity.id,
      fromStageId: null,
      toStageId: newStage.id,
    });

    await this.opportunityRepository.appendLeadConversionLog(context, {
      leadId: lead.id,
      opportunityId: opportunity.id,
      customerId,
    });

    await this.opportunityRepository.updateLeadStatus(context, lead.id, 'qualified');

    await this.iamRepository.writeAuditLog(context, {
      action: 'lead.converted',
      entityType: 'lead',
      entityId: lead.id,
      payload: {
        opportunityId: opportunity.id,
        customerId,
        pipelineId,
        stageId: newStage.id,
      },
    });

    await this.iamRepository.writeAuditLog(context, {
      action: 'opportunity.created',
      entityType: 'opportunity',
      entityId: opportunity.id,
      payload: {
        pipelineId: opportunity.pipelineId,
        stageId: opportunity.stageId,
        title: opportunity.title,
        leadId: lead.id,
        customerId,
      },
    });

    this.eventPublisher.publish(
      createLeadConvertedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        leadId: lead.id,
        opportunityId: opportunity.id,
        customerId,
      }),
    );

    this.eventPublisher.publish(
      createOpportunityCreatedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        opportunityId: opportunity.id,
        pipelineId: opportunity.pipelineId,
        stageId: opportunity.stageId,
        title: opportunity.title,
      }),
    );

    this.eventPublisher.publish(
      createOpportunityStageChangedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        opportunityId: opportunity.id,
        fromStageId: '',
        toStageId: newStage.id,
      }),
    );

    return mapOpportunitySummary(opportunity);
  }

  private async assertCustomerExists(context: RequestTenantContext, customerId: string) {
    const customer = await this.opportunityRepository.findCustomerById(context, customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
  }

  private async assertLeadExists(context: RequestTenantContext, leadId: string) {
    const lead = await this.opportunityRepository.findLeadById(context, leadId);
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
  }

  private async assertAssignableUser(context: RequestTenantContext, userId: string) {
    const membership = await this.opportunityRepository.findTenantMemberByUserId(context, userId);
    if (!membership) {
      throw new NotFoundException('Assignable user not found in tenant');
    }
  }
}
