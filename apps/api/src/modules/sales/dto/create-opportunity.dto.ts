import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreateOpportunityDto {
  @IsUUID()
  pipelineId!: string;

  @IsOptional()
  @IsUUID()
  stageId?: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  companyName!: string;

  @IsOptional()
  @IsUUID()
  leadId?: string | null;

  @IsOptional()
  @IsUUID()
  customerId?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  probability?: number;

  @IsOptional()
  @IsUUID()
  assignedUserId?: string | null;
}
