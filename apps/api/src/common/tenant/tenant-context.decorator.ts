import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestTenantContext } from './tenant-context.types';
import { TENANT_CONTEXT_KEY } from './tenant-context.types';

export const TenantContextParam = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestTenantContext => {
    const request = ctx.switchToHttp().getRequest<{ [TENANT_CONTEXT_KEY]?: RequestTenantContext }>();
    const tenantContext = request[TENANT_CONTEXT_KEY];
    if (!tenantContext) {
      throw new Error('Tenant context is not available on this request');
    }
    return tenantContext;
  },
);
