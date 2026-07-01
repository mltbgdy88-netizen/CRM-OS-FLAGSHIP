import { Injectable, NotFoundException } from '@nestjs/common';
import { createProductCreatedEvent, createProductUpdatedEvent } from '@crm-os/events';
import type { RequestTenantContext } from '../../common/tenant/tenant-context.types';
import { IamRepository } from '../iam/repositories/iam.repository';
import { DomainEventPublisher } from '../iam/services/audit.service';
import type { CreateProductDto } from './dto/create-product.dto';
import type { ListProductsQueryDto } from './dto/list-products-query.dto';
import type { UpdateProductDto } from './dto/update-product.dto';
import { mapProductDetail, mapProductSummary } from './product.mapper';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly iamRepository: IamRepository,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async listProducts(context: RequestTenantContext, query: ListProductsQueryDto) {
    const skip = (query.page - 1) * query.pageSize;
    const [total, products] = await Promise.all([
      this.productRepository.countProducts(context),
      this.productRepository.listProducts(context, {
        skip,
        take: query.pageSize,
      }),
    ]);

    return {
      items: products.map(mapProductSummary),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async getProductById(context: RequestTenantContext, id: string) {
    const product = await this.productRepository.findProductDetailById(context, id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return mapProductDetail(product);
  }

  async createProduct(context: RequestTenantContext, dto: CreateProductDto) {
    if (dto.brandId) {
      await this.assertBrandExists(context, dto.brandId);
    }

    if (dto.categoryId) {
      await this.assertCategoryExists(context, dto.categoryId);
    }

    const product = await this.productRepository.createProduct(context, dto);

    await this.iamRepository.writeAuditLog(context, {
      action: 'product.created',
      entityType: 'product',
      entityId: product.id,
      payload: {
        sku: product.sku,
        name: product.name,
        status: product.status,
      },
    });

    this.eventPublisher.publish(
      createProductCreatedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        productId: product.id,
        sku: product.sku,
        name: product.name,
      }),
    );

    return mapProductDetail(product);
  }

  async updateProduct(context: RequestTenantContext, id: string, dto: UpdateProductDto) {
    const existing = await this.productRepository.findProductDetailById(context, id);
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    if (dto.brandId) {
      await this.assertBrandExists(context, dto.brandId);
    }

    if (dto.categoryId) {
      await this.assertCategoryExists(context, dto.categoryId);
    }

    const product = await this.productRepository.updateProduct(context, id, dto);

    await this.iamRepository.writeAuditLog(context, {
      action: 'product.updated',
      entityType: 'product',
      entityId: product.id,
      payload: { changes: dto as Record<string, unknown> },
    });

    this.eventPublisher.publish(
      createProductUpdatedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        productId: product.id,
        changes: dto as Record<string, unknown>,
      }),
    );

    return mapProductDetail(product);
  }

  private async assertBrandExists(context: RequestTenantContext, brandId: string) {
    const brand = await this.productRepository.findBrandById(context, brandId);
    if (!brand) {
      throw new NotFoundException('Product brand not found');
    }
  }

  private async assertCategoryExists(context: RequestTenantContext, categoryId: string) {
    const category = await this.productRepository.findCategoryById(context, categoryId);
    if (!category) {
      throw new NotFoundException('Product category not found');
    }
  }
}
