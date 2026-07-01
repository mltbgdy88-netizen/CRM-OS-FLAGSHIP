import { IsIn, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

const MOVEMENT_TYPES = ['in', 'out', 'adjust'] as const;
export type StockMovementType = (typeof MOVEMENT_TYPES)[number];

export class CreateStockMovementDto {
  @IsUUID()
  warehouseId!: string;

  @IsUUID()
  productVariantId!: string;

  @IsIn(MOVEMENT_TYPES)
  movementType!: StockMovementType;

  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantity!: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  referenceType?: string;

  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
