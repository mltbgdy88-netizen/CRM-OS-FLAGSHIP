import { Injectable } from '@nestjs/common';
import type { TenantContext } from '@crm-os/database';
import { withTenantContext } from '@crm-os/database';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { TenantKpiCounts } from './dashboard.mapper';

const dashboardInclude = {
  widgets: {
    where: { deletedAt: null },
    orderBy: { sortOrder: 'asc' as const },
  },
} as const;

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDefaultDashboard(context: TenantContext) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.dashboard.findFirst({
        where: {
          isDefault: true,
          deletedAt: null,
        },
        include: dashboardInclude,
      }),
    );
  }

  async getTenantKpiCounts(context: TenantContext): Promise<TenantKpiCounts> {
    return withTenantContext(this.prisma, context, async (tx) => {
      const [customers, openOpportunities, pendingTasks, quoteAggregate] = await Promise.all([
        tx.customer.count({ where: { deletedAt: null } }),
        tx.opportunity.count({
          where: {
            deletedAt: null,
            status: 'open',
          },
        }),
        tx.task.count({
          where: {
            deletedAt: null,
            status: 'pending',
          },
        }),
        tx.quote.aggregate({
          where: { deletedAt: null },
          _sum: { total: true },
        }),
      ]);

      return {
        customers,
        openOpportunities,
        pendingTasks,
        quoteTotal: quoteAggregate._sum.total ?? new Prisma.Decimal(0),
      };
    });
  }
}
