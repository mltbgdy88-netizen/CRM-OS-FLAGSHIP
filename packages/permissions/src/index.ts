/** Sprint-02 IAM permission registry (global codes). */
export const PERMISSIONS = {
  AUTH_LOGIN: 'auth.login',
  TENANT_MANAGE: 'tenant.manage',
  USER_MANAGE: 'user.manage',
  ROLE_MANAGE: 'role.manage',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: PermissionCode[] = Object.values(PERMISSIONS);
