import { createHash } from 'node:crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  createQuoteApprovedEvent,
  createQuoteCreatedEvent,
  createQuoteRejectedEvent,
  createQuoteSentEvent,
  createQuoteViewedEvent,
} from '@crm-os/events';
import type { RequestTenantContext } from '../../common/tenant/tenant-context.types';
import { IamRepository } from '../iam/repositories/iam.repository';
import { DomainEventPublisher } from '../iam/services/audit.service';
import type { ApproveQuoteDto } from './dto/approve-quote.dto';
import type { CreateQuoteDto } from './dto/create-quote.dto';
import type { ListQuotesQueryDto } from './dto/list-quotes-query.dto';
import type { SendQuoteDto } from './dto/send-quote.dto';
import type { UpdateQuoteDto } from './dto/update-quote.dto';
import { mapQuoteDetail, mapQuoteSummary } from './quote.mapper';
import { generateQuotePdfBuffer } from './quote.pdf-generator';
import { QuoteRepository, type QuoteChildInput } from './quote.repository';
import { calculateQuoteTotals } from './quote.totals';

const SENDABLE_QUOTE_STATUSES = new Set(['draft']);

function hasOwn(input: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(input, key);
}

@Injectable()
export class QuoteService {
  constructor(
    private readonly quoteRepository: QuoteRepository,
    private readonly iamRepository: IamRepository,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async listQuotes(context: RequestTenantContext, query: ListQuotesQueryDto) {
    const skip = (query.page - 1) * query.pageSize;
    const [total, quotes] = await Promise.all([
      this.quoteRepository.countQuotes(context),
      this.quoteRepository.listQuotes(context, {
        skip,
        take: query.pageSize,
      }),
    ]);

    return {
      items: quotes.map(mapQuoteSummary),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async getQuoteById(context: RequestTenantContext, id: string) {
    const quote = await this.quoteRepository.findQuoteDetailById(context, id);
    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    return mapQuoteDetail(quote);
  }

  async createQuote(context: RequestTenantContext, dto: CreateQuoteDto) {
    await this.assertCustomerExists(context, dto.customerId);

    if (dto.opportunityId) {
      await this.assertOpportunityExists(context, dto.opportunityId);
    }

    const children = {
      items: dto.items ?? [],
      discounts: dto.discounts ?? [],
      taxes: dto.taxes ?? [],
    };
    const totals = calculateQuoteTotals(children.items, children.discounts, children.taxes);
    const number = await this.quoteRepository.getNextQuoteNumber(context);

    const quote = await this.quoteRepository.createQuote(context, {
      number,
      customerId: dto.customerId,
      opportunityId: dto.opportunityId,
      status: dto.status,
      currencyCode: dto.currencyCode,
      notes: dto.notes,
      marginPercent: dto.marginPercent,
      totals,
      children,
    });

    await this.iamRepository.writeAuditLog(context, {
      action: 'quote.created',
      entityType: 'quote',
      entityId: quote.id,
      payload: {
        number: quote.number,
        customerId: quote.customerId,
        total: quote.total,
        status: quote.status,
      },
    });

    this.eventPublisher.publish(
      createQuoteCreatedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        quoteId: quote.id,
        number: quote.number,
        customerId: quote.customerId,
        total: Number(quote.total),
      }),
    );

    return mapQuoteDetail(quote);
  }

  async updateQuote(context: RequestTenantContext, id: string, dto: UpdateQuoteDto) {
    const existing = await this.quoteRepository.findQuoteById(context, id);
    if (!existing) {
      throw new NotFoundException('Quote not found');
    }

    if (dto.customerId) {
      await this.assertCustomerExists(context, dto.customerId);
    }

    if (dto.opportunityId) {
      await this.assertOpportunityExists(context, dto.opportunityId);
    }

    const childrenProvided =
      dto.items !== undefined || dto.discounts !== undefined || dto.taxes !== undefined;

    let totals: ReturnType<typeof calculateQuoteTotals> | undefined;
    let children: QuoteChildInput | undefined;

    if (childrenProvided) {
      const detail = await this.quoteRepository.findQuoteDetailById(context, id);
      if (!detail) {
        throw new NotFoundException('Quote not found');
      }

      children = {
        items:
          dto.items ??
          detail.items.map((item) => ({
            name: item.name,
            description: item.description ?? undefined,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            sortOrder: item.sortOrder,
          })),
        discounts:
          dto.discounts ??
          detail.discounts.map((discount) => ({
            name: discount.name,
            discountType: discount.discountType as 'percent' | 'fixed',
            value: Number(discount.value),
          })),
        taxes:
          dto.taxes ??
          detail.taxes.map((tax) => ({
            name: tax.name,
            ratePercent: Number(tax.ratePercent),
          })),
      };

      totals = calculateQuoteTotals(children.items, children.discounts, children.taxes);
    }

    const quote = await this.quoteRepository.updateQuote(context, id, {
      customerId: hasOwn(dto, 'customerId') ? dto.customerId : undefined,
      opportunityId: hasOwn(dto, 'opportunityId') ? dto.opportunityId : undefined,
      status: dto.status,
      currencyCode: dto.currencyCode,
      notes: hasOwn(dto, 'notes') ? dto.notes : undefined,
      marginPercent: dto.marginPercent,
      totals,
      children,
    });

    await this.iamRepository.writeAuditLog(context, {
      action: 'quote.updated',
      entityType: 'quote',
      entityId: quote.id,
      payload: { changes: dto as Record<string, unknown> },
    });

    return mapQuoteDetail(quote);
  }

  async sendQuote(context: RequestTenantContext, id: string, dto: SendQuoteDto) {
    const existing = await this.quoteRepository.findQuoteById(context, id);
    if (!existing) {
      throw new NotFoundException('Quote not found');
    }

    if (!SENDABLE_QUOTE_STATUSES.has(existing.status)) {
      throw new BadRequestException('Only draft quotes can be sent');
    }

    const recipientEmail = dto.recipientEmail ?? existing.customer.email ?? '';
    const result = await this.quoteRepository.sendQuote(context, id, {
      recipientEmail: dto.recipientEmail,
    });

    if (!result) {
      throw new NotFoundException('Quote not found');
    }

    await this.iamRepository.writeAuditLog(context, {
      action: 'quote.sent',
      entityType: 'quote',
      entityId: result.quote.id,
      payload: {
        number: result.quote.number,
        recipientEmail: recipientEmail || null,
        status: result.quote.status,
        approvalId: result.approval.id,
      },
    });

    this.eventPublisher.publish(
      createQuoteSentEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        quoteId: result.quote.id,
        number: result.quote.number,
        recipientEmail,
      }),
    );

