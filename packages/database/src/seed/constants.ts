/**
 * Deterministic Sprint-02 IAM seed identifiers.
 * Fixed UUIDs keep local dev, tests, and handoff docs stable.
 */
export const SEED_IDS = {
  tenantDefault: '11111111-1111-4111-8111-111111111111',
  tenantB: '22222222-2222-4222-8222-222222222222',
  userAdmin: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  userMemberB: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  memberAdmin: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  memberB: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  roleAdmin: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  roleTenantB: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
  permissionAuthLogin: '10000000-0000-4000-8000-000000000001',
  permissionTenantManage: '10000000-0000-4000-8000-000000000002',
  permissionUserManage: '10000000-0000-4000-8000-000000000003',
  permissionRoleManage: '10000000-0000-4000-8000-000000000004',
  auditDefault: '20000000-0000-4000-8000-000000000001',
  auditTenantB: '20000000-0000-4000-8000-000000000002',
} as const;

export const SEED_PERMISSIONS = [
  {
    id: SEED_IDS.permissionAuthLogin,
    code: 'auth.login',
    module: 'auth',
    description: 'Authenticate and establish session',
  },
  {
    id: SEED_IDS.permissionTenantManage,
    code: 'tenant.manage',
    module: 'tenant',
    description: 'Manage tenant/workspace settings',
  },
  {
    id: SEED_IDS.permissionUserManage,
    code: 'user.manage',
    module: 'user',
    description: 'Manage users and memberships',
  },
  {
    id: SEED_IDS.permissionRoleManage,
    code: 'role.manage',
    module: 'role',
    description: 'Manage roles and permission bindings',
  },
] as const;

/** Local dev only — not a production secret. */
export const SEED_ADMIN_PASSWORD = 'Admin123!';
