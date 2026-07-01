import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PERMISSIONS } from '@crm-os/permissions';
import {
  createLeadAssignedEvent,
  createLeadCreatedEvent,
  createLeadLostEvent,
  createLeadQualifiedEvent,
} from '@crm-os/events';
import type { RequestTenantContext } from '../../common/tenant/tenant-context.types';
import { IamRepository } from '../iam/repositories/iam.repository';
import { DomainEventPublisher } from '../iam/services/audit.service';
import { PermissionService } from '../iam/services/permission.service';
import { mapLeadSummary } from './lead.mapper';
import { LeadRepository } from './lead.repository';
import type { CreateLeadDto } from './dto/create-lead.dto';
import type { ListLeadsQueryDto } from './dto/list-leads-query.dto';
import type { UpdateLeadDto } from './dto/update-lead.dto';

function hasOwn(input: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(input, key);
}

@Injectable()
export class LeadService {
  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly iamRepository: IamRepository,
    private readonly permissionService: PermissionService,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async listLeads(context: RequestTenantContext, query: ListLeadsQueryDto) {
    const skip = (query.page - 1) * query.pageSize;
    const [total, leads] = await Promise.all([
      this.leadRepository.countLeads(context),
      this.leadRepository.listLeads(context, {
        skip,
        take: query.pageSize,
      }),
    ]);

    return {
      items: leads.map(mapLeadSummary),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async createLead(context: RequestTenantContext, dto: CreateLeadDto) {
    await this.assertSourceExists(context, dto.sourceId);

    if (dto.customerId) {
      await this.assertCustomerExists(context, dto.customerId);
    }

    if (dto.assignedUserId) {
      await this.assertAssignPermission(context);
      await this.assertAssignableUser(context, dto.assignedUserId);
    }

    const lead = await this.leadRepository.createLead(context, dto);

    if (dto.score !== undefined) {
      await this.leadRepository.appendLeadScore(context, lead.id, dto.score);
    }

    await this.leadRepository.appendLeadActivity(context, lead.id, {
      activityType: 'created',
      title: 'Lead created',
      body: `${lead.fullName} was created.`,
    });

    await this.iamRepository.writeAuditLog(context, {
      action: 'lead.created',
      entityType: 'lead',
      entityId: lead.id,
      payload: {
        fullName: lead.fullName,
        companyName: lead.companyName,
        status: lead.status,
        score: lead.score,
      },
    });

    this.eventPublisher.publish(
      createLeadCreatedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        leadId: lead.id,
        fullName: lead.fullName,
        companyName: lead.companyName,
      }),
    );

    if (lead.assignedUserId) {
      await this.leadRepository.appendLeadAssignment(context, lead.id, lead.assignedUserId);
      await this.leadRepository.appendLeadActivity(context, lead.id, {
        activityType: 'assigned',
        title: 'Lead assigned',
        body: `Lead assigned to user ${lead.assignedUserId}.`,
      });
      await this.iamRepository.writeAuditLog(context, {
        action: 'lead.assigned',
        entityType: 'lead',
        entityId: lead.id,
        payload: { assignedUserId: lead.assignedUserId },
      });
      this.eventPublisher.publish(
        createLeadAssignedEvent({
          tenantId: context.tenantId,
          actorId: context.userId,
          leadId: lead.id,
          assignedUserId: lead.assignedUserId,
        }),
      );
    }

    return mapLeadSummary(lead);
  }

