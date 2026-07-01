import { IsDateString, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @MinLength(1)
  activityType!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  relatedType?: string;

  @IsOptional()
  @IsUUID()
  relatedId?: string;

  @IsOptional()
  @IsUUID()
  taskId?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;
}
