import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './require-permissions.decorator';
import type { PermissionCode } from '@crm-os/permissions';
import { JWT_PAYLOAD_KEY, TENANT_CONTEXT_KEY } from '../tenant/tenant-context.types';
import type { JwtPayload, RequestTenantContext } from '../tenant/tenant-context.types';
import { PermissionService } from '../../modules/iam/services/permission.service';
import { JwtTokenService } from '../../modules/iam/services/jwt-token.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      [JWT_PAYLOAD_KEY]?: JwtPayload;
    }>();

    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = header.slice('Bearer '.length);
    try {
      request[JWT_PAYLOAD_KEY] = this.jwtTokenService.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
    return true;
  }
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<PermissionCode[] | undefined>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      [JWT_PAYLOAD_KEY]?: JwtPayload;
      [TENANT_CONTEXT_KEY]?: RequestTenantContext;
    }>();

    const jwtPayload = request[JWT_PAYLOAD_KEY];
    if (!jwtPayload) {
      throw new UnauthorizedException('Authentication required');
    }

    const tenantContext: RequestTenantContext = request[TENANT_CONTEXT_KEY] ?? {
      tenantId: jwtPayload.tenantId,
      userId: jwtPayload.sub,
      email: jwtPayload.email,
    };

    const allowed = await this.permissionService.hasPermissions(tenantContext, required);
    if (!allowed) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
