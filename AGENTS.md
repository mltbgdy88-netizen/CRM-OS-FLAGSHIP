# CRM OS Agent Operating Manual v9

## Mission

Build CRM OS using spec-driven, test-first, tenant-safe and permission-aware development.

## Active Sprint

**Sprint-04 — Customer 360** (Phase 0.2 orchestration active)

Active guard: `.cursor/rules/00-sprint-04-hard-guard.md`

Read before any Phase 1+ coding:

- `docs/sprints/sprint-04.md`
- `specs/sprints/sprint-04-customer-360.yaml`
- `docs/DECISIONS.md`
- `.ai/orchestration/sprint-04-handoff-order.md`
- `.ai/orchestration/sprint-04-branch-plan.md`

## Sprint-02 / Sprint-03 Preservation

Sprint-02 complete (`sprint-02-full-pass`). Sprint-03 complete (`main` @ `92595b0`, tag `sprint-03-full-pass`).

Do **not** modify `002_iam`, `003_crm`, login/refresh semantics, PermissionGuard behavior, or Sprint-03 four customer endpoints.

## Domain Sprint Frontend Policy (Sprint-04+)

Functional proof only — see `docs/DECISIONS.md` (2026-06-22).

- Minimum routes to verify APIs; required UI states (loading, empty, error, permission).
- Simple styling; reuse existing minimal AppShell — no redesign.
- **Defer:** final AppShell, navigation, dashboard, design system, tokens, visual polish.
- **Priority:** database, RLS, permissions, backend APIs, tests, CI, domain correctness.

## Sprint-04 Customer 360 Locks

Migration band: **`003_crm_360`** (`004_lead` reserved for Sprint-05).

```text
NEW tables:
  customer_timeline_events, customer_scores, customer_risk_scores, customer_lifetime_values

FROZEN (003_crm):
  customers, customer_contacts, customer_addresses, customer_tags, customer_notes, customer_files
```

API — Sprint-03 frozen:

```text
GET  /api/v1/customers
POST /api/v1/customers
GET  /api/v1/customers/{id}
PATCH /api/v1/customers/{id}
```

API — Sprint-04 additive:

```text
GET  /api/v1/customers/{id}/360
GET  /api/v1/customers/{id}/timeline
```

## Required Reading Before Coding

1. `MASTER-SOURCE-OF-TRUTH-v9.md`
2. `.cursor/rules/*` (including `00-sprint-04-hard-guard.md`)
3. Active `docs/sprints/sprint-04.md`
4. Active `specs/sprints/sprint-04-customer-360.yaml`
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
- Do not modify frozen migration bands or Sprint-03 customer API contracts.

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
- Sprint-02/03 IAM or customer API regression
- File upload/storage/CDN in Sprint-04
- Final visual UI / AppShell redesign
- CustomerMerged without merge API
- Use of `004_lead` band before Sprint-05

## Sprint Status

| Sprint | Status |
|--------|--------|
| Sprint-01 Repository Bootstrap | COMPLETE |
| Sprint-02 Auth + Tenant + IAM | COMPLETE (`sprint-02-full-pass`) |
| Sprint-03 Customer Core | COMPLETE (`sprint-03-full-pass`) |
| Sprint-04 Customer 360 | ORCHESTRATION ACTIVE (Phase 0.2) |
