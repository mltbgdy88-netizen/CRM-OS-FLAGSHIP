# 00 Cursor Sprint-04 Hard Guard

Source Status: SPRINT_04_ORCHESTRATION_ACTIVE_v1.1

## Active Sprint

Only Sprint-04 Customer 360 orchestration and approved slices are active.

Sprint-01, Sprint-02, and Sprint-03 are complete on `main` @ `92595b0` (tag `sprint-03-full-pass`).
Do not regress bootstrap, IAM, or Customer Core scope.

## Before Product Code (Phase 1+)

Each implementation slice must start with a plan and stop for approval unless the
active task explicitly authorizes coding.

## Sprint-02 / Sprint-03 Preservation (Non-Negotiable)

```text
- packages/database/migrations/002_iam/** — frozen; no edits
- packages/database/migrations/003_crm/** — frozen; no edits
- Sprint-03 four customer endpoints — frozen semantics (see API lock)
- login / refresh / PermissionGuard / withTenantContext — unchanged
- customer_notes, customer_files — use existing tables; no duplicate entities
```

Issue #5 (JWT production hardening) is backlog only — separate chore, not Sprint-04.

## Migration Band Lock

```text
Sprint-04 band: 003_crm_360 (CRM sub-band; new tables only)
Reserved:      004_lead (Sprint-05 Lead — do not use for Sprint-04)
```

## API Boundary Lock

Sprint-03 (frozen):

```text
GET  /api/v1/customers
POST /api/v1/customers
GET  /api/v1/customers/{id}      ← basic detail + related read aggregation
PATCH /api/v1/customers/{id}
```

Sprint-04 (additive only):

```text
GET  /api/v1/customers/{id}/360      ← enriched 360 insights payload
GET  /api/v1/customers/{id}/timeline ← paginated timeline events
```

Optional read export behind `customer.export` — document in OpenAPI if implemented;
no binary file export, no upload endpoints.

## Entity Scope Lock

New tenant-owned tables (003_crm_360):

```text
customer_timeline_events
customer_scores
customer_risk_scores
customer_lifetime_values
```

Existing (read-only / metadata — no schema changes in 003_crm):

```text
customers, customer_contacts, customer_addresses, customer_tags
customer_notes  ← canonical notes; do NOT add parallel comments table
customer_files  ← metadata only; no upload/storage/CDN/signed URLs
```

## Events Lock

```text
In scope:  CustomerUpdated (existing — emit on score/risk/LTV writes if applicable)
Deferred:  CustomerMerged — no merge API in Sprint-04; register in docs only as future
```

## Sprint-04 Allowed (when slice is authorized)

```text
- Phase 0 orchestration only (current phase)
- Phase 1: 003_crm_360 migration + RLS + seeds + CRM 360 RLS tests
- Phase 2: Customer 360 backend — 360 + timeline read APIs
- Phase 3: functional UI proof (timeline + 360 views); no visual redesign
- customer.timeline.read, customer.export permissions (append)
- OpenAPI, audit, tests, gate reports
```

## Sprint-04 Forbidden

```text
- Sprint-05 Lead, pipeline, opportunity, quote, order, inventory, finance
- RabbitMQ, AI Gateway, workflow engine
- IAM Frontend Slice B
- DELETE customer; related-entity CRUD
- File upload, object storage, CDN, signed URLs, binary handling
- Final AppShell, dashboard design, design system, visual polish
- Redesign of Sprint-03 customer list/detail/login screens
- CustomerMerged event emission without merge API
- New comments table duplicating customer_notes
- Edits to 002_iam or 003_crm migration SQL
- Breaking changes to Sprint-03 customer API responses or routes
```

## UI Policy (Domain Sprint)

See `docs/DECISIONS.md` (2026-06-22). Functional proof only — minimum routes and states.

## Verify Gate

`sprint:04:verify` is **planned** in root `package.json` (baseline chains `sprint:03:verify`).
CI wiring is **Phase 4 DevOps only**.
