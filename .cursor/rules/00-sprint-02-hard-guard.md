# 00 Cursor Sprint-02 Hard Guard

Source Status: SPRINT_02_COMPLETE_SUPERSEDED_v1.1

> **Status: COMPLETE / SUPERSEDED**
>
> Sprint-02 merged to `main` @ `c6657a6`, tag `sprint-02-full-pass`.
> Active guard: `.cursor/rules/00-sprint-03-hard-guard.md`
>
> This file is retained for historical reference. Do not re-activate Sprint-02
> orchestration tasks. Preserve Sprint-02 IAM behavior — see Sprint-03 guard.

## Active Sprint (Historical)

Sprint-02 Auth + Tenant + IAM — **COMPLETE**.

Sprint-01 is complete. Do not regress bootstrap scope.

## IAM Data Ownership (Canonical — preserved in production)

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

## Sprint-02 Delivered Scope (frozen)

```text
- 002_iam migration band + RLS + seeds
- IAM backend: auth login/refresh, users, roles, guards, audit, events
- Frontend Slice A: login + auth wiring + UI states
- sprint:02:verify green; CI PostgreSQL RLS gate on main
```

## Sprint-02 Forbidden (still applies as regression guard)

```text
- Modifying 002_iam migration SQL after Sprint-02 acceptance
- Changing login/refresh/PermissionGuard semantics without explicit sprint
- Sprint-03+ CRM modules without Sprint-03 orchestration
- Frontend Slice B until explicitly scheduled in a future sprint
- RabbitMQ, AI Gateway, workflow engine
- Production secrets in repo
- BYPASSRLS or tenant context bypass
```

## Queue Decision

Redis + BullMQ is canon for queue/runtime planning. RabbitMQ remains deferred.
