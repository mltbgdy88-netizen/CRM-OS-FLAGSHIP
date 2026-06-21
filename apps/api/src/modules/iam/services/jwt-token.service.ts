import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign, verify } from 'jsonwebtoken';
import type { JwtPayload } from '../../../common/tenant/tenant-context.types';

@Injectable()
export class JwtTokenService {
  private readonly secret: string;
  private readonly accessTtlSeconds: number;
  private readonly refreshTtlSeconds: number;

  constructor(config: ConfigService) {
    this.secret = config.get<string>('JWT_SECRET') ?? 'change-me-local-only';
    this.accessTtlSeconds = Number(config.get<string>('JWT_ACCESS_TTL_SECONDS') ?? 900);
    this.refreshTtlSeconds = Number(config.get<string>('JWT_REFRESH_TTL_SECONDS') ?? 604800);
  }

  hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  createRefreshToken(userId: string, tenantId: string): { token: string; hash: string } {
    const nonce = randomBytes(24).toString('hex');
    const token = Buffer.from(`${userId}:${tenantId}:${nonce}`, 'utf8').toString('base64url');
    return { token, hash: this.hashToken(token) };
  }

  parseRefreshToken(token: string): { userId: string; tenantId: string } {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [userId, tenantId] = decoded.split(':');
    if (!userId || !tenantId) {
      throw new Error('Invalid refresh token');
    }
    return { userId, tenantId };
  }

  signAccessToken(payload: Omit<JwtPayload, never>): string {
    return sign(payload, this.secret, { expiresIn: this.accessTtlSeconds });
  }

  verifyAccessToken(token: string): JwtPayload {
    const decoded = verify(token, this.secret) as JwtPayload;
    if (!decoded.sub || !decoded.tenantId || !decoded.email) {
      throw new Error('Invalid token payload');
    }
    return decoded;
  }

  getRefreshExpiresAt(): Date {
    return new Date(Date.now() + this.refreshTtlSeconds * 1000);
  }
}
