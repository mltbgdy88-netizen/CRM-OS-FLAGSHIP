import { authenticatedFetch, parseApiResponse } from './authenticated-fetch';

export type ProductStatus = 'active' | 'draft' | 'archived';

export interface ProductBrandSummary {
  id: string;
  name: string;
  code: string;
}

export interface ProductCategorySummary {
  id: string;
  name: string;
  code: string;
}

export interface ProductPrice {
  id: string;
  amount: number;
  currencyCode: string;
  isDefault: boolean;
  variantId: string | null;
  createdAt: string;
  version: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  sortOrder: number;
  prices: ProductPrice[];
  createdAt: string;
  updatedAt: string | null;
  version: number;
}

export interface ProductListItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  status: ProductStatus;
  brandId: string | null;
  categoryId: string | null;
  brand: ProductBrandSummary | null;
  category: ProductCategorySummary | null;
  createdAt: string;
  updatedAt: string | null;
  version: number;
}

export interface ProductDetail extends ProductListItem {
  variants: ProductVariant[];
  prices: ProductPrice[];
}

export interface ProductListResult {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listProducts(page = 1, pageSize = 50): Promise<ProductListResult> {
  const response = await authenticatedFetch(
    `/api/v1/products?page=${page}&pageSize=${pageSize}`,
  );
  return parseApiResponse<ProductListResult>(response);
}

export async function getProduct(id: string): Promise<ProductDetail> {
  const response = await authenticatedFetch(`/api/v1/products/${id}`);
  return parseApiResponse<ProductDetail>(response);
}