    return mapQuoteDetail(result.quote);
  }

  async approveQuote(context: RequestTenantContext, id: string, dto: ApproveQuoteDto) {
    const existing = await this.quoteRepository.findQuoteById(context, id);
    if (!existing) {
      throw new NotFoundException('Quote not found');
    }

    if (existing.status !== 'sent') {
      throw new BadRequestException('Only sent quotes can be approved or rejected');
    }

    const pendingApproval = await this.quoteRepository.findPendingApproval(context, id);
    if (!pendingApproval) {
      throw new BadRequestException('No pending approval found for this quote');
    }

    const result = await this.quoteRepository.resolveQuoteApproval(context, id, {
      decision: dto.decision,
      notes: dto.notes,
    });

    if (!result?.quote || !result.approval) {
      throw new NotFoundException('Quote not found');
    }

    const auditAction =
      dto.decision === 'approved' ? 'quote.approved' : 'quote.rejected';

    await this.iamRepository.writeAuditLog(context, {
      action: auditAction,
      entityType: 'quote',
      entityId: result.quote.id,
      payload: {
        number: result.quote.number,
        decision: dto.decision,
        notes: dto.notes ?? null,
        approvalId: result.approval.id,
        status: result.quote.status,
      },
    });

    if (dto.decision === 'approved') {
      this.eventPublisher.publish(
        createQuoteApprovedEvent({
          tenantId: context.tenantId,
          actorId: context.userId,
          quoteId: result.quote.id,
          approvedBy: context.userId,
          totalAmount: Number(result.quote.total),
          currency: result.quote.currencyCode,
          approvalRequestId: result.approval.id,
        }),
      );
    } else {
      this.eventPublisher.publish(
        createQuoteRejectedEvent({
          tenantId: context.tenantId,
          actorId: context.userId,
          quoteId: result.quote.id,
          rejectedBy: context.userId,
          reason: dto.notes,
        }),
      );
    }

    return mapQuoteDetail(result.quote);
  }

  async generateQuotePdf(context: RequestTenantContext, id: string) {
    const quote = await this.quoteRepository.findQuoteDetailById(context, id);
    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    const buffer = generateQuotePdfBuffer({
      number: quote.number,
      customerName: quote.customer.displayName,
      total: quote.total.toString(),
      currencyCode: quote.currencyCode,
    });

    const checksum = createHash('sha256').update(buffer).digest('hex');
    const fileName = `quote-${quote.number}.pdf`;
    const storageKey = `tenants/${context.tenantId}/quotes/${quote.number}.pdf`;

    await this.quoteRepository.recordQuotePdfGeneration(context, id, {
      fileName,
      storageKey,
      sizeBytes: buffer.length,
      checksum: `sha256:${checksum}`,
    });

    this.eventPublisher.publish(
      createQuoteViewedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        quoteId: quote.id,
        viewerType: 'authenticated',
      }),
    );

    return { buffer, fileName };
  }

  private async assertCustomerExists(context: RequestTenantContext, customerId: string) {
    const customer = await this.quoteRepository.findCustomerById(context, customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
  }

  private async assertOpportunityExists(context: RequestTenantContext, opportunityId: string) {
    const opportunity = await this.quoteRepository.findOpportunityById(context, opportunityId);
    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }
  }
}
