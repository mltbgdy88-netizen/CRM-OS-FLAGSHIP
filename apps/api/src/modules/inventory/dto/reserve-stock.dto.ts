import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReserveStockItemDto {
  @IsUUID()
  warehouseId!: string;

  @IsUUID()
  productVariantId!: string;

  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantity!: number;
}

export class ReserveStockDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReserveStockItemDto)
  items!: ReserveStockItemDto[];

  @IsOptional()
  notes?: string;
}

export class ListStockReservationsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;
}
