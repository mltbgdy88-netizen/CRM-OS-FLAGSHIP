import { authenticatedFetch, parseApiResponse } from './authenticated-fetch';

export interface InventoryWarehouseSummary {
  id: string;
  name: string;
  code: string;
  stockCount: number;
  onHandTotal: number;
}

export interface StockProductRef {
  id: string;
  sku: string;
  name: string;
}

export interface StockVariantRef extends StockProductRef {
  product: StockProductRef;
}

export interface StockWarehouseRef {
  id: string;
  name: string;
  code: string;
}

export interface StockListItem {
  id: string;
  warehouseId: string;
  productVariantId: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  criticalLevel: number | null;
  isCritical: boolean;
  warehouse: StockWarehouseRef;
  productVariant: StockVariantRef;
}

export interface StockMovementItem {
  id: string;
  warehouseId: string;
  productVariantId: string;
  stockId: string | null;
  movementType: string;
  quantity: number;
  referenceType: string | null;
  referenceId: string | null;
  movementAt: string;
  notes: string | null;
  warehouse: StockWarehouseRef;
  productVariant: StockVariantRef;
}

export interface InventoryOverview {
  totalSkus: number;
  totalOnHand: number;
  totalReserved: number;
  totalAvailable: number;
  criticalCount: number;
  warehouses: InventoryWarehouseSummary[];
  recentMovements: StockMovementItem[];
}

export interface StockListResult {
  items: StockListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StockReservationItem {
  id: string;
  orderId: string;
  orderNumber: string;
  stockId: string;
  warehouseId: string;
  productVariantId: string;
  quantity: number;
  status: string;
  releasedAt: string | null;
  createdAt: string;
  warehouse: StockWarehouseRef;
  productVariant: StockVariantRef;
}

export interface StockReservationListResult {
  items: StockReservationItem[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getInventoryOverview(): Promise<InventoryOverview> {
  const response = await authenticatedFetch('/api/v1/inventory');
  return parseApiResponse<InventoryOverview>(response);
}

export async function listStocks(page = 1, pageSize = 50, warehouseId?: string): Promise<StockListResult> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (warehouseId) {
    params.set('warehouseId', warehouseId);
  }
  const response = await authenticatedFetch(`/api/v1/stocks?${params.toString()}`);
  return parseApiResponse<StockListResult>(response);
}

export async function createStockMovement(input: {
  warehouseId: string;
  productVariantId: string;
  movementType: 'in' | 'out' | 'adjust';
  quantity: number;
  notes?: string;
}): Promise<StockMovementItem> {
  const response = await authenticatedFetch('/api/v1/stock-movements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseApiResponse<StockMovementItem>(response);
}

export async function listStockReservations(
  page = 1,
  pageSize = 50,
): Promise<StockReservationListResult> {
  const response = await authenticatedFetch(
    `/api/v1/stock-reservations?page=${page}&pageSize=${pageSize}`,
  );
  return parseApiResponse<StockReservationListResult>(response);
}

export async function releaseStockReservation(id: string): Promise<StockReservationItem> {
  const response = await authenticatedFetch(`/api/v1/stock-reservations/${id}/release`, {
    method: 'POST',
  });
  return parseApiResponse<StockReservationItem>(response);
}
