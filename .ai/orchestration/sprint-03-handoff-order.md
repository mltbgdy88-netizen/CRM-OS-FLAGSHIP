# Sprint-03 Agent Handoff Order

Source Status: SPRINT_03_ORCHESTRATION_ACTIVE_v1.1

## Rule

No product code in Phase 0. Phase 1 starts only after this document and branch plan
are merged into `agent/sprint-03-customer-core`.

Sprint-02 IAM behavior is frozen. Do not modify `002_iam`, login/refresh, or
PermissionGuard semantics.

## Handoff Chain

```text
1. Architect        → orchestration activation complete (Phase 0.2)
2. Database Agent   → 003_crm schema, RLS, seeds, CRM RLS proof tests (Phase 1)
3. Backend Agent    → Customer module, 4 API endpoints, audit, events (Phase 2)
4. Documentation    → OpenAPI + permission/event registry (parallel after API freeze)
5. Frontend Agent   → minimal AppShell + customer list/detail UI (Phase 3)
6. QA Agent         → full gate matrix (Phase 4)
7. Security Agent   → security-gates.yaml checklist (Phase 4)
8. DevOps Agent     → extend sprint:03:verify + wire CI job (Phase 4)
9. Reviewer Agent   → PR merge decision (Phase 4)
10. Release Agent   → Sprint-03 acceptance on main (Phase 4)
```

## Required Handoff Payload

Each agent must leave:

```text
- files changed (paths)
- tests run + results
- gates passed / failed
- known gaps
- blockers for next agent
- confirmation Sprint-02 IAM untouched (when applicable)
```

## Customer API Lock

Only these endpoints in Sprint-03:

```text
GET  /api/v1/customers
POST /api/v1/customers
GET  /api/v1/customers/{id}
PATCH /api/v1/customers/{id}
```

Related contacts, addresses, tags, notes, and file **metadata** appear as read
aggregation in customer detail / basic 360. No separate CRUD routes unless explicitly
approved in a later orchestration update.

## CRM Entity Reminder

```text
customers            → tenant-owned (RLS)
customer_contacts    → tenant-owned; read aggregation only in Sprint-03
customer_addresses   → tenant-owned; read aggregation only in Sprint-03
customer_tags        → tenant-owned; read aggregation only in Sprint-03
customer_notes       → tenant-owned; read aggregation only in Sprint-03
customer_files       → metadata only; no upload/storage/CDN
```

## Sprint-02 Regression Guard

Before any Phase 1+ handoff, confirm:

```text
[ ] 002_iam migration SQL unchanged
[ ] pnpm sprint:02:verify still passes
[ ] login / refresh behavior unchanged
[ ] PermissionGuard integration tests unchanged
[ ] RLS cross-tenant IAM tests still pass
```

## Verify Gate Planning

```bash
# Planned root script (Phase 0.2 — baseline only):
pnpm sprint:03:verify

# Phase 4 DevOps extends with:
# - CRM RLS cross-tenant proof
# - Customer API integration + PermissionGuard tests
# - Frontend customer state tests
# - CI job sprint-03-verify in .github/workflows/ci.yml
```

`sprint:03:verify` is **not** CI-required until DevOps Phase 4 task completes.
Until then, `pnpm sprint:02:verify` remains the CI acceptance bar on integration branch.

## Queue Runtime

Redis + BullMQ only. RabbitMQ deferred.

## Out of Scope (Sprint-03)

```text
- Sprint-04+ (lead, pipeline, quote, order, inventory, finance)
- Frontend IAM Slice B
- File upload / object storage / CDN
- RabbitMQ, AI Gateway, workflow engine
- Issue #5 JWT production hardening (backlog)
```
