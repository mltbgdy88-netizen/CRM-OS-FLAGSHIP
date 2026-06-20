# CRM OS Agent Operating Manual v8

## Mission

Build CRM OS using spec-driven, test-first, tenant-safe and permission-aware development.

## Active Sprint

**Sprint-02 — Auth + Tenant + IAM** (Phase 0.2 orchestration active)

Active guard: `.cursor/rules/00-sprint-02-hard-guard.md`

Read before any Phase 1+ coding:

- `docs/sprints/sprint-02.md`
- `specs/sprints/sprint-02-auth-tenant-iam.yaml`
- `.ai/orchestration/sprint-02-handoff-order.md`
- `.ai/orchestration/sprint-02-branch-plan.md`

## IAM Data Ownership (Sprint-02)

```text
users              = global identity
tenants            = tenant / business account (workspace)
tenant_members     = user-to-tenant membership
roles              = tenant-owned
permissions        = global registry
role_permissions   = role-to-permission mapping
member_roles       = membership-to-role mapping
audit_logs         = tenant-owned
sessions           = user-owned; active tenant context where needed
devices            = user-owned; active tenant context where needed
```

## Required Reading Before Coding

1. `MASTER-SOURCE-OF-TRUTH-v9.md`
2. `.cursor/rules/*` (including `00-sprint-02-hard-guard.md`)
3. Active `docs/sprints/sprint-02.md`
4. Active `specs/sprints/sprint-02-auth-tenant-iam.yaml`
5. Relevant canon: `/canon/database`, `/canon/security-compliance`, `/canon/api`
6. `.ai/agents/*` and `.ai/orchestration/*`

## Non-Negotiable Rules

- Tenant isolation is mandatory.
- PostgreSQL RLS is mandatory for tenant-owned tables.
- PermissionGuard is mandatory for protected endpoints.
- Audit log is mandatory for critical actions.
- Domain events are mandatory for critical business transitions.
- Tests are mandatory.
- No secrets in code, logs, commits or images.
- No unrelated module changes.
- Queue runtime: Redis + BullMQ only; RabbitMQ deferred.

## Required Output Per Task

- Source code (when slice authorized)
- Migration when database changes
- Tests
- OpenAPI or contract update when API changes
- Permission and event registry update
- Documentation update
- Review notes

## Merge Blockers

- Cross-tenant access
- Missing permission guard
- Missing RLS on tenant-owned tables
- Unsafe migration
- Missing audit trail
- Broken tests
- Secret leakage
- Unreviewed AI data mutation
- Frontend Slice B before backend IAM + RLS proof passes

## Sprint Status

| Sprint | Status |
|--------|--------|
| Sprint-01 Repository Bootstrap | COMPLETE |
| Sprint-02 Auth + Tenant + IAM | ORCHESTRATION ACTIVE (Phase 0.2) |
