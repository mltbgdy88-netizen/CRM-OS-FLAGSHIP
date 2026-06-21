import { Injectable } from '@nestjs/common';
import { createRoleChangedEvent } from '@crm-os/events';
import { IamRepository } from '../repositories/iam.repository';
import { AuditService, DomainEventPublisher } from './audit.service';
import type { CreateRoleDto } from '../dto/create-role.dto';
import type { RequestTenantContext } from '../../../common/tenant/tenant-context.types';

@Injectable()
export class UsersService {
  constructor(private readonly iamRepository: IamRepository) {}

  async listUsers(context: RequestTenantContext) {
    const members = await this.iamRepository.listUsers(context);
    return members.map((member) => ({
      id: member.user.id,
      email: member.user.email,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      status: member.status,
      membershipId: member.id,
    }));
  }
}

@Injectable()
export class RolesService {
  constructor(
    private readonly iamRepository: IamRepository,
    private readonly auditService: AuditService,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async createRole(context: RequestTenantContext, dto: CreateRoleDto) {
    const role = await this.iamRepository.createRole(context, dto);

    await this.auditService.record(context, {
      action: 'role.created',
      entityType: 'role',
      entityId: role.id,
      payload: { code: role.code, name: role.name },
    });

    this.eventPublisher.publish(
      createRoleChangedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        roleId: role.id,
        change: 'created',
      }),
    );

    return role;
  }
}
