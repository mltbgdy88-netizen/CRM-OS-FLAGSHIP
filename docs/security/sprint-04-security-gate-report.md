# Sprint-04 Security Gate Report

**Branch:** `agent/sprint-04-customer-360`  
**HEAD:** `4bd8e8a`  
**Agent:** Security  
**Date:** 2026-06-23 (Phase 4)

## Control checklist results

| # | Control | Verdict | Evidence |
|---|---------|---------|----------|
| 1 | FORCE RLS on `003_crm_360` tables | **PASS** | `customer_timeline_events`, `customer_scores`, `customer_risk_scores`, `customer_lifetime_values` — `FORCE ROW LEVEL SECURITY` in migration |
| 2 | Fail-closed `app.tenant_id` policies | **PASS** | `NULLIF(current_setting('app.tenant_id', true), '')::uuid`; `rls-crm-360.test.ts` (6/6) |
| 3 | `crmos_app` NOBYPASSRLS | **PASS** | Inherited from `002_iam`; API uses `DATABASE_APP_URL` |
| 4 | `withTenantContext` in Customer360Repository | **PASS** | All repository methods wrapped; no direct Prisma in controllers |
| 5 | No Prisma in controllers | **PASS** | `Customer360Controller` → `Customer360Service` → `Customer360Repository` |
| 6 | `customer.read` protects `/360` | **PASS** | `@RequirePermissions(PERMISSIONS.CUSTOMER_READ)` |
| 7 | `customer.timeline.read` protects `/timeline` | **PASS** | `@RequirePermissions(PERMISSIONS.CUSTOMER_TIMELINE_READ)` |
| 8 | Browser errors do not leak tokens | **PASS** | Generic network/auth messages; token in `sessionStorage` only client-side |
| 9 | No export endpoint | **PASS** | `customer.export` seeded; no route |
| 10 | No upload/CDN/signed URL/binary handling | **PASS** | Files metadata read-only; no storage SDK |
| 11 | No merge API | **PASS** | CustomerMerged deferred |
| 12 | No DELETE customer | **PASS** | No new DELETE routes |
| 13 | Frozen bands untouched | **PASS** | `002_iam`, `003_crm` not modified post-merge |
| 14 | No Sprint-05 / Lead | **PASS** | No `004_lead` |
| 15 | CORS local-only scope | **PASS** | `configureCors` env-driven; no wildcard `*` |
| 16 | JWT secret env-only | **WARN** | Issue #5 — dev fallback; pre-production carry-over, not Sprint-04 blocker |

## Forbidden scope audit (`main..4bd8e8a`)

| Item | Status |
|------|--------|
| Export UI/API | **None** |
| Upload/storage | **None** |
| Merge / DELETE customer | **None** |
| RabbitMQ / AI Gateway / workflow | **None** |
| Sprint-05 Lead | **None** |
| Final UI polish | **None** |

## Gate execution

| Command | Result |
|---------|--------|
| `pnpm sprint:04:verify` | **PASS** (local, proof Postgres) |
| `pnpm db:test:rls` | **PASS** — 17/17 |
| CI run 28010127223 | **success** (pre–Sprint-04 CI job) |

## Security gate verdict

**PASS with WARN** — Customer 360 meets Sprint-04 security requirements. Issue #5 JWT hardening remains WARN for production.

## Rollback security note

Revert integration to pre-Sprint-04 commits or reverse merge commits. Band `003_crm_360` rollback via `schema_migrations` only — never disable RLS on IAM or CRM bands.
