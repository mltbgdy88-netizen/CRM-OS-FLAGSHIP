# CRM OS Agent Operating Manual v8

## Mission

Build CRM OS using spec-driven, test-first, tenant-safe and permission-aware development.

## Active Sprint

**Sprint-03 — Customer Core** (Phase 0.2 orchestration active)

Active guard: `.cursor/rules/00-sprint-03-hard-guard.md`

Read before any Phase 1+ coding:

- `docs/sprints/sprint-03.md`
- `specs/sprints/sprint-03-customer-core.yaml`
- `.ai/orchestration/sprint-03-handoff-order.md`
- `.ai/orchestration/sprint-03-branch-plan.md`

## Sprint-02 Preservation

Sprint-02 is complete (`main` @ `c6657a6`, tag `sprint-02-full-pass`). Do **not**
modify `002_iam`, login/refresh semantics, or PermissionGuard behavior in Sprint-03.

## CRM Data Ownership (Sprint-03)

```text
customers            = tenant-owned (RLS)
customer_contacts    = read aggregation in customer detail
customer_addresses   = read aggregation in customer detail
customer_tags        = read aggregation in customer detail
customer_notes       = read aggregation in customer detail
customer_files       = metadata only; no upload/storage/CDN
```

Customer API lock — four endpoints only:

```text
GET  /api/v1/customers
POST /api/v1/customers
GET  /api/v1/customers/{id}
PATCH /api/v1/customers/{id}
```

## Required Reading Before Coding

1. `MASTER-SOURCE-OF-TRUTH-v9.md`
2. `.cursor/rules/*` (including `00-sprint-03-hard-guard.md`)
3. Active `docs/sprints/sprint-03.md`
4. Active `specs/sprints/sprint-03-customer-core.yaml`
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
- Do not modify Sprint-02 IAM migration or auth behavior.

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
- Sprint-02 IAM regression
- Customer API beyond the four-endpoint lock
- File upload/storage/CDN in Sprint-03
- Separate related-entity CRUD endpoints without explicit approval

## Sprint Status

| Sprint | Status |
|--------|--------|
| Sprint-01 Repository Bootstrap | COMPLETE |
| Sprint-02 Auth + Tenant + IAM | COMPLETE (`sprint-02-full-pass`) |
| Sprint-03 Customer Core | ORCHESTRATION ACTIVE (Phase 0.2) |
