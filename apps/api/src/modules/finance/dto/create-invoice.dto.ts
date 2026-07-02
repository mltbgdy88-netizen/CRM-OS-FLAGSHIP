import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateInvoiceItemDto {
  @IsString()
  @MaxLength(500)
  description!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  quantity = 1;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateInvoiceDto {
  @IsUUID()
  accountId!: string;

  @IsString()
  @MaxLength(50)
  invoiceNumber!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  taxAmount = 0;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency = 'TRY';

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items!: CreateInvoiceItemDto[];
}
