# Sprint-02 Security Gate Report

**Branch:** `agent/sprint-02-auth-tenant-iam`  
**Agent:** Security  
**Date:** 2026-06-21

## Checklist results

| # | Control | Verdict | Evidence |
|---|---------|---------|----------|
| 1 | RLS fail-closed | **PASS** | `packages/database/migrations/002_iam/migration.sql` — FORCE RLS; policies require `app.tenant_id`; proof in `packages/database/src/rls.test.ts` |
| 2 | `crmos_app` NOBYPASSRLS | **PASS** | Migration creates `crmos_app` with `NOBYPASSRLS`; API uses `DATABASE_APP_URL` via `PrismaService` |
| 3 | Controllers do not use Prisma directly | **PASS** | IAM controllers delegate to services only; no `PrismaService` in controller layer |
| 4 | Tenant-scoped access uses `withTenantContext` | **PASS** | `apps/api/src/modules/iam/repositories/iam.repository.ts` wraps tenant-owned operations |
| 5 | JWT secret env-only | **WARN** | `JWT_SECRET` from env; dev fallback `'change-me-local-only'` in `jwt-token.service.ts` — acceptable for local/CI, must be enforced in production deploy |
| 6 | Refresh token not logged plaintext | **PASS** | Stored as SHA256 hash only; no Logger/console in IAM auth path |
| 7 | Audit writes tenant-scoped | **PASS** | `writeAuditLog` runs inside `withTenantContext`; rows include `tenantId` |
| 8 | PermissionGuard 401/403 semantics | **PASS** | `JwtAuthGuard` → 401; missing permission → 403; e2e proof in `iam.e2e-spec.ts` |

## Blockers resolved by Phase 4 DevOps

| Item | Status |
|------|--------|
| RLS CI gate (PostgreSQL service + `pnpm db:test:rls`) | **Addressed** — `sprint-02-verify` CI job added |

## Recommendations (non-blocking)

1. Remove or guard JWT dev fallback outside `development`/test environments.
2. Add `ALTER ROLE crmos_app NOSUPERUSER NOBYPASSRLS` on migration re-apply for idempotency.
3. Track audit gaps: refresh success/failure and failed login (deferred).

## Security gate verdict

**PASS with WARN** — IAM data plane patterns meet Sprint-02 requirements. Approve integration branch for final PR to `main` after CI `sprint-02-verify` job passes.

## Forbidden scope

No CRM modules, RabbitMQ wiring, AI Gateway, workflow engine, or Frontend Slice B in branch diff.
