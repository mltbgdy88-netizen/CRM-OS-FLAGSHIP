import { IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

const PRODUCT_STATUSES = ['active', 'passive'] as const;

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  sku?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(PRODUCT_STATUSES)
  status?: (typeof PRODUCT_STATUSES)[number];

  @IsOptional()
  @IsUUID()
  brandId?: string | null;

  @IsOptional()
  @IsUUID()
  categoryId?: string | null;
}
