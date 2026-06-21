# Sprint-03 Security Gate Plan

**Integration branch:** `agent/sprint-03-customer-core` @ `db4e9ba`  
**Agent:** Security Team D  
**Date:** 2026-06-21  
**Status:** PLAN — review against merged DB + backend; re-run after Frontend PR merge

## Control checklist

| # | Control | Verdict | Evidence |
|---|---------|---------|----------|
| 1 | FORCE RLS on all CRM tables | **PASS** | `packages/database/migrations/003_crm/migration.sql` — FORCE RLS on customers, contacts, addresses, tags, notes, files |
| 2 | Fail-closed `app.tenant_id` policies | **PASS** | CRM policies mirror IAM pattern; `packages/database/src/rls.test.ts` CRM band |
| 3 | `crmos_app` NOBYPASSRLS | **PASS** | Unchanged from `002_iam`; API runtime uses `DATABASE_APP_URL` |
| 4 | `withTenantContext` for tenant-scoped queries | **PASS** | `apps/api/src/modules/crm/customers/customers.repository.ts` — all methods wrapped |
| 5 | Controllers do not use Prisma directly | **PASS** | `CustomersController` → `CustomersService` → `CustomersRepository` only |
| 6 | PermissionGuard 401/403 semantics | **PASS** | `@UseGuards(JwtAuthGuard, PermissionGuard)` + `@RequirePermissions` on all routes; e2e in `customers.e2e-spec.ts` |
| 7 | No Sprint-02 IAM regression | **PASS** | `002_iam/**` untouched; audit via existing `IamRepository.writeAuditLog`; no `iam.module.ts` export changes |
| 8 | No file upload/storage/CDN | **PASS** | No upload routes, storage SDK, or signed URL handlers in CRM module |
| 9 | No DELETE route | **PASS** | Controller exposes GET/POST/PATCH only; `customer.delete` permission registered but unused |
| 10 | No related-entity CRUD | **PASS** | Single customer controller; no nested resource routes |
| 11 | JWT secret env-only | **WARN** | Issue #5 — dev fallback in `jwt-token.service.ts`; not Sprint-03 blocker unless production deploy requested |
| 12 | Tenant tamper / cross-tenant | **PASS** | RLS + e2e cross-tenant 404 on customer detail |

## Forbidden scope audit (branch diff)

| Item | Status |
|------|--------|
| Modified `002_iam/**` | **None** |
| Modified `003_crm/migration.sql` post-merge | **None** (unless blocking bug — none found) |
| RabbitMQ / AI Gateway / workflow | **None** |
| Sprint-04 analytics entities | **None** |
| DELETE `/customers` | **None** |

## Frontend security notes (PR #8 — pending merge)

- AppShell gates content without access token (client-side; API remains authoritative)
- No file upload controls in list/detail components
- Authenticated fetch sends bearer only; no secrets in repo

## Security gate verdict

**PASS with WARN** — Customer Core backend and database patterns meet Sprint-03 security requirements. JWT dev fallback remains WARN per Issue #5.

Final sign-off after:
1. Frontend PR #8 merged to integration
2. QA matrix executed (`docs/qa/sprint-03-qa-gate-plan.md`)
3. CI `sprint:03:verify` green

## Rollback security note

Revert integration branch to pre-Sprint-03 tag; CRM tables dropped only via controlled migration rollback — never disable RLS on IAM tables.
