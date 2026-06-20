import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { createUserLoggedInEvent } from '@crm-os/events';
import { IamRepository } from '../repositories/iam.repository';
import { JwtTokenService } from './jwt-token.service';
import { AuditService, DomainEventPublisher } from './audit.service';
import type { LoginDto, RefreshDto } from '../dto/auth.dto';
import type { RequestTenantContext } from '../../../common/tenant/tenant-context.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly iamRepository: IamRepository,
    private readonly jwtTokenService: JwtTokenService,
    private readonly auditService: AuditService,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async login(dto: LoginDto, meta?: { ipAddress?: string; userAgent?: string }) {
    const user = await this.iamRepository.findUserByEmail(dto.email);
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordHash = this.jwtTokenService.hashPassword(dto.password);
    if (passwordHash !== user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tenant = await this.iamRepository.findTenantBySlug(dto.tenantSlug ?? 'default');
    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    const context: RequestTenantContext = {
      tenantId: tenant.id,
      userId: user.id,
      email: user.email,
    };

    const membership = await this.iamRepository.findMembershipInTenant(context);
    if (!membership) {
      throw new UnauthorizedException('User is not a member of this tenant');
    }

    const accessToken = this.jwtTokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      tenantId: tenant.id,
    });

    const refresh = this.jwtTokenService.createRefreshToken(user.id, tenant.id);
    await this.iamRepository.createSession(
      context,
      refresh.hash,
      this.jwtTokenService.getRefreshExpiresAt(),
    );

    await this.auditService.record(context, {
      action: 'auth.login',
      entityType: 'user',
      entityId: user.id,
      payload: { email: user.email },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    this.eventPublisher.publish(
      createUserLoggedInEvent({
        tenantId: tenant.id,
        actorId: user.id,
        userId: user.id,
        email: user.email,
      }),
    );

    return {
      accessToken,
      refreshToken: refresh.token,
      tokenType: 'Bearer',
      tenantId: tenant.id,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async refresh(dto: RefreshDto) {
    let parsed: { userId: string; tenantId: string };
    try {
      parsed = this.jwtTokenService.parseRefreshToken(dto.refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const context: RequestTenantContext = {
      userId: parsed.userId,
      tenantId: parsed.tenantId,
      email: '',
    };

    const session = await this.iamRepository.findSessionByRefreshHash(
      context,
      this.jwtTokenService.hashToken(dto.refreshToken),
    );

    if (!session?.user) {
      throw new UnauthorizedException('Refresh session not found');
    }

    const accessToken = this.jwtTokenService.signAccessToken({
      sub: session.user.id,
      email: session.user.email,
      tenantId: parsed.tenantId,
    });

    return {
      accessToken,
      refreshToken: dto.refreshToken,
      tokenType: 'Bearer',
      tenantId: parsed.tenantId,
    };
  }
}
