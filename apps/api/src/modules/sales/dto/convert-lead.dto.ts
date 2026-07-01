import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class ConvertLeadDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  pipelineId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;
}
