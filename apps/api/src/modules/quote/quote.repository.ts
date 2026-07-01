import { Injectable } from '@nestjs/common';
import type { TenantContext } from '@crm-os/database';
import { withTenantContext } from '@crm-os/database';
import { PrismaService } from '../../database/prisma.service';
import type { CreateQuoteDiscountDto, CreateQuoteItemDto, CreateQuoteTaxDto } from './dto/create-quote.dto';
import { calculateLineTotal, calculateQuoteTotals, roundMoney } from './quote.totals';

const quoteSummaryInclude = {
  customer: true,
} as const;

const quoteDetailInclude = {
  ...quoteSummaryInclude,
  items: {
    where: { deletedAt: null },
    orderBy: { sortOrder: 'asc' as const },
  },
  discounts: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' as const },
  },
  taxes: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' as const },
  },
} as const;

export interface QuoteChildInput {
  items: CreateQuoteItemDto[];
  discounts: CreateQuoteDiscountDto[];
  taxes: CreateQuoteTaxDto[];
}

@Injectable()
export class QuoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countQuotes(context: TenantContext): Promise<number> {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.quote.count({ where: { deletedAt: null } }),
    );
  }

  async listQuotes(context: TenantContext, input: { skip: number; take: number }) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.quote.findMany({
        where: { deletedAt: null },
        include: quoteSummaryInclude,
        orderBy: { createdAt: 'desc' },
        skip: input.skip,
        take: input.take,
      }),
    );
  }

  async findQuoteById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.quote.findFirst({
        where: { id, deletedAt: null },
        include: quoteSummaryInclude,
      }),
    );
  }

  async findQuoteDetailById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.quote.findFirst({
        where: { id, deletedAt: null },
        include: quoteDetailInclude,
      }),
    );
  }

  async findCustomerById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.customer.findFirst({
        where: { id, deletedAt: null },
      }),
    );
  }

  async findOpportunityById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.opportunity.findFirst({
        where: { id, deletedAt: null },
      }),
    );
  }

  async getNextQuoteNumber(context: TenantContext): Promise<string> {
    return withTenantContext(this.prisma, context, async (tx) => {
      const year = new Date().getFullYear();
      const prefix = `Q-${year}-`;
      const latest = await tx.quote.findFirst({
        where: { number: { startsWith: prefix } },
        orderBy: { number: 'desc' },
        select: { number: true },
      });

      if (!latest) {
        return `${prefix}0001`;
      }

      const sequence = Number.parseInt(latest.number.slice(prefix.length), 10);
      const next = Number.isFinite(sequence) ? sequence + 1 : 1;
      return `${prefix}${String(next).padStart(4, '0')}`;
    });
  }

  async createQuote(
    context: TenantContext,
    input: {
      number: string;
      customerId: string;
      opportunityId?: string | null;
      status?: string;
      currencyCode?: string;
      notes?: string;
      marginPercent?: number;
      totals: ReturnType<typeof calculateQuoteTotals>;
      children: QuoteChildInput;
    },
  ) {
    const taxAmounts = this.buildTaxAmounts(input.totals, input.children.taxes);

    return withTenantContext(this.prisma, context, async (tx) =>
      tx.quote.create({
        data: {
          tenantId: context.tenantId,
          number: input.number,
          customerId: input.customerId,
          opportunityId: input.opportunityId ?? null,
          status: input.status ?? 'draft',
          subtotal: input.totals.subtotal,
          discountTotal: input.totals.discountTotal,
          taxTotal: input.totals.taxTotal,
          total: input.totals.total,
          marginPercent: input.marginPercent ?? 0,
          currencyCode: input.currencyCode ?? 'TRY',
          notes: input.notes,
          createdBy: context.userId,
          items: {
            create: input.children.items.map((item, index) => ({
              tenantId: context.tenantId,
              name: item.name,
              description: item.description,
              quantity: item.quantity ?? 1,
              unitPrice: item.unitPrice,
              lineTotal: calculateLineTotal(item.quantity ?? 1, item.unitPrice),
              sortOrder: item.sortOrder ?? index + 1,
              createdBy: context.userId,
            })),
          },
          discounts: {
            create: input.children.discounts.map((discount) => ({
              tenantId: context.tenantId,
              name: discount.name,
              discountType: discount.discountType ?? 'percent',
              value: discount.value,
              createdBy: context.userId,
            })),
          },
          taxes: {
            create: input.children.taxes.map((tax, index) => ({
              tenantId: context.tenantId,
              name: tax.name,
              ratePercent: tax.ratePercent,
              amount: taxAmounts[index] ?? 0,
              createdBy: context.userId,
            })),
          },
          versions: {
            create: {
              tenantId: context.tenantId,
              versionNumber: 1,
              label: 'Initial',
              isCurrent: true,
              createdBy: context.userId,
            },
          },
        },
        include: quoteDetailInclude,
      }),
    );
  }

  async updateQuote(
    context: TenantContext,
    id: string,
    input: {
      customerId?: string | null;
      opportunityId?: string | null;
      status?: string;
      currencyCode?: string;
      notes?: string | null;
      marginPercent?: number;
      totals?: ReturnType<typeof calculateQuoteTotals>;
      children?: QuoteChildInput;
    },
  ) {
    const data: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy: context.userId,
      version: { increment: 1 },
    };

    if (input.customerId !== undefined) data.customerId = input.customerId;
    if (Object.prototype.hasOwnProperty.call(input, 'opportunityId')) {
      data.opportunityId = input.opportunityId ?? null;
    }
    if (input.status !== undefined) data.status = input.status;
    if (input.currencyCode !== undefined) data.currencyCode = input.currencyCode;
    if (Object.prototype.hasOwnProperty.call(input, 'notes')) {
      data.notes = input.notes ?? null;
    }
    if (input.marginPercent !== undefined) data.marginPercent = input.marginPercent;

    if (input.totals) {
      data.subtotal = input.totals.subtotal;
      data.discountTotal = input.totals.discountTotal;
      data.taxTotal = input.totals.taxTotal;
      data.total = input.totals.total;
    }

    return withTenantContext(this.prisma, context, async (tx) => {
      if (input.children) {
        const now = new Date();
        await tx.quoteItem.updateMany({
          where: { quoteId: id, deletedAt: null },
          data: { deletedAt: now, deletedBy: context.userId },
        });
        await tx.quoteDiscount.updateMany({
          where: { quoteId: id, deletedAt: null },
          data: { deletedAt: now, deletedBy: context.userId },
        });
        await tx.quoteTax.updateMany({
          where: { quoteId: id, deletedAt: null },
          data: { deletedAt: now, deletedBy: context.userId },
        });

        const taxAmounts = input.totals
          ? this.buildTaxAmounts(input.totals, input.children.taxes)
          : [];

        if (input.children.items.length > 0) {
          await tx.quoteItem.createMany({
            data: input.children.items.map((item, index) => ({
              tenantId: context.tenantId,
              quoteId: id,
              name: item.name,
              description: item.description,
              quantity: item.quantity ?? 1,
              unitPrice: item.unitPrice,
              lineTotal: calculateLineTotal(item.quantity ?? 1, item.unitPrice),
              sortOrder: item.sortOrder ?? index + 1,
              createdBy: context.userId,
            })),
          });
        }

        if (input.children.discounts.length > 0) {
          await tx.quoteDiscount.createMany({
            data: input.children.discounts.map((discount) => ({
              tenantId: context.tenantId,
              quoteId: id,
              name: discount.name,
              discountType: discount.discountType ?? 'percent',
              value: discount.value,
              createdBy: context.userId,
            })),
          });
        }

        if (input.children.taxes.length > 0) {
          await tx.quoteTax.createMany({
            data: input.children.taxes.map((tax, index) => ({
              tenantId: context.tenantId,
              quoteId: id,
              name: tax.name,
              ratePercent: tax.ratePercent,
              amount: taxAmounts[index] ?? 0,
              createdBy: context.userId,
            })),
          });
        }
      }

      return tx.quote.update({
        where: { id },
        data,
        include: quoteDetailInclude,
      });
    });
  }

  async sendQuote(
    context: TenantContext,
    quoteId: string,
    input: { recipientEmail?: string },
  ) {
    return withTenantContext(this.prisma, context, async (tx) => {
      const quote = await tx.quote.findFirst({
        where: { id: quoteId, deletedAt: null },
        include: quoteDetailInclude,
      });

      if (!quote) {
        return null;
      }

      const approval = await tx.quoteApproval.create({
        data: {
          tenantId: context.tenantId,
          quoteId,
          status: 'pending',
          notes: input.recipientEmail
            ? `Sent to ${input.recipientEmail} for approval.`
            : 'Awaiting approval.',
          createdBy: context.userId,
        },
      });

      await tx.quoteStatusHistory.create({
        data: {
          tenantId: context.tenantId,
          quoteId,
          fromStatus: quote.status,
          toStatus: 'sent',
          reason: input.recipientEmail
            ? `Quote sent to ${input.recipientEmail}.`
            : 'Quote sent for review.',
          createdBy: context.userId,
        },
      });

      const updatedQuote = await tx.quote.update({
        where: { id: quoteId },
        data: {
          status: 'sent',
          updatedAt: new Date(),
          updatedBy: context.userId,
          version: { increment: 1 },
        },
        include: quoteDetailInclude,
      });

      return { quote: updatedQuote, approval };
    });
  }

  async findPendingApproval(context: TenantContext, quoteId: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.quoteApproval.findFirst({
        where: {
          quoteId,
          status: 'pending',
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async resolveQuoteApproval(
    context: TenantContext,
    quoteId: string,
    input: { decision: 'approved' | 'rejected'; notes?: string },
  ) {
    return withTenantContext(this.prisma, context, async (tx) => {
      const quote = await tx.quote.findFirst({
        where: { id: quoteId, deletedAt: null },
      });

      if (!quote) {
        return null;
      }

      const approval = await tx.quoteApproval.findFirst({
        where: {
          quoteId,
          status: 'pending',
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!approval) {
        return { quote: null, approval: null };
      }

      const newStatus = input.decision === 'approved' ? 'approved' : 'rejected';

      const updatedApproval = await tx.quoteApproval.update({
        where: { id: approval.id },
        data: {
          status: input.decision,
          notes: input.notes ?? approval.notes,
          decidedAt: new Date(),
          approverUserId: context.userId,
          updatedAt: new Date(),
          updatedBy: context.userId,
          version: { increment: 1 },
        },
      });

      await tx.quoteStatusHistory.create({
        data: {
          tenantId: context.tenantId,
          quoteId,
          fromStatus: quote.status,
          toStatus: newStatus,
          reason: input.notes,
          createdBy: context.userId,
        },
      });

      const updatedQuote = await tx.quote.update({
        where: { id: quoteId },
        data: {
          status: newStatus,
          updatedAt: new Date(),
          updatedBy: context.userId,
          version: { increment: 1 },
        },
        include: quoteDetailInclude,
      });

      return { quote: updatedQuote, approval: updatedApproval };
    });
  }

  async recordQuotePdfGeneration(
    context: TenantContext,
    quoteId: string,
    input: {
      fileName: string;
      storageKey: string;
      sizeBytes: number;
      checksum: string;
    },
  ) {
    return withTenantContext(this.prisma, context, async (tx) => {
      const file = await tx.quoteFile.create({
        data: {
          tenantId: context.tenantId,
          quoteId,
          fileName: input.fileName,
          mimeType: 'application/pdf',
          storageKey: input.storageKey,
          sizeBytes: BigInt(input.sizeBytes),
          checksum: input.checksum,
          createdBy: context.userId,
        },
      });

      const viewLog = await tx.quoteViewLog.create({
        data: {
          tenantId: context.tenantId,
          quoteId,
          viewerUserId: context.userId,
          source: 'pdf',
          createdBy: context.userId,
        },
      });

      return { file, viewLog };
    });
  }

  private buildTaxAmounts(
    totals: ReturnType<typeof calculateQuoteTotals>,
    taxes: CreateQuoteTaxDto[],
  ): number[] {
    const taxableBase = roundMoney(totals.subtotal - totals.discountTotal);
    return taxes.map((tax) => roundMoney(taxableBase * (tax.ratePercent / 100)));
  }
}
