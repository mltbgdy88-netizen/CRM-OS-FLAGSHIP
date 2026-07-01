import { IsEmail, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'lost'] as const;

export class CreateLeadDto {
  @IsString()
  @MinLength(1)
  fullName!: string;

  @IsString()
  @MinLength(1)
  companyName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsUUID()
  sourceId!: string;

  @IsOptional()
  @IsIn(LEAD_STATUSES)
  status?: (typeof LEAD_STATUSES)[number];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsUUID()
  assignedUserId?: string | null;

  @IsOptional()
  @IsUUID()
  customerId?: string | null;
}
