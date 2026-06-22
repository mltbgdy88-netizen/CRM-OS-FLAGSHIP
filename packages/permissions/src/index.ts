/** Sprint-02 IAM + Sprint-03 Customer permission registry (global codes). */
export const PERMISSIONS = {
  AUTH_LOGIN: 'auth.login',
  TENANT_MANAGE: 'tenant.manage',
  USER_MANAGE: 'user.manage',
  ROLE_MANAGE: 'role.manage',
  CUSTOMER_READ: 'customer.read',
  CUSTOMER_CREATE: 'customer.create',
  CUSTOMER_UPDATE: 'customer.update',
  CUSTOMER_DELETE: 'customer.delete',
  CUSTOMER_TIMELINE_READ: 'customer.timeline.read',
  CUSTOMER_EXPORT: 'customer.export',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: PermissionCode[] = Object.values(PERMISSIONS);
