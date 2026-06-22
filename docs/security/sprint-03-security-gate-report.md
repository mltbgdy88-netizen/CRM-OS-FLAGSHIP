# Sprint-03 Security Gate Report

**Branch:** `agent/sprint-03-customer-core`  
**HEAD:** `ea3a079`  
**Agent:** Security  
**Date:** 2026-06-21 (Phase 4 final execution)

## Control checklist results

| # | Control | Verdict | Evidence |
|---|---------|---------|----------|
| 1 | FORCE RLS on all CRM tables | **PASS** | `packages/database/migrations/003_crm/migration.sql` — FORCE RLS on customers, contacts, addresses, tags, notes, files |
| 2 | Fail-closed `app.tenant_id` policies | **PASS** | CRM policies mirror IAM pattern; `packages/database/src/rls-crm.test.ts` (6/6) |
| 3 | `crmos_app` NOBYPASSRLS | **PASS** | `002_iam` migration; API uses `DATABASE_APP_URL` via `PrismaService` |
| 4 | `withTenantContext` for customer operations | **PASS** | `customers.repository.ts` — all methods wrapped |
| 5 | No Prisma in controllers | **PASS** | `CustomersController` → `CustomersService` → `CustomersRepository` only |
| 6 | PermissionGuard 401/403 semantics | **PASS** | `JwtAuthGuard` → 401; missing permission → 403; `customers.e2e-spec.ts` |
| 7 | No Sprint-02 IAM regression | **PASS** | `002_iam/**` untouched post-Sprint-02; audit via `IamRepository.writeAuditLog`; IAM e2e 28/28 pass |
| 8 | No file upload/storage/CDN | **PASS** | No upload routes, storage SDK, or signed URL handlers; frontend tests assert no upload UI |
| 9 | No DELETE route | **PASS** | Controller: GET/POST/PATCH only; `customer.delete` registered but unused |
| 10 | No related-entity CRUD | **PASS** | Single customer controller; no nested resource routes or edit UI |
| 11 | JWT secret env-only | **WARN** | Issue #5 — dev fallback in `jwt-token.service.ts`; not Sprint-03 blocker unless production deploy |
| 12 | Tenant tamper / cross-tenant | **PASS** | RLS + e2e cross-tenant 404; `pnpm db:test:rls` 11/11 |

## Forbidden scope audit (`origin/main..ea3a079`)

| Item | Status |
|------|--------|
| Modified `002_iam/**` | **None** |
| Modified `003_crm/migration.sql` post-merge | **None** |
| RabbitMQ / AI Gateway / workflow | **None** |
| Sprint-04 analytics entities | **None** |
| DELETE `/customers` | **None** |
| IAM Slice B | **None** |

## Frontend security (merged PR #8)

- AppShell gates content without access token (client-side; API authoritative)
- No file upload controls in list/detail components
- Authenticated fetch sends bearer only; no secrets in repo

## Gate execution

| Command | Result |
|---------|--------|
| `pnpm sprint:03:verify` | **PASS** |
| `pnpm db:test:rls` | **PASS** — 11/11 |
| CI `sprint-03-verify` run 27914860581 | **PASS** |

## Security gate verdict

**PASS with WARN** — Customer Core meets Sprint-03 security requirements. JWT dev fallback (Issue #5) remains WARN for production hardening. Approve integration branch for final PR to `main`.

## Rollback security note

Revert integration to `c6657a6` on `main` or reverse Sprint-03 merge commits. CRM band `003_crm` rollback via `schema_migrations` only — never disable RLS on IAM tables.