  async updateLead(context: RequestTenantContext, id: string, dto: UpdateLeadDto) {
    const existing = await this.leadRepository.findLeadById(context, id);
    if (!existing) {
      throw new NotFoundException('Lead not found');
    }

    if (dto.sourceId && dto.sourceId !== existing.sourceId) {
      await this.assertSourceExists(context, dto.sourceId);
    }

    if (dto.customerId) {
      await this.assertCustomerExists(context, dto.customerId);
    }

    const assignmentChanged =
      hasOwn(dto, 'assignedUserId') && dto.assignedUserId !== existing.assignedUserId;
    if (assignmentChanged) {
      await this.assertAssignPermission(context);
      if (dto.assignedUserId) {
        await this.assertAssignableUser(context, dto.assignedUserId);
      }
    }

    const statusChanged = dto.status !== undefined && dto.status !== existing.status;

    const lead = await this.leadRepository.updateLead(context, id, dto);

    if (dto.score !== undefined) {
      await this.leadRepository.appendLeadScore(context, lead.id, dto.score);
    }

    await this.leadRepository.appendLeadActivity(context, lead.id, {
      activityType: 'updated',
      title: 'Lead updated',
      body: 'Lead core details were updated.',
    });

    await this.iamRepository.writeAuditLog(context, {
      action: 'lead.updated',
      entityType: 'lead',
      entityId: lead.id,
      payload: { changes: dto as Record<string, unknown> },
    });

    if (assignmentChanged) {
      await this.leadRepository.appendLeadAssignment(context, lead.id, lead.assignedUserId);
      await this.leadRepository.appendLeadActivity(context, lead.id, {
        activityType: 'assigned',
        title: 'Lead assignment changed',
        body: `Lead assignment updated to ${lead.assignedUserId ?? 'unassigned'}.`,
      });
      await this.iamRepository.writeAuditLog(context, {
        action: 'lead.assigned',
        entityType: 'lead',
        entityId: lead.id,
        payload: {
          previousAssignedUserId: existing.assignedUserId,
          assignedUserId: lead.assignedUserId,
        },
      });
      this.eventPublisher.publish(
        createLeadAssignedEvent({
          tenantId: context.tenantId,
          actorId: context.userId,
          leadId: lead.id,
          assignedUserId: lead.assignedUserId,
        }),
      );
    }

    if (statusChanged && lead.status === 'qualified') {
      await this.leadRepository.appendLeadActivity(context, lead.id, {
        activityType: 'qualified',
        title: 'Lead qualified',
        body: `${lead.fullName} is now qualified.`,
      });
      await this.iamRepository.writeAuditLog(context, {
        action: 'lead.qualified',
        entityType: 'lead',
        entityId: lead.id,
        payload: { previousStatus: existing.status, status: lead.status },
      });
      this.eventPublisher.publish(
        createLeadQualifiedEvent({
          tenantId: context.tenantId,
          actorId: context.userId,
          leadId: lead.id,
        }),
      );
    }

    if (statusChanged && lead.status === 'lost') {
      await this.leadRepository.appendLeadActivity(context, lead.id, {
        activityType: 'lost',
        title: 'Lead lost',
        body: `${lead.fullName} was marked as lost.`,
      });
      await this.iamRepository.writeAuditLog(context, {
        action: 'lead.lost',
        entityType: 'lead',
        entityId: lead.id,
        payload: { previousStatus: existing.status, status: lead.status },
      });
      this.eventPublisher.publish(
        createLeadLostEvent({
          tenantId: context.tenantId,
          actorId: context.userId,
          leadId: lead.id,
        }),
      );
    }

    return mapLeadSummary(lead);
  }

  private async assertSourceExists(context: RequestTenantContext, sourceId: string) {
    const source = await this.leadRepository.findLeadSourceById(context, sourceId);
    if (!source) {
      throw new NotFoundException('Lead source not found');
    }
  }

  private async assertCustomerExists(context: RequestTenantContext, customerId: string) {
    const customer = await this.leadRepository.findCustomerById(context, customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
  }

  private async assertAssignableUser(context: RequestTenantContext, userId: string) {
    const membership = await this.leadRepository.findTenantMemberByUserId(context, userId);
    if (!membership) {
      throw new NotFoundException('Assignable user not found in tenant');
    }
  }

  private async assertAssignPermission(context: RequestTenantContext) {
    const allowed = await this.permissionService.hasPermissions(context, [PERMISSIONS.LEAD_ASSIGN]);
    if (!allowed) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }
}
