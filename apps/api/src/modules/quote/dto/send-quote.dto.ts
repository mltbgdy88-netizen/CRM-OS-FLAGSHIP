import { IsEmail, IsOptional } from 'class-validator';

export class SendQuoteDto {
  @IsOptional()
  @IsEmail()
  recipientEmail?: string;
}
