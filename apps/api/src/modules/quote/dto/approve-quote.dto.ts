import { IsIn, IsOptional, IsString } from 'class-validator';

const APPROVAL_DECISIONS = ['approved', 'rejected'] as const;

export class ApproveQuoteDto {
  @IsIn(APPROVAL_DECISIONS)
  decision!: (typeof APPROVAL_DECISIONS)[number];

  @IsOptional()
  @IsString()
  notes?: string;
}
