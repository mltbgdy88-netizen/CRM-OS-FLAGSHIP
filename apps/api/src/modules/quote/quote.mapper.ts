import type {
  Customer,
  Quote,
  QuoteDiscount,
  QuoteItem,
  QuoteTax,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type {
  QuoteDetailResponseDto,
  QuoteSummaryResponseDto,
} from './dto/quote-response.dto';

type QuoteRecord = Quote & {
  customer: Customer;
};

type QuoteDetailRecord = QuoteRecord & {
  items: QuoteItem[];
  discounts: QuoteDiscount[];
  taxes: QuoteTax[];
};

function decimalToNumber(value: Decimal | number): number {
  if (value instanceof Decimal) {
    return value.toNumber();
  }
  return value;
}

function mapCustomer(customer: Customer) {
  return {
    id: customer.id,
    displayName: customer.displayName,
  };
}

function mapQuoteCore(quote: QuoteRecord): QuoteSummaryResponseDto {
  return {
    id: quote.id,
    number: quote.number,
    customerId: quote.customerId,
    opportunityId: quote.opportunityId,
    status: quote.status,
    subtotal: decimalToNumber(quote.subtotal),
    discountTotal: decimalToNumber(quote.discountTotal),
    taxTotal: decimalToNumber(quote.taxTotal),
    total: decimalToNumber(quote.total),
    marginPercent: quote.marginPercent,
    currencyCode: quote.currencyCode,
    notes: quote.notes,
    customer: mapCustomer(quote.customer),
    createdAt: quote.createdAt.toISOString(),
    updatedAt: quote.updatedAt?.toISOString() ?? null,
    version: quote.version,
  };
}

export function mapQuoteSummary(quote: QuoteRecord): QuoteSummaryResponseDto {
  return mapQuoteCore(quote);
}

export function mapQuoteDetail(quote: QuoteDetailRecord): QuoteDetailResponseDto {
  return {
    ...mapQuoteCore(quote),
    items: quote.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitPrice: decimalToNumber(item.unitPrice),
      lineTotal: decimalToNumber(item.lineTotal),
      sortOrder: item.sortOrder,
      createdAt: item.createdAt.toISOString(),
      version: item.version,
    })),
    discounts: quote.discounts.map((discount) => ({
      id: discount.id,
      name: discount.name,
      discountType: discount.discountType,
      value: decimalToNumber(discount.value),
      createdAt: discount.createdAt.toISOString(),
      version: discount.version,
    })),
    taxes: quote.taxes.map((tax) => ({
      id: tax.id,
      name: tax.name,
      ratePercent: decimalToNumber(tax.ratePercent),
      amount: decimalToNumber(tax.amount),
      createdAt: tax.createdAt.toISOString(),
      version: tax.version,
    })),
  };
}
