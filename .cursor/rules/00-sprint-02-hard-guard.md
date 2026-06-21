# 00 Cursor Sprint-02 Hard Guard

Source Status: SPRINT_02_ORCHESTRATION_ACTIVE_v1.1

## Active Sprint

Only Sprint-02 Auth + Tenant + IAM orchestration and approved slices are active.

Sprint-01 is complete. Do not regress bootstrap scope.

## Before Product Code (Phase 1+)

Each implementation slice must start with a plan and stop for approval unless the
active task explicitly authorizes coding.

## IAM Data Ownership (Canonical)

```text
users              = global identity
tenants            = tenant / business account (workspace)
tenant_members     = user-to-tenant membership
roles              = tenant-owned
permissions        = global registry
role_permissions   = role-to-permission mapping
member_roles       = membership-to-role mapping
audit_logs         = tenant-owned
sessions           = user-owned; carries active tenant context where needed
devices            = user-owned; carries active tenant context where needed
```

RLS applies to tenant-owned tables. Global tables (`users`, `permissions`) use
application-level access rules; tenant-owned tables must fail closed without
`app.tenant_id`.

## Sprint-02 Allowed (when slice is authorized)

```text
- Phase 0 orchestration updates only (current phase)
- Phase 1: packages/database Prisma schema draft + 002_iam migration + RLS + seeds
- Phase 2: backend IAM module, tenant context, auth skeleton, guards, audit, events
- Phase 3 Frontend Slice A only: login + auth wiring + UI states
- OpenAPI, permission registry, event registry, tests for IAM scope
- CI migration check scaffolding (no product behavior yet in Phase 0)
```

## Sprint-02 Forbidden

```text
- Sprint-03+ CRM modules (customer, lead, quote, order, inventory, finance, etc.)
- Frontend Slice B (user admin, role matrix, session/device panel) until backend IAM + RLS proof passes
- AI Gateway, Ask CRM, workflow engine, generator runtime execution
- RabbitMQ service or wiring
- Production secrets in repo
- Prisma migrations before Phase 1 Database Agent task is explicitly started
- Application/product code during Phase 0 orchestration
```

## Queue Decision

Redis + BullMQ is canon for queue/runtime planning. RabbitMQ remains deferred.

## Prisma + RLS Decision

Tenant-scoped operations must run through tenant-aware repository boundaries with
transaction-local `app.tenant_id` / `app.user_id` context. No BYPASSRLS roles.

## Frontend Gating

Frontend Slice B is disabled until:

```text
[ ] 002_iam migration merged locally
[ ] RLS cross-tenant proof tests pass
[ ] Backend IAM endpoints + PermissionGuard integration tests pass
[ ] Security agent sign-off on IAM data plane
```
