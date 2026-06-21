import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../src/common/auth/auth.guards';
import type { JwtTokenService } from '../src/modules/iam/services/jwt-token.service';
import { JWT_PAYLOAD_KEY } from '../src/common/tenant/tenant-context.types';

describe('JwtAuthGuard', () => {
  function createGuard(verifyImpl: JwtTokenService['verifyAccessToken']): JwtAuthGuard {
    const jwtTokenService = { verifyAccessToken: verifyImpl } as JwtTokenService;
    return new JwtAuthGuard(jwtTokenService);
  }

  function mockContext(authHeader?: string) {
    const request: Record<string, unknown> = {
      headers: { authorization: authHeader },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    };
  }

  it('returns 401 when bearer token is missing', () => {
    const guard = createGuard(() => {
      throw new Error('should not verify');
    });
    expect(() => guard.canActivate(mockContext() as never)).toThrow(UnauthorizedException);
  });

  it('returns 401 when access token is invalid', () => {
    const guard = createGuard(() => {
      throw new Error('bad token');
    });
    expect(() =>
      guard.canActivate(mockContext('Bearer not-a-valid-jwt') as never),
    ).toThrow(UnauthorizedException);
  });

  it('allows access and attaches JWT payload when token is valid', () => {
    const payload = {
      sub: 'user-1',
      email: 'admin@default.local',
      tenantId: 'tenant-1',
    };
    const request: Record<string, unknown> = {
      headers: { authorization: 'Bearer valid-token' },
    };
    const guard = createGuard(() => payload);

    expect(
      guard.canActivate({
        switchToHttp: () => ({ getRequest: () => request }),
      } as never),
    ).toBe(true);
    expect(request[JWT_PAYLOAD_KEY]).toEqual(payload);
  });
});
