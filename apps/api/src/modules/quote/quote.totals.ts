export interface QuoteLineInput {
  quantity: number;
  unitPrice: number;
}

export interface QuoteDiscountInput {
  discountType: 'percent' | 'fixed';
  value: number;
}

export interface QuoteTaxInput {
  ratePercent: number;
}

export interface QuoteTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateLineTotal(quantity: number, unitPrice: number): number {
  return roundMoney(quantity * unitPrice);
}

export function calculateQuoteTotals(
  items: QuoteLineInput[],
  discounts: QuoteDiscountInput[],
  taxes: QuoteTaxInput[],
): QuoteTotals {
  const subtotal = roundMoney(
    items.reduce((sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice), 0),
  );

  const discountTotal = roundMoney(
    discounts.reduce((sum, discount) => {
      if (discount.discountType === 'percent') {
        return sum + roundMoney(subtotal * (discount.value / 100));
      }
      return sum + discount.value;
    }, 0),
  );

  const taxableBase = roundMoney(subtotal - discountTotal);

  const taxTotal = roundMoney(
    taxes.reduce((sum, tax) => sum + roundMoney(taxableBase * (tax.ratePercent / 100)), 0),
  );

  const total = roundMoney(subtotal - discountTotal + taxTotal);

  return { subtotal, discountTotal, taxTotal, total };
}
