# 00 Cursor Sprint-03 Hard Guard

Source Status: SPRINT_03_ORCHESTRATION_ACTIVE_v1.1

## Active Sprint

Only Sprint-03 Customer Core orchestration and approved slices are active.

Sprint-01 and Sprint-02 are complete. Do not regress bootstrap or IAM scope.

## Before Product Code (Phase 1+)

Each implementation slice must start with a plan and stop for approval unless the
active task explicitly authorizes coding.

## Sprint-02 Preservation (Non-Negotiable)

Do **not** modify Sprint-02 IAM behavior:

```text
- packages/database/migrations/002_iam/** — read-only; no edits
- login / refresh token semantics unchanged
- PermissionGuard semantics unchanged
- withTenantContext / RLS tenant isolation unchanged
- No BYPASSRLS roles; no tenant context bypass
```

Issue #5 (JWT production hardening) is backlog only — not in Sprint-03 scope.

## CRM Data Ownership (Sprint-03)

```text
customers            = tenant-owned (RLS)
customer_contacts    = tenant-owned (RLS); read aggregation in customer detail
customer_addresses   = tenant-owned (RLS); read aggregation in customer detail
customer_tags        = tenant-owned (RLS); read aggregation in customer detail
customer_notes       = tenant-owned (RLS); read aggregation in customer detail
customer_files       = tenant-owned metadata only (RLS); no upload/storage/CDN
```

Related entities are **read aggregation** inside customer detail / basic 360 only.
No separate related-entity CRUD API endpoints unless explicitly approved later.

## Sprint-03 Allowed (when slice is authorized)

```text
- Phase 0 orchestration updates only (current phase)
- Phase 1: packages/database Prisma schema + 003_crm migration band + RLS + seeds
- Phase 2: backend Customer module — 4 endpoints only (see API lock below)
- Phase 3: minimal AppShell + customer list/detail UI states
- OpenAPI, permission registry, event registry, tests for Customer Core scope
- customer.read / customer.create / customer.update / customer.delete permissions
- CustomerCreated / CustomerUpdated domain events
```

## Customer API Lock (Sprint-03)

Only these endpoints:

```text
GET  /api/v1/customers
POST /api/v1/customers
GET  /api/v1/customers/{id}
PATCH /api/v1/customers/{id}
```

Customer detail may aggregate related contacts, addresses, tags, notes, and file
metadata in the response. No standalone CRUD routes for those entities in Sprint-03.

## Sprint-03 Forbidden

```text
- Sprint-04+ modules (lead, pipeline, quote, order, inventory, finance, etc.)
- Frontend IAM Slice B (user admin, role matrix, session/device panel)
- File upload, object storage, CDN, or binary file handling
- Separate CRUD endpoints for contacts/addresses/tags/notes/files
- AI Gateway, Ask CRM, workflow engine, generator runtime execution
- RabbitMQ service or wiring
- Production secrets in repo
- Prisma migrations before Phase 1 Database Agent task is explicitly started
- Application/product code during Phase 0 orchestration
- Any change to 002_iam migration or Sprint-02 auth/IAM modules beyond read/use
```

## Queue Decision

Redis + BullMQ is canon for queue/runtime planning. RabbitMQ remains deferred.

## Prisma + RLS Decision

Tenant-scoped operations must run through tenant-aware repository boundaries with
transaction-local `app.tenant_id` / `app.user_id` context. No BYPASSRLS roles.

## Frontend Gating

Minimal AppShell only. No IAM admin screens. No lead/pipeline/quote/order UI.

## Verify Gate

`sprint:03:verify` is **planned** in root `package.json` (baseline extends
`sprint:02:verify`). CI wiring is **Phase 4 DevOps only** — do not require
`sprint:03:verify` in CI until DevOps gate task runs.
