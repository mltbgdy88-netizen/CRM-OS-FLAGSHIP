import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import type { RequestTenantContext } from './tenant-context.types';
import { TENANT_CONTEXT_KEY, JWT_PAYLOAD_KEY } from './tenant-context.types';
import type { JwtPayload } from './tenant-context.types';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      [JWT_PAYLOAD_KEY]?: JwtPayload;
      [TENANT_CONTEXT_KEY]?: RequestTenantContext;
    }>();

    const jwtPayload = request[JWT_PAYLOAD_KEY];
    if (jwtPayload) {
      request[TENANT_CONTEXT_KEY] = {
        tenantId: jwtPayload.tenantId,
        userId: jwtPayload.sub,
        email: jwtPayload.email,
      };
    } else if (this.requiresTenantContext(context)) {
      throw new UnauthorizedException('Tenant context is required');
    }

    return next.handle();
  }

  private requiresTenantContext(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const controller = context.getClass();
    const metadata = Reflect.getMetadata('requireTenantContext', handler)
      ?? Reflect.getMetadata('requireTenantContext', controller);
    return metadata === true;
  }
}

export const RequireTenantContext = (): MethodDecorator & ClassDecorator =>
  ((target: object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata('requireTenantContext', true, descriptor.value as object);
      return descriptor;
    }
    Reflect.defineMetadata('requireTenantContext', true, target);
    return target;
  }) as MethodDecorator & ClassDecorator;
