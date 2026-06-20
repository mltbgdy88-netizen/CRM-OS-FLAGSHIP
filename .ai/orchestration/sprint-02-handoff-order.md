# Sprint-02 Agent Handoff Order

Source Status: SPRINT_02_ORCHESTRATION_ACTIVE_v1.1

## Rule

No product code in Phase 0. Phase 1 starts only after this document and branch plan
are merged into `agent/sprint-02-auth-tenant-iam`.

## Handoff Chain

```text
1. Architect        → orchestration activation complete (Phase 0.2)
2. Database Agent   → 002_iam schema, RLS, seeds, RLS proof tests (Phase 1)
3. Backend Agent    → IAM module, auth, guards, audit, events, API tests (Phase 2)
4. Documentation    → OpenAPI + permission/event registry (parallel after API freeze)
5. Frontend Agent   → Slice A login only (Phase 3A)
6. QA Agent         → full gate matrix (Phase 4)
7. Security Agent   → security-gates.yaml checklist (Phase 4)
8. Reviewer Agent   → PR merge decision (Phase 4)
9. Release Agent    → Sprint-02 acceptance on main (Phase 4)
10. DevOps Agent    → CI migration check + green Actions (early scaffold + pre-merge)
```

## Required Handoff Payload

Each agent must leave:

```text
- files changed (paths)
- tests run + results
- gates passed / failed
- known gaps
- blockers for next agent
```

## Frontend Slice B Gate

Do **not** hand off to `sprint-02-frontend-iam-admin` until Backend + Database report:

```text
[ ] 002_iam migration applied locally
[ ] RLS cross-tenant tests pass (Tenant A ≠ Tenant B)
[ ] PermissionGuard integration tests pass
[ ] POST /auth/login POST /auth/refresh GET /users POST /roles pass integration tests
[ ] Security agent sign-off recorded
```

Until then, Frontend Slice B task status remains `disabled` in task-queue.yaml.

## IAM Entity Reminder

```text
users              → global identity
tenants            → tenant / workspace
tenant_members     → membership
roles              → tenant-owned (RLS)
permissions        → global registry
role_permissions   → mapping
member_roles       → mapping
audit_logs         → tenant-owned (RLS)
sessions/devices   → user-owned; active tenant context on use
```

## Queue Runtime

Redis + BullMQ only. RabbitMQ deferred.

## DevOps CI gate (TODO — before PR-final)

RLS cross-tenant proof must run against **real PostgreSQL** in CI. Do not treat skipped RLS tests in generic `pnpm test` as Sprint-02 acceptance.

```bash
pnpm db:migrate
pnpm db:seed
pnpm db:test:rls
```

Wire the above in GitHub Actions with a PostgreSQL service before merging `agent/sprint-02-auth-tenant-iam` → `main`. Root placeholder: `pnpm db:migrate:check`.
