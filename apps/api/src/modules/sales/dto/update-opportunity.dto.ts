import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

const OPPORTUNITY_STATUSES = ['open', 'won', 'lost'] as const;

export class UpdateOpportunityDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  companyName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  probability?: number;

  @IsOptional()
  @IsIn(OPPORTUNITY_STATUSES)
  status?: (typeof OPPORTUNITY_STATUSES)[number];

  @IsOptional()
  @IsUUID()
  stageId?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  assignedUserId?: string | null;
}
