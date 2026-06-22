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
  permissionCustomerRead: '30000000-0000-4000-8000-000000000001',
  permissionCustomerCreate: '30000000-0000-4000-8000-000000000002',
  permissionCustomerUpdate: '30000000-0000-4000-8000-000000000003',
  permissionCustomerDelete: '30000000-0000-4000-8000-000000000004',
  customerDefault: '40000000-0000-4000-8000-000000000001',
  customerTenantB: '40000000-0000-4000-8000-000000000002',
  noteDefault: '41000000-0000-4000-8000-000000000001',
  noteTenantB: '41000000-0000-4000-8000-000000000002',
  fileDefault: '42000000-0000-4000-8000-000000000001',
  fileTenantB: '42000000-0000-4000-8000-000000000002',
  timelineEventDefault: '43000000-0000-4000-8000-000000000001',
  timelineEventTenantB: '43000000-0000-4000-8000-000000000002',
  scoreDefault: '44000000-0000-4000-8000-000000000001',
  scoreTenantB: '44000000-0000-4000-8000-000000000002',
  riskScoreDefault: '45000000-0000-4000-8000-000000000001',
  riskScoreTenantB: '45000000-0000-4000-8000-000000000002',
  ltvDefault: '46000000-0000-4000-8000-000000000001',
  ltvTenantB: '46000000-0000-4000-8000-000000000002',
  permissionCustomerTimelineRead: '30000000-0000-4000-8000-000000000005',
  permissionCustomerExport: '30000000-0000-4000-8000-000000000006',
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

export const SEED_CUSTOMER_PERMISSIONS = [
  {
    id: SEED_IDS.permissionCustomerRead,
    code: 'customer.read',
    module: 'customer',
    description: 'Read customers and related aggregation data',
  },
  {
    id: SEED_IDS.permissionCustomerCreate,
    code: 'customer.create',
    module: 'customer',
    description: 'Create customers',
  },
  {
    id: SEED_IDS.permissionCustomerUpdate,
    code: 'customer.update',
    module: 'customer',
    description: 'Update customers',
  },
  {
    id: SEED_IDS.permissionCustomerDelete,
    code: 'customer.delete',
    module: 'customer',
    description: 'Soft-delete customers',
  },
] as const;

export const SEED_CUSTOMER_360_PERMISSIONS = [
  {
    id: SEED_IDS.permissionCustomerTimelineRead,
    code: 'customer.timeline.read',
    module: 'customer',
    description: 'Read customer timeline events',
  },
  {
    id: SEED_IDS.permissionCustomerExport,
    code: 'customer.export',
    module: 'customer',
    description: 'Export customer 360 data',
  },
] as const;

/** Local dev only — not a production secret. */
export const SEED_ADMIN_PASSWORD = 'Admin123!';
