# Tenant Isolation Canon v1

## Model

CRM OS uses:

```text
Shared Database
+ tenant_id on business tables
+ PostgreSQL Row Level Security
+ request-scoped tenant context
```

## Required Fields

Every tenant-owned table:

```sql
id uuid primary key,
tenant_id uuid not null,
created_at timestamptz not null default now(),
created_by uuid,
updated_at timestamptz,
updated_by uuid,
deleted_at timestamptz,
deleted_by uuid,
version integer not null default 1
```

## RLS Standard

```sql
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_<table_name>
ON <table_name>
USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

## Backend Requirement

Every request must set:

```sql
SET app.tenant_id = '<tenant_id>';
SET app.user_id = '<user_id>';
```

## Test Requirements

- Tenant A cannot read Tenant B records.
- Tenant A cannot update Tenant B records.
- Tenant A cannot delete Tenant B records.
- Search, export, reports, webhooks, AI, and background jobs must preserve tenant scope.
