import { Injectable } from '@nestjs/common';
import type { TenantContext } from '@crm-os/database';
import { withTenantContext } from '@crm-os/database';
import { PrismaService } from '../../database/prisma.service';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';

const productSummaryInclude = {
  brand: true,
  category: true,
} as const;

const productDetailInclude = {
  ...productSummaryInclude,
  variants: {
    where: { deletedAt: null },
    orderBy: { sortOrder: 'asc' as const },
    include: {
      prices: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'asc' as const },
      },
    },
  },
  prices: {
    where: { deletedAt: null, variantId: null },
    orderBy: { createdAt: 'asc' as const },
  },
} as const;

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countProducts(context: TenantContext): Promise<number> {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.product.count({ where: { deletedAt: null } }),
    );
  }

  async listProducts(context: TenantContext, input: { skip: number; take: number }) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.product.findMany({
        where: { deletedAt: null },
        include: productSummaryInclude,
        orderBy: { createdAt: 'desc' },
        skip: input.skip,
        take: input.take,
      }),
    );
  }

  async findProductDetailById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.product.findFirst({
        where: { id, deletedAt: null },
        include: productDetailInclude,
      }),
    );
  }

  async findBrandById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.productBrand.findFirst({
        where: { id, deletedAt: null },
      }),
    );
  }

  async findCategoryById(context: TenantContext, id: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.productCategory.findFirst({
        where: { id, deletedAt: null },
      }),
    );
  }

  async createProduct(context: TenantContext, dto: CreateProductDto) {
    const productPrices = dto.prices ?? [];
    const variants = dto.variants ?? [];

    return withTenantContext(this.prisma, context, async (tx) => {
      const product = await tx.product.create({
        data: {
          tenantId: context.tenantId,
          sku: dto.sku,
          name: dto.name,
          description: dto.description,
          status: dto.status ?? 'active',
          brandId: dto.brandId ?? null,
          categoryId: dto.categoryId ?? null,
          createdBy: context.userId,
        },
      });

      for (const price of productPrices) {
        await tx.productPrice.create({
          data: {
            tenantId: context.tenantId,
            productId: product.id,
            amount: price.amount,
            currencyCode: price.currencyCode ?? 'TRY',
            isDefault: price.isDefault ?? false,
            createdBy: context.userId,
          },
        });
      }

      for (const [index, variant] of variants.entries()) {
        const createdVariant = await tx.productVariant.create({
          data: {
            tenantId: context.tenantId,
            productId: product.id,
            sku: variant.sku,
            name: variant.name,
            sortOrder: variant.sortOrder ?? index + 1,
            createdBy: context.userId,
          },
        });

        for (const price of variant.prices ?? []) {
          await tx.productPrice.create({
            data: {
              tenantId: context.tenantId,
              productId: product.id,
              variantId: createdVariant.id,
              amount: price.amount,
              currencyCode: price.currencyCode ?? 'TRY',
              isDefault: price.isDefault ?? false,
              createdBy: context.userId,
            },
          });
        }
      }

      return tx.product.findFirstOrThrow({
        where: { id: product.id },
        include: productDetailInclude,
      });
    });
  }

  async updateProduct(context: TenantContext, id: string, dto: UpdateProductDto) {
    const data: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy: context.userId,
      version: { increment: 1 },
    };

    if (dto.sku !== undefined) data.sku = dto.sku;
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.status !== undefined) data.status = dto.status;
    if (Object.prototype.hasOwnProperty.call(dto, 'brandId')) {
      data.brandId = dto.brandId ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(dto, 'categoryId')) {
      data.categoryId = dto.categoryId ?? null;
    }

    return withTenantContext(this.prisma, context, async (tx) =>
      tx.product.update({
        where: { id },
        data,
        include: productDetailInclude,
      }),
    );
  }
}
