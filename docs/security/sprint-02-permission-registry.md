# Sprint-02 IAM Permission Registry

Canonical source: `packages/permissions/src/index.ts`  
Database seed: `packages/database/src/seed/constants.ts` (`SEED_PERMISSIONS`)

Permissions are **global registry codes**. They are not tenant-owned. Tenant isolation for authorization is enforced via `member_roles` → `role_permissions` inside tenant RLS context.

## Registry

| Code | Constant | Module | Description | Used by (Sprint-02) |
|------|----------|--------|-------------|---------------------|
| `auth.login` | `PERMISSIONS.AUTH_LOGIN` | auth | Authenticate and establish session | Reserved; login route is public (no guard) |
| `tenant.manage` | `PERMISSIONS.TENANT_MANAGE` | tenant | Manage tenant/workspace settings | Seeded on `tenant_admin`; no dedicated endpoint yet |
| `user.manage` | `PERMISSIONS.USER_MANAGE` | user | Manage users and memberships | `GET /api/v1/users` |
| `role.manage` | `PERMISSIONS.ROLE_MANAGE` | role | Manage roles and permission bindings | `POST /api/v1/roles` |

## Guard semantics

Applied via `@RequirePermissions(...)` + `PermissionGuard`:

| Condition | HTTP status |
|-----------|-------------|
| Missing / invalid JWT | **401** Unauthorized |
| Valid JWT, insufficient permission | **403** Forbidden |
| Valid JWT with required permission(s) | Pass |

All required permissions on a route must be satisfied (AND semantics via `PermissionService.hasPermissions`).

## Seeded role bindings

**Default tenant (`default`):**

- Role `tenant_admin` → all four permissions
- Member `admin@default.local` → `tenant_admin`

**Tenant B (`tenant-b`):**

- Role `tenant_admin` exists but **no** `member_roles` for `member@tenant-b.local` in seed
- Used in tests to prove 403 on protected routes with valid JWT

## Frontend guidance

- Hide or disable UI actions when the user lacks the mapped permission (Slice B admin UI not started).
- Slice A login does not require permission checks beyond successful login response.
- Do not infer permissions client-side from role names; use future `/me/permissions` or equivalent when added.

## Package reference

```typescript
import { PERMISSIONS, ALL_PERMISSIONS, type PermissionCode } from '@crm-os/permissions';
```

See `packages/permissions/README.md`.
