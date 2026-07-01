import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DeliverOrderDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  recipientName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
