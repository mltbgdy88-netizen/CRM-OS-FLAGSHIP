import { Injectable, NotFoundException } from '@nestjs/common';
import { createQuoteCreatedEvent } from '@crm-os/events';
import type { RequestTenantContext } from '../../common/tenant/tenant-context.types';
import { IamRepository } from '../iam/repositories/iam.repository';
import { DomainEventPublisher } from '../iam/services/audit.service';
import type { CreateQuoteDto } from './dto/create-quote.dto';
import type { ListQuotesQueryDto } from './dto/list-quotes-query.dto';
import type { UpdateQuoteDto } from './dto/update-quote.dto';
import { mapQuoteDetail, mapQuoteSummary } from './quote.mapper';
import { QuoteRepository, type QuoteChildInput } from './quote.repository';
import { calculateQuoteTotals } from './quote.totals';

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
