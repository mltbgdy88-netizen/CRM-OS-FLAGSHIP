import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'lost'] as const;

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  companyName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUUID()
  sourceId?: string;

  @IsOptional()
  @IsIn(LEAD_STATUSES)
  status?: (typeof LEAD_STATUSES)[number];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  assignedUserId?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  customerId?: string | null;
}
