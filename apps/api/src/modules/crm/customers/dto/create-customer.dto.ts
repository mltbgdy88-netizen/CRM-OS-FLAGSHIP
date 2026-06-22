import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MinLength(1)
  displayName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
