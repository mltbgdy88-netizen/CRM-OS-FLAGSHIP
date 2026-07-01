import type { Decimal } from '@prisma/client/runtime/library';

function decimalToNumber(value: Decimal | null | undefined): number {
  if (value == null) {
    return 0;
  }
  return Number(value);
}

export function mapStockSummary(stock: {
  id: string;
  warehouseId: string;
  productVariantId: string;
  quantityOnHand: Decimal;
  quantityReserved: Decimal;
  quantityAvailable: Decimal;
  criticalLevel: Decimal | null;
  warehouse: { id: string; name: string; code: string };
  productVariant: {
    id: string;
    sku: string;
    name: string;
    product: { id: string; sku: string; name: string };
  };
}) {
  const onHand = decimalToNumber(stock.quantityOnHand);
  const reserved = decimalToNumber(stock.quantityReserved);
  const available = decimalToNumber(stock.quantityAvailable);
  const criticalLevel = stock.criticalLevel != null ? decimalToNumber(stock.criticalLevel) : null;

  return {
    id: stock.id,
    warehouseId: stock.warehouseId,
    productVariantId: stock.productVariantId,
    quantityOnHand: onHand,
    quantityReserved: reserved,
    quantityAvailable: available,
    criticalLevel,
    isCritical: criticalLevel != null && available <= criticalLevel,
    warehouse: {
      id: stock.warehouse.id,
      name: stock.warehouse.name,
      code: stock.warehouse.code,
    },
    productVariant: {
      id: stock.productVariant.id,
      sku: stock.productVariant.sku,
      name: stock.productVariant.name,
      product: {
        id: stock.productVariant.product.id,
        sku: stock.productVariant.product.sku,
        name: stock.productVariant.product.name,
      },
    },
  };
}

export function mapStockMovement(movement: {
  id: string;
  warehouseId: string;
  productVariantId: string;
  stockId: string | null;
  movementType: string;
  quantity: Decimal;
  referenceType: string | null;
  referenceId: string | null;
  movementAt: Date;
  notes: string | null;
  warehouse: { id: string; name: string; code: string };
  productVariant: {
    id: string;
    sku: string;
    name: string;
    product: { id: string; sku: string; name: string };
  };
}) {
  return {
    id: movement.id,
    warehouseId: movement.warehouseId,
    productVariantId: movement.productVariantId,
    stockId: movement.stockId,
    movementType: movement.movementType,
    quantity: decimalToNumber(movement.quantity),
    referenceType: movement.referenceType,
    referenceId: movement.referenceId,
    movementAt: movement.movementAt.toISOString(),
    notes: movement.notes,
    warehouse: {
      id: movement.warehouse.id,
      name: movement.warehouse.name,
      code: movement.warehouse.code,
    },
    productVariant: {
      id: movement.productVariant.id,
      sku: movement.productVariant.sku,
      name: movement.productVariant.name,
      product: {
        id: movement.productVariant.product.id,
        sku: movement.productVariant.product.sku,
        name: movement.productVariant.product.name,
      },
    },
  };
}

export function mapInventoryOverview(input: {
  totalSkus: number;
  totalOnHand: number;
  totalReserved: number;
  totalAvailable: number;
  criticalCount: number;
  warehouses: Array<{
    id: string;
    name: string;
    code: string;
    stockCount: number;
    onHandTotal: number;
  }>;
  recentMovements: ReturnType<typeof mapStockMovement>[];
}) {
  return input;
}
