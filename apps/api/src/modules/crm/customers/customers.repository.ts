import { Injectable } from '@nestjs/common';
import type { TenantContext } from '@crm-os/database';
import { withTenantContext } from '@crm-os/database';
import { PrismaService } from '../../../database/prisma.service';

const customerDetailInclude = {
  contacts: { where: { deletedAt: null } },
  addresses: { where: { deletedAt: null } },
  tags: { where: { deletedAt: null } },
  notes: { where: { deletedAt: null } },
  files: { where: { deletedAt: null } },
} as const;

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countCustomers(context: TenantContext): Promise<number> {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.customer.count({ where: { deletedAt: null } }),
    );
  }

  async listCustomers(
    context: TenantContext,
    input: { skip: number; take: number },
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.customer.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: input.skip,
        take: input.take,
      }),
    );
  }

  async findCustomerById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.customer.findFirst({
        where: { id, deletedAt: null },
        include: customerDetailInclude,
      }),
    );
  }

  async createCustomer(
    context: TenantContext,
    input: { displayName: string; email?: string; phone?: string; status?: string },
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.customer.create({
        data: {
          tenantId: context.tenantId,
          displayName: input.displayName,
          email: input.email,
          phone: input.phone,
          status: input.status ?? 'active',
          createdBy: context.userId,
        },
      }),
    );
  }

  async updateCustomer(
    context: TenantContext,
    id: string,
    input: { displayName?: string; email?: string; phone?: string; status?: string },
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.customer.update({
        where: { id },
        data: {
          ...input,
          updatedBy: context.userId,
          updatedAt: new Date(),
          version: { increment: 1 },
        },
      }),
    );
  }
}
