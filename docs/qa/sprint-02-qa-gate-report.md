# Sprint-02 QA Gate Report

**Branch:** `agent/sprint-02-auth-tenant-iam`  
**HEAD:** `a6fc8d2` (pre-Phase-4 gate commit)  
**Agent:** QA  
**Date:** 2026-06-21

## Verification matrix

| # | Scenario | Method | Expected | Result |
|---|----------|--------|----------|--------|
| 1 | Auth login | `apps/api/test/iam.e2e-spec.ts` — POST `/api/v1/auth/login` | 201, tokens + tenantId | **PASS** |
| 2 | Auth refresh | Same — POST `/api/v1/auth/refresh` | 201, new access token | **PASS** |
| 3 | Invalid JWT → 401 | GET `/api/v1/users` with `Bearer not-a-valid-jwt` | 401 | **PASS** |
| 4 | Missing permission → 403 | Member login (tenant-b) + GET `/api/v1/users` | 403 | **PASS** |
| 5 | Tenant tamper → 401 | Tampered refresh token tenant segment | 401 | **PASS** |
| 6 | RLS Tenant A ≠ Tenant B | `packages/database/src/rls.test.ts` cross-tenant reads | No cross-tenant rows | **PASS** (5/5 RLS tests) |
| 7 | Frontend login UI states | `apps/web/__tests__/login-form.test.tsx` | render, submit, loading, error, success | **PASS** (5/5) |
| 8 | Health endpoint | `apps/api/test/health.e2e-spec.ts` | GET `/health` 200 | **PASS** |
| 9 | Missing bearer → 401 | GET `/api/v1/users` without Authorization | 401 | **PASS** |
| 10 | Role create API (backend) | POST `/api/v1/roles` with admin token | 201 + audit event | **PASS** |

## Gate commands (local, PostgreSQL required)

```bash
pnpm db:migrate
pnpm db:seed
pnpm db:test:rls
pnpm --filter @crm-os/api test
pnpm --filter @crm-os/database test
pnpm --filter @crm-os/web test
pnpm sprint:01:verify
pnpm sprint:02:verify   # runs all of the above in sequence
```

## Local execution summary

| Command | Result |
|---------|--------|
| `pnpm db:migrate` | PASS — `002_iam` applied |
| `pnpm db:seed` | PASS — Sprint-02 IAM seed completed |
| `pnpm db:test:rls` | PASS — 5/5 |
| `pnpm --filter @crm-os/api test` | PASS — 18/18 |
| `pnpm --filter @crm-os/database test` | PASS — 7/7 |
| `pnpm --filter @crm-os/web test` | PASS — 9/9 |
| `pnpm sprint:01:verify` | PASS |

## Frontend Slice A manual checklist (deferred to staging)

- [ ] Visit `/login` against running API + web dev servers
- [ ] Submit seed credentials (`admin@default.local` / `Admin123!` / `default`)
- [ ] Confirm sessionStorage warning visible; token stored on success

## QA gate verdict

**PASS** — All automated matrix items pass with PostgreSQL. CI must run `sprint-02-verify` job (DevOps Phase 4) before final PR to `main`.

## Out of scope (confirmed not tested as product)

- Frontend Slice B (users list UI, role create UI, session/device panel, AppShell)
- CRM modules, RabbitMQ, AI Gateway, workflow engine
