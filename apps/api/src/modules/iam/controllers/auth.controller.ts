import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { okEnvelope } from '../../../common/http/api-envelope';
import { LoginDto, RefreshDto } from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const result = await this.authService.login(dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return okEnvelope(result);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    const result = await this.authService.refresh(dto);
    return okEnvelope(result);
  }
}
