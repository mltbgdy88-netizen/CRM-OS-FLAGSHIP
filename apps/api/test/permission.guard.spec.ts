import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS } from '@crm-os/permissions';
import { PermissionGuard } from '../src/common/auth/auth.guards';
import { PERMISSIONS_KEY } from '../src/common/auth/require-permissions.decorator';
import { JWT_PAYLOAD_KEY, TENANT_CONTEXT_KEY } from '../src/common/tenant/tenant-context.types';
import type { PermissionService } from '../src/modules/iam/services/permission.service';

describe('PermissionGuard', () => {
  const reflector = new Reflector();

  function createGuard(hasPermissions: boolean): PermissionGuard {
    const permissionService = {
      hasPermissions: jest.fn().mockResolvedValue(hasPermissions),
    } as unknown as PermissionService;
    return new PermissionGuard(reflector, permissionService);
  }

  function mockContext(required?: string[], includeJwt = true) {
    const handler = () => undefined;
    if (required) {
      Reflect.defineMetadata(PERMISSIONS_KEY, required, handler);
    }

    const request: Record<string, unknown> = {
      [TENANT_CONTEXT_KEY]: {
        userId: 'user-1',
        tenantId: 'tenant-1',
        email: 'admin@default.local',
      },
    };

    if (includeJwt) {
      request[JWT_PAYLOAD_KEY] = {
        sub: 'user-1',
        email: 'admin@default.local',
        tenantId: 'tenant-1',
      };
    }

    return {
      getHandler: () => handler,
      getClass: () => class TestController {},
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    };
  }

  it('returns 401 when JWT payload is missing', async () => {
    const guard = createGuard(true);
    await expect(
      guard.canActivate(mockContext([PERMISSIONS.USER_MANAGE], false) as never),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('allows access when required permissions are granted', async () => {
    const guard = createGuard(true);
    await expect(
      guard.canActivate(mockContext([PERMISSIONS.USER_MANAGE]) as never),
    ).resolves.toBe(true);
  });

  it('returns 403 when permissions are missing', async () => {
    const guard = createGuard(false);
    await expect(
      guard.canActivate(mockContext([PERMISSIONS.ROLE_MANAGE]) as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows access when no permissions metadata is set', async () => {
    const guard = createGuard(false);
    await expect(guard.canActivate(mockContext() as never)).resolves.toBe(true);
  });
});
