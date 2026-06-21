# @crm-os/permissions

Sprint-02 global IAM permission registry.

## Registry

| Code | Constant |
|------|----------|
| `auth.login` | `PERMISSIONS.AUTH_LOGIN` |
| `tenant.manage` | `PERMISSIONS.TENANT_MANAGE` |
| `user.manage` | `PERMISSIONS.USER_MANAGE` |
| `role.manage` | `PERMISSIONS.ROLE_MANAGE` |

Permissions are **global** — not tenant-owned. Authorization is resolved per tenant via roles and `member_roles` under RLS.

## Usage

```typescript
import { PERMISSIONS, ALL_PERMISSIONS, type PermissionCode } from '@crm-os/permissions';
```

## Documentation

Full registry and guard semantics: `docs/security/sprint-02-permission-registry.md`
