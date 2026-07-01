import type {
  Product,
  ProductBrand,
  ProductCategory,
  ProductPrice,
  ProductVariant,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

type ProductRecord = Product & {
  brand: ProductBrand | null;
  category: ProductCategory | null;
};

type ProductPriceRecord = ProductPrice;

type ProductVariantRecord = ProductVariant & {
  prices: ProductPriceRecord[];
};

type ProductDetailRecord = ProductRecord & {
  variants: ProductVariantRecord[];
  prices: ProductPriceRecord[];
};

function decimalToNumber(value: Decimal | number): number {
  if (value instanceof Decimal) {
    return value.toNumber();
  }
  return value;
}

function mapBrand(brand: ProductBrand | null) {
  if (!brand) {
    return null;
  }

  return {
    id: brand.id,
    name: brand.name,
    code: brand.code,
  };
}

function mapCategory(category: ProductCategory | null) {
  if (!category) {
    return null;
  }

  return {
    id: category.id,
    name: category.name,
    code: category.code,
  };
}

function mapPrice(price: ProductPriceRecord) {
  return {
    id: price.id,
    amount: decimalToNumber(price.amount),
    currencyCode: price.currencyCode,
    isDefault: price.isDefault,
    variantId: price.variantId,
    createdAt: price.createdAt.toISOString(),
    version: price.version,
  };
}

function mapVariant(variant: ProductVariantRecord) {
  return {
    id: variant.id,
    sku: variant.sku,
    name: variant.name,
    sortOrder: variant.sortOrder,
    prices: variant.prices.map(mapPrice),
    createdAt: variant.createdAt.toISOString(),
    updatedAt: variant.updatedAt?.toISOString() ?? null,
    version: variant.version,
  };
}

function mapProductCore(product: ProductRecord) {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    status: product.status,
    brandId: product.brandId,
    categoryId: product.categoryId,
    brand: mapBrand(product.brand),
    category: mapCategory(product.category),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt?.toISOString() ?? null,
    version: product.version,
  };
}

export function mapProductSummary(product: ProductRecord) {
  return mapProductCore(product);
}

export function mapProductDetail(product: ProductDetailRecord) {
  return {
    ...mapProductCore(product),
    variants: product.variants.map(mapVariant),
    prices: product.prices.map(mapPrice),
  };
}
