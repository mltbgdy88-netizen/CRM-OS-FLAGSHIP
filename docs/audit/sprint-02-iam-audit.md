# Sprint-02 IAM Audit Log

Audit rows are written to tenant-owned `audit_logs` via `AuditService` → `IamRepository.writeAuditLog`.

## Tenant context requirement

Every audit write **must** run inside `withTenantContext` so PostgreSQL RLS scopes rows to the active tenant:

```text
AuditService.record(context, ...)
  → IamRepository.writeAuditLog(context, ...)
    → withTenantContext(prisma, context, tx => tx.auditLog.create(...))
```

`context` requires:

| Field | Source |
|-------|--------|
| `tenantId` | Login tenant or JWT `tenantId` |
| `userId` | Authenticated user (`sub`) |
| `email` | User email when available |

Controllers never write audit logs directly and never call Prisma.

## Recorded actions (Sprint-02)

### auth.login

| Field | Value |
|-------|-------|
| Trigger | Successful login |
| `action` | `auth.login` |
| `entityType` | `user` |
| `entityId` | User ID |
| `payload` | `{ email }` |
| Optional | `ipAddress`, `userAgent` from request |

### role.created

| Field | Value |
|-------|-------|
| Trigger | Successful role create |
| `action` | `role.created` |
| `entityType` | `role` |
| `entityId` | New role ID |
| `payload` | `{ code, name }` |

## withTenantContext requirement

All tenant-scoped persistence (audit, sessions, roles, tenant members, permission resolution) uses `@crm-os/database` helper:

```typescript
await withTenantContext(prisma, { tenantId, userId }, async (tx) => {
  // RLS session vars: app.tenant_id, app.user_id
});
```

Runtime DB connection uses `DATABASE_APP_URL` (`crmos_app`, `NOBYPASSRLS`).

Global tables (`users`, `permissions`, `tenants` lookup by slug/email) may be read outside tenant wrapper; **writes to tenant-owned tables must not bypass** `withTenantContext`.

## Not audited in Sprint-02

- Token refresh (no audit row on refresh)
- Failed login attempts (no audit row; returns 401)
- Health checks

Future phases may extend audit coverage per security-gates checklist.
