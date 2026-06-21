import type { TenantContext as DbTenantContext } from '@crm-os/database';

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
}

export interface RequestTenantContext extends DbTenantContext {
  email: string;
}

export const TENANT_CONTEXT_KEY = 'tenantContext';
export const JWT_PAYLOAD_KEY = 'jwtPayload';
