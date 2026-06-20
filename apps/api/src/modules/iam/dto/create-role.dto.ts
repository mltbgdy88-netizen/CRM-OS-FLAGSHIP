import { IsBoolean, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MinLength(2)
  @Matches(/^[a-z0-9_]+$/)
  code!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
