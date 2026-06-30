# Sprint-04 Local Verify Report

**Date:** 2026-06-30  
**Branch:** `docs/ui-canon-customer-module` (from `agent/sprint-04-customer-360` @ `4bd8e8a`)  
**Executor:** Billing-wait plan Faz A–E (no merge, no Sprint-05)

## Summary

| Area | Result | Detail |
|------|--------|--------|
| DB seed cleanup (Faz C) | **PASS** | 73 e2e orphan customers removed; 2 canonical seed customers remain |
| Post-cleanup gate | **PASS** | RLS 17/17, API 41/41, DB 19/19, Web 23/23, build OK |
| `pnpm sprint:04:verify` (full script) | **PARTIAL** | Sprint-03 layer green; exit 1 on nested `prisma generate` (Windows EPERM) |
| API smoke (e2e coverage) | **PASS** | health, login, CORS, customers, 360, timeline — see below |
| GitHub CI PR #22 | **BLOCKED** | Billing — jobs fail in ~2–4s, empty `steps[]` |

## Environment

| Item | Value |
|------|-------|
| Postgres | `crmos-sprint02-proof-pg` @ `127.0.0.1:5433` |
| `DATABASE_URL` | `postgresql://postgres:postgres@127.0.0.1:5433/crmos` |
| Integration HEAD | `4bd8e8a` |

## Faz C — DB seed cleanup

1. `pnpm db:migrate` — migrations already applied (`002_iam`, `003_crm`, `003_crm_360`)
2. `pnpm db:seed` — idempotent upsert (does not delete orphans by itself)
3. Proof DB cleanup: `DELETE` non-seed customers (73 rows), preserving:
   - `40000000-0000-4000-8000-000000000001` (default tenant demo)
   - `40000000-0000-4000-8000-000000000002` (tenant B demo)
4. Re-seed + post-cleanup verify

**Customer count:** 74 → **2**

## Faz B — Local verification

### Post-cleanup gate (equivalent Sprint-04 proof)

```text
pnpm db:migrate && pnpm db:seed && pnpm db:test:rls
pnpm turbo build --filter=@crm-os/api... --filter=@crm-os/database... --filter=@crm-os/web...
pnpm --filter @crm-os/api test
pnpm --filter @crm-os/database test
pnpm --filter @crm-os/web test
```

| Suite | Tests |
|-------|-------|
| RLS (`db:test:rls`) | 17 passed |
| API (Jest e2e + unit) | 41 passed |
| Database (Vitest) | 19 passed |
| Web (Vitest) | 23 passed |
| Turbo build | 6 packages OK |

### `pnpm sprint:04:verify` script note

First run completed the Sprint-03 chain (API/DB/Web all green) then failed when the script recursively invoked `sprint:02:verify` → `prisma generate` with:

```text
EPERM: operation not permitted, rename ... query_engine-windows.dll.node
```

This is a **Windows file-lock** issue on repeated `prisma generate`, not an application regression. Retry immediately after failed with the same EPERM at script start.

**Recommendation:** On Windows, run the post-cleanup gate commands above, or re-run `pnpm sprint:04:verify` after closing processes holding the Prisma engine DLL.

## API smoke (via e2e — no separate live server required)

| Check | Test evidence |
|-------|----------------|
| Health | `health.e2e-spec.ts` |
| Login | `iam.e2e-spec.ts`, `customers*.e2e-spec.ts` |
| CORS | `cors.e2e-spec.ts` — `OPTIONS /api/v1/auth/login` |
| Customers CRUD/list | `customers.e2e-spec.ts` |
| 360 | `customers-360.e2e-spec.ts` — `GET .../360` |
| Timeline | `customers-360.e2e-spec.ts` — `GET .../timeline` |

Seed customer for manual browser smoke: `demo@default.local` / `40000000-0000-4000-8000-000000000001`.

## Faz D — CI / billing (representative PR #22)

```text
gh pr checks 22
```

| Check | Status | Duration |
|-------|--------|----------|
| Workspace Check | fail | ~4s |
| Sprint-03 Verify (preparatory) | fail | ~2s |
| Sprint-02 Verify | fail | ~4s |

Run: `28014998279` — all jobs `steps: []`, typical **GitHub Actions billing / runner allocation** failure. **No merge** until #22 is green.

## Faz A / E — Docs delivered

| Document | Path |
|----------|------|
| UI canon (locked) | `docs/ux/crm-os-ui-canon-vfinal-customer-module.md` |
| Smoke checklist | `docs/qa/sprint-04-local-smoke-checklist.md` |
| Merge runbook | `docs/release/sprint-04-merge-runbook.md` |
| Cross-links | `docs/ux/README.md`, `docs/sprints/sprint-04-status.md` |

## Explicit non-actions (confirmed)

- Phase 4 PRs #21–#26 **not merged**
- `main` **not merged**
- Sprint-05 / Lead **not started**

## Next step (when billing fixed)

1. Fix GitHub Actions billing / spending limit
2. Re-run CI on PR #22
3. Merge Phase 4 PRs per `docs/release/sprint-04-merge-runbook.md` (#21 → #22 → #23 → #25 → #26 → #24)
