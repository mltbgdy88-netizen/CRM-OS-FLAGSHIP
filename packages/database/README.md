# @crm-os/database

Sprint-02 IAM database package: Prisma schema, `002_iam` migration band, PostgreSQL RLS, deterministic seeds, and tenant context helpers.

## Schema ownership (canonical)

| Table | Scope | `tenant_id` | RLS |
|-------|-------|-------------|-----|
| `users` | Global identity | **No** | No (app-level access rules) |
| `permissions` | Global registry | **No** | No (app-level access rules) |
| `tenants` | Workspace / business account | N/A (root entity) | No |
| `tenant_members` | User ↔ tenant membership | Yes | Yes |
| `roles` | Tenant-owned | Yes | Yes |
| `role_permissions` | Mapping (denormalized `tenant_id`) | Yes | Yes |
| `member_roles` | Mapping (denormalized `tenant_id`) | Yes | Yes |
| `audit_logs` | Tenant-owned | Yes | Yes |
| `sessions` | User-owned + optional active tenant | Optional `active_tenant_id` | Yes (user + tenant) |
| `devices` | User-owned + optional active tenant | Optional `active_tenant_id` | Yes (user + tenant) |

## Application DB role (`crmos_app`)

The `002_iam` migration creates `crmos_app` with password `crmos_app` for **DEV / LOCAL / CI proof only**.

- Role flags: `NOSUPERUSER` **`NOBYPASSRLS`** (RLS policies apply).
- **Production:** application DB roles must be provisioned by **infra / DevOps** (Terraform, cloud IAM, secrets manager). Do not rely on migration-created logins or hardcoded passwords in production.
- No production secrets belong in this repository.

See root `.env.example` for local connection defaults.

## Commands

```bash
pnpm db:migrate          # apply 002_iam (root alias)
pnpm db:seed             # deterministic IAM seed (root alias)
pnpm db:test:rls         # RLS proof gate — requires real PostgreSQL (root alias)

pnpm --filter @crm-os/database migrate
pnpm --filter @crm-os/database seed
pnpm --filter @crm-os/database test        # unit + RLS when DATABASE_URL set
pnpm --filter @crm-os/database test:rls    # RLS only; fails if DATABASE_URL unset
```

`DATABASE_URL` — migration/admin connection (see `.env.example`).  
`DATABASE_APP_URL` — optional override for RLS tests as `crmos_app` (defaults derived from `DATABASE_URL`).

## Sprint-02 DevOps CI gate (TODO — before PR-final / merge to main)

RLS cross-tenant proof **must not be silently skipped** in final Sprint-02 acceptance.

DevOps must wire GitHub Actions (or equivalent) with a **real PostgreSQL service** and run:

```bash
pnpm db:migrate
pnpm db:seed
pnpm db:test:rls
```

Until that CI job exists, run the same sequence locally before merging `agent/sprint-02-auth-tenant-iam` → `main`.

Root placeholder: `db:migrate:check` documents the pending CI wiring.
