export interface OrderLineInput {
  quantity: number;
  unitPrice: number;
}

export interface OrderTaxInput {
  ratePercent: number;
}

export interface OrderTotals {
  subtotal: number;
  taxTotal: number;
  total: number;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateLineTotal(quantity: number, unitPrice: number): number {
  return roundMoney(quantity * unitPrice);
}

export function calculateOrderTotals(
  items: OrderLineInput[],
  taxes: OrderTaxInput[],
): OrderTotals {
  const subtotal = roundMoney(
    items.reduce((sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice), 0),
  );

  const taxTotal = roundMoney(
    taxes.reduce((sum, tax) => sum + roundMoney(subtotal * (tax.ratePercent / 100)), 0),
  );

  const total = roundMoney(subtotal + taxTotal);

  return { subtotal, taxTotal, total };
}
