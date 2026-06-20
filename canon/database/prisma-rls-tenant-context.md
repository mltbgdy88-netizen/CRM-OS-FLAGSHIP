# Prisma + PostgreSQL RLS Tenant Context Canon

Source Status: CANON_FIXED_FOR_CURSOR_READY_v1.1

## Decision

PostgreSQL RLS remains mandatory for tenant-owned tables.

When Prisma is used, every tenant-scoped database operation must run through a tenant-aware repository/service boundary.

## Mandatory Rule

Every tenant-scoped Prisma operation must run inside a transaction that sets tenant context before any tenant-owned query:

```sql
SELECT set_config('app.tenant_id', $1, true);
SELECT set_config('app.user_id', $2, true);
```

Equivalent `SET LOCAL` behavior is required.

## Forbidden

```text
- Controllers must not access Prisma directly.
- Tenant-owned queries must not run without tenant context.
- Application database role must not have BYPASSRLS.
- RLS must not be treated as optional.
```

## RLS Hardening Rules

```text
- Enable RLS on tenant-owned tables.
- Use FORCE ROW LEVEL SECURITY where appropriate.
- Policies must fail closed when tenant context is missing.
- Cross-tenant isolation tests are mandatory.
- Migration smoke tests must verify RLS is enabled.
```

## Sprint Boundary

Sprint-01 creates only database package scaffolding.

Actual tenant tables, audit tables, and RLS proof are deferred to Sprint-02.
