# Sprint-04 Agent Handoff Order

Source Status: SPRINT_04_ORCHESTRATION_ACTIVE_v1.1

## Rule

No product code in Phase 0. Phase 1 starts only after this document and branch plan
are merged into `agent/sprint-04-customer-360`.

Sprint-02 IAM and Sprint-03 Customer Core behavior are frozen.

## Locked Decisions (Architect Phase 0.2)

| # | Decision |
|---|----------|
| 1 | Sprint-04 = **Customer 360** (not Lead) |
| 2 | Sprint-05 = **Lead** (`004_lead` band reserved) |
| 3 | Depends on Sprint-03 Customer Core @ `sprint-03-full-pass` |
| 4 | Migration band = **`003_crm_360`** (CRM sub-band; `003_crm` frozen) |
| 5 | API: Sprint-03 `GET /customers/{id}` = basic detail; Sprint-04 adds `/360` + `/timeline` |
| 6 | Notes: use **`customer_notes`**; no parallel `comments` table |
| 7 | Files: **`customer_files`** metadata only; no upload/storage/CDN |
| 8 | **`CustomerMerged`** deferred (future-only; no merge API in Sprint-04) |
| 9 | UI: **functional proof only** (`docs/DECISIONS.md`) |

## Handoff Chain

```text
1. Architect        → orchestration activation complete (Phase 0.2)
2. Database Agent   → 003_crm_360 schema, RLS, seeds, RLS proof (Phase 1)
3. Backend Agent    → 360 + timeline APIs, audit, events (Phase 2)
4. Documentation    → OpenAPI + permission/event registry (parallel after API freeze)
5. Frontend Agent   → functional 360/timeline UI proof (Phase 3)
6. QA Agent         → full gate matrix (Phase 4)
7. Security Agent   → security-gates checklist (Phase 4)
8. DevOps Agent     → extend sprint:04:verify + wire CI job (Phase 4)
9. Reviewer Agent   → PR merge decision (Phase 4)
10. Release Agent   → Sprint-04 acceptance + final PR to main (Phase 4)
```

## Required Handoff Payload

Each agent must leave:

```text
- files changed (paths)
- tests run + results
- gates passed / failed
- known gaps
- blockers for next agent
- confirmation Sprint-02/03 frozen paths untouched (when applicable)
```

## Customer API Boundary

Sprint-03 (frozen — do not modify routes or response contracts):

```text
GET  /api/v1/customers
POST /api/v1/customers
GET  /api/v1/customers/{id}
PATCH /api/v1/customers/{id}
```

Sprint-04 (additive):

```text
GET  /api/v1/customers/{id}/360
GET  /api/v1/customers/{id}/timeline
```

## CRM 360 Entity Reminder

```text
NEW (003_crm_360):
  customer_timeline_events, customer_scores, customer_risk_scores, customer_lifetime_values

EXISTING (003_crm — read/metadata only):
  customers, customer_contacts, customer_addresses, customer_tags, customer_notes, customer_files
```

## Sprint-02 / Sprint-03 Regression Guard

Before any Phase 1+ handoff, confirm:

```text
[ ] 002_iam and 003_crm migration SQL unchanged
[ ] pnpm sprint:03:verify still passes
[ ] Sprint-03 customer e2e tests unchanged
[ ] login / refresh behavior unchanged
[ ] RLS cross-tenant IAM + CRM tests still pass
```

## Verify Gate Planning

```bash
# Planned root script (Phase 0.2 — baseline only):
pnpm sprint:04:verify   # chains sprint:03:verify → sprint:02:verify

# Phase 4 DevOps extends with:
# - CRM 360 RLS cross-tenant proof
# - Customer 360 API integration + PermissionGuard tests
# - Frontend 360/timeline state tests
# - CI job sprint-04-verify in .github/workflows/ci.yml
```

## Out of Scope (Sprint-04)

```text
- Sprint-05+ (lead, pipeline, quote, order, inventory, finance)
- Frontend IAM Slice B
- File upload / object storage / CDN
- RabbitMQ, AI Gateway, workflow engine
- Final visual UI / AppShell / design system
- Issue #5 JWT hardening (separate chore)
- CustomerMerged event emission
```
