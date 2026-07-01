import { Injectable, NotFoundException } from '@nestjs/common';
import { createDashboardViewedEvent } from '@crm-os/events';
import type { RequestTenantContext } from '../../common/tenant/tenant-context.types';
import { IamRepository } from '../iam/repositories/iam.repository';
import { DomainEventPublisher } from '../iam/services/audit.service';
import { mapDashboardView } from './dashboard.mapper';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly iamRepository: IamRepository,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async getDashboard(context: RequestTenantContext) {
    const [dashboard, counts] = await Promise.all([
      this.dashboardRepository.findDefaultDashboard(context),
      this.dashboardRepository.getTenantKpiCounts(context),
    ]);

    if (!dashboard) {
      throw new NotFoundException('Default dashboard not found');
    }

    await this.iamRepository.writeAuditLog(context, {
      action: 'dashboard.viewed',
      entityType: 'dashboard',
      entityId: dashboard.id,
      payload: {
        code: dashboard.code,
        name: dashboard.name,
      },
    });

    this.eventPublisher.publish(
      createDashboardViewedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        dashboardId: dashboard.id,
      }),
    );

    return mapDashboardView(dashboard, counts);
  }
}
