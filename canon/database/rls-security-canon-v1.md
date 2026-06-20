# CRM OS RLS Security Canon v1

## Principle

PostgreSQL RLS is mandatory for tenant-owned business tables.

## Required Policy

```sql
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_<table_name>
ON <table_name>
USING (
  tenant_id = current_setting('app.tenant_id')::uuid
);
```

## Backend Contract

Before any tenant-scoped query:

```sql
SET app.tenant_id = '<tenant_uuid>';
SET app.user_id = '<user_uuid>';
```

## RLS Test Requirements

```text
[ ] Tenant A cannot read Tenant B records.
[ ] Tenant A cannot update Tenant B records.
[ ] Tenant A cannot delete Tenant B records.
[ ] Missing app.tenant_id fails closed.
[ ] Background workers set tenant context.
[ ] Admin operations are explicit and audited.
```

## Forbidden

```text
- Querying tenant-owned tables without tenant context.
- Relying only on application filters.
- Creating tenant-owned tables without RLS.
- Using bypass roles in application runtime.
```
