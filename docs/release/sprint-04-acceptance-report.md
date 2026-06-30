# Sprint-04 Customer 360 Acceptance Report

**Integration branch:** `agent/sprint-04-customer-360`  
**Integration HEAD:** `4bd8e8a`  
**Target for final PR:** `main` @ `92595b0` — **NOT MERGED YET**  
**Agent:** Release  
**Date:** 2026-06-21 (Phase 4 parallel gate execution)

## Acceptance verdict

**PENDING** — Phases 1–3 merged and locally verified. Phase 4 gate PRs (#21–#26) must merge and CI must be green before **PASS**.

---

## Phase status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 0.2 | Orchestration activation | **Complete** (`0d46a9c`) |
| 1 | `003_crm_360` migration, RLS, seeds | **Complete** (`a1d4403`, PR #17) |
| 2 | Backend `/360` + `/timeline` API | **Complete** (`680d515`, PR #18) |
| 3 | Frontend 360 functional proof | **Complete** (`e645bda`, PR #19) |
| 3.1 | Local browser CORS hotfix | **Complete** (`4bd8e8a`, PR #20) |
| 4 | Docs, QA, Security, CI, Review, Release gates | **In progress** (PRs #21–#26 open) |

---

## DB evidence

| Item | Evidence | Status |
|------|----------|--------|
| `003_crm_360` migration applied | `packages/database/migrations/003_crm_360/migration.sql` | **PASS** (local) |
| FORCE RLS on 360 tables | Migration + `pnpm db:test:rls` 17/17 | **PASS** (local) |
| `002_iam/**`, `003_crm/**` untouched | Diff `main..4bd8e8a` | **PASS** |
| CRM 360 seed data | `pnpm db:seed` in verify chain | **PASS** (local) |
| Phase 4 doc cross-link | PR #21 | **PENDING** |

## Backend evidence

| Item | Evidence | Status |
|------|----------|--------|
| GET `/api/v1/customers/:id/360` | `customers-360.e2e-spec.ts` | **PASS** (local 41/41) |
| GET `/api/v1/customers/:id/timeline` | Same e2e suite | **PASS** |
| `customer.read` / `customer.timeline.read` | Controller guards | **PASS** |
| No export endpoint | API review | **PASS** |
| CORS local dev | `cors.config.ts`, PR #20 | **PASS** |

## Frontend evidence

| Item | Evidence | Status |
|------|----------|--------|
| 360 panel (scores, risk, LTV, notes, files) | `customer-detail.test.tsx` | **PASS** (local 23/23) |
| Timeline preview + paginated list | `customer-timeline.test.tsx` | **PASS** |
| No export/upload/merge/DELETE UI | Tests + manual browser | **PASS** |
| Browser proof (login → detail → 360) | Manual local | **PASS** |

## Browser proof

| Check | Result |
|-------|--------|
| Login | **PASS** |
| Customer detail | **PASS** |
| 360 panel | **PASS** |
| Scores / risk / LTV / notes / files / timeline | **PASS** |
| CORS note | `CORS_ORIGIN=http://localhost:3000` required for local API calls |

## QA evidence

| Item | Document | Status |
|------|----------|--------|
| QA gate report | `docs/qa/sprint-04-qa-gate-report.md` (PR #22) | **PENDING merge** |
| Automated counts | API 41/41, DB 19/19, RLS 17/17, Web 23/23 | **PASS** (local) |
| `pnpm sprint:04:verify` | Local | **PASS** |
| `pnpm sprint:03:verify` | Regression | **PASS** |

## Security evidence

| Item | Document | Status |
|------|----------|--------|
| Security gate | `docs/security/sprint-04-security-gate-report.md` (PR #23) | **PENDING merge** |
| JWT fallback WARN | Issue #5 — pre-production carry-over | **WARN** (non-blocker) |

## CI evidence

| Gate | Command / job | Status |
|------|---------------|--------|
| Workspace | `workspace-check` | **PASS** (PR #20 run 28010127223) |
| Sprint-02 regression | `sprint-02-verify` | **PASS** |
| Sprint-03 regression | `sprint-03-verify` | **PASS** |
| Sprint-04 dedicated | `sprint-04-verify` (PR #24) | **PENDING** |

## Review evidence

| Item | Document | Status |
|------|----------|--------|
| Scope review | `docs/review/sprint-04-review-gate-report.md` (PR #25) | **PENDING merge** |
| PRs #17–#20 merged | GitHub | **PASS** |

---

## Deferred scope (explicit out-of-band)

- Export endpoint and export UI (`customer.export` seeded only)
- Upload / storage / CDN / signed URLs / binary handling
- Customer merge API and UI
- DELETE customer route and UI
- Final UI/UX shell polish
- Sprint-05 Lead module
- Issue #5 JWT hardening before production

---

## Rollback notes

1. Revert integration branch to `main` @ `92595b0` if Sprint-04 must be abandoned (no `main` merge occurred).
2. Drop `003_crm_360` band only via controlled migration rollback procedure — **not** in this sprint.
3. Remove Phase 4 CI job via revert of PR #24 if `sprint-04-verify` causes pipeline regression.
4. CORS hotfix (PR #20) is dev-only; production CORS remains environment-configured.

---

## Next steps

1. Review and merge Phase 4 PRs #21–#23, #25, #26 to integration (DevOps #24 preferably last).
2. Confirm CI **Sprint-04 Verify** green on integration.
3. Re-run `pnpm sprint:04:verify` on integration HEAD post-merge.
4. Update this report to **PASS** and proceed to final PR to `main` (separate release step).
