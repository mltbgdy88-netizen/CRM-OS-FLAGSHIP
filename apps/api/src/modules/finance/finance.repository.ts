import { Injectable } from '@nestjs/common';
import type { TenantContext } from '@crm-os/database';
import { withTenantContext } from '@crm-os/database';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { CreateInvoiceDto } from './dto/create-invoice.dto';

const accountInclude = {
  customer: {
    select: { id: true, displayName: true },
  },
  creditLimit: true,
  riskLimit: true,
} as const;

const transactionInclude = {
  account: {
    select: { id: true, name: true, code: true },
  },
} as const;

const invoiceInclude = {
  account: {
    select: { id: true, name: true, code: true },
  },
  items: {
    where: { deletedAt: null },
    orderBy: { sortOrder: 'asc' as const },
  },
} as const;

@Injectable()
export class FinanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countAccounts(context: TenantContext): Promise<number> {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.account.count({ where: { deletedAt: null } }),
    );
  }

  async listAccounts(context: TenantContext, input: { skip: number; take: number }) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.account.findMany({
        where: { deletedAt: null },
        include: accountInclude,
        orderBy: { name: 'asc' },
        skip: input.skip,
        take: input.take,
      }),
    );
  }

  async listAllAccounts(context: TenantContext) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.account.findMany({
        where: { deletedAt: null },
        include: accountInclude,
      }),
    );
  }

  async findAccountById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.account.findFirst({
        where: { id, deletedAt: null },
        include: accountInclude,
      }),
    );
  }

  async countAccountTransactions(context: TenantContext, accountId?: string): Promise<number> {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.accountTransaction.count({
        where: {
          deletedAt: null,
          ...(accountId ? { accountId } : {}),
        },
      }),
    );
  }

  async listAccountTransactions(
    context: TenantContext,
    input: { skip: number; take: number; accountId?: string },
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.accountTransaction.findMany({
        where: {
          deletedAt: null,
          ...(input.accountId ? { accountId: input.accountId } : {}),
        },
        include: transactionInclude,
        orderBy: { transactionAt: 'desc' },
        skip: input.skip,
        take: input.take,
      }),
    );
  }

  async listRecentTransactions(context: TenantContext, take: number) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.accountTransaction.findMany({
        where: { deletedAt: null },
        include: transactionInclude,
        orderBy: { transactionAt: 'desc' },
        take,
      }),
    );
  }

  async createInvoice(context: TenantContext, dto: CreateInvoiceDto, totals: {
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
  }) {
    return withTenantContext(this.prisma, context, async (tx) => {
      const account = await tx.account.findFirst({
        where: { id: dto.accountId, deletedAt: null },
      });

      if (!account) {
        return null;
      }

      const balanceBefore = Number(account.balance);
      const balanceAfter = balanceBefore + totals.totalAmount;

      const invoice = await tx.invoice.create({
        data: {
          tenantId: context.tenantId,
          accountId: dto.accountId,
          invoiceNumber: dto.invoiceNumber,
          status: 'issued',
          subtotal: new Prisma.Decimal(totals.subtotal),
          taxAmount: new Prisma.Decimal(totals.taxAmount),
          totalAmount: new Prisma.Decimal(totals.totalAmount),
          currency: dto.currency ?? 'TRY',
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          issuedAt: new Date(),
          createdBy: context.userId,
          items: {
            create: dto.items.map((item, index) => ({
              tenantId: context.tenantId,
              description: item.description,
              quantity: new Prisma.Decimal(item.quantity),
              unitPrice: new Prisma.Decimal(item.unitPrice),
              lineTotal: new Prisma.Decimal(item.quantity * item.unitPrice),
              sortOrder: index + 1,
              createdBy: context.userId,
            })),
          },
        },
        include: invoiceInclude,
      });

      await tx.account.update({
        where: { id: dto.accountId },
        data: {
          balance: new Prisma.Decimal(balanceAfter),
          updatedBy: context.userId,
          updatedAt: new Date(),
        },
      });

      await tx.accountTransaction.create({
        data: {
          tenantId: context.tenantId,
          accountId: dto.accountId,
          transactionType: 'invoice',
          amount: new Prisma.Decimal(totals.totalAmount),
          balanceAfter: new Prisma.Decimal(balanceAfter),
          referenceType: 'invoice',
          referenceId: invoice.id,
          description: `Invoice ${dto.invoiceNumber}`,
          createdBy: context.userId,
        },
      });

      return { invoice, balanceBefore, balanceAfter };
    });
  }
}
