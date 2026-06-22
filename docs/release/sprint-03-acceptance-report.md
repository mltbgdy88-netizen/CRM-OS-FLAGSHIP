# Sprint-03 Customer Core Acceptance Report

**Integration branch:** `agent/sprint-03-customer-core`  
**Integration HEAD:** `ea3a079`  
**Target for final PR:** `main` @ `c6657a6` — **NOT MERGED YET**  
**Agent:** Release  
**Date:** 2026-06-21 (Phase 4 final execution)

## Phase status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 0.2 | Orchestration activation | **Complete** (`0c646b0`) |
| 1 | `003_crm` migration, CRM RLS, seeds | **Complete** (`1e4e555`, PR #6) |
| 2 | Backend customer API (4 endpoints) | **Complete** (`db4e9ba`, PR #7) |
| 3 | Frontend customer list/detail/AppShell | **Complete** (`221e26d`, PR #8) |
| 4 | QA, Security, CI, Review, Release gates | **Complete** (`ea3a079`, PRs #9–#14) |

## Acceptance verdict

**PASS** — All Phase 4 gates green locally and in CI. Integration branch ready for final PR to `main`. Main merge not performed in this step.

---

## DB evidence

| Item | Evidence | Status |
|------|----------|--------|
| `003_crm` migration applied | `packages/database/migrations/003_crm/migration.sql` | **PASS** |
| FORCE RLS on CRM tables | Migration + `pnpm db:test:rls` 11/11 | **PASS** |
| `002_iam/**` untouched | Diff `origin/main..ea3a079` | **PASS** |
| CRM seed data | `pnpm db:seed` in `sprint:03:verify` | **PASS** |

## Backend evidence

| Item | Evidence | Status |
|------|----------|--------|
| GET/POST/GET/PATCH customers | `apps/api/test/customers.e2e-spec.ts` | **PASS** |
| Permission guards | `customer.read/create/update` | **PASS** |
| Audit create/update | `customer.created`, `customer.updated` | **PASS** |
| Events | `CustomerCreated`, `CustomerUpdated` | **PASS** |
| No DELETE route | Controller review | **PASS** |

## Frontend evidence

| Item | Evidence | Status |
|------|----------|--------|
| AppShell auth gate | `app-shell.test.tsx` | **PASS** |
| List states | `customer-list.test.tsx` | **PASS** |
| Detail 360 read-only | `customer-detail.test.tsx` | **PASS** |
| No upload UI | Test assertions | **PASS** |
| Login/health regression | Sprint-02 routes + e2e | **PASS** |

## QA evidence

| Item | Document | Status |
|------|----------|--------|
| Verification matrix | `docs/qa/sprint-03-qa-gate-report.md` | **PASS** (22/22) |
| Matrix execution | Local + CI | **PASS** |

## Security evidence

| Item | Document | Status |
|------|----------|--------|
| Security gate | `docs/security/sprint-03-security-gate-report.md` | **PASS with WARN** |
| JWT fallback WARN | Issue #5 — non-blocker for Sprint-03 | **Documented** |

## Review evidence

| Item | Document | Status |
|------|----------|--------|
| Scope review | `docs/review/sprint-03-review-gate-report.md` | **PASS** |
| PRs #6–#14 merged | GitHub merge history | **PASS** |

## CI evidence

| Gate | Command / job | Status |
|------|---------------|--------|
| Workspace | `workspace-check` job | **PASS** |
| Sprint-02 regression | `sprint-02-verify` job | **PASS** |
| Sprint-03 full | `sprint-03-verify` job | **PASS** |
| Run ID | [27914860581](https://github.com/mltbgdy88-netizen/CRM-OS-FLAGSHIP/actions/runs/27914860581) on `ea3a079` | **success** |

## Local gate evidence (Phase 4)

| Command | Result |
|---------|--------|
| `pnpm sprint:03:verify` | **PASS** |
| `pnpm sprint:02:verify` | **PASS** |
| `pnpm --filter @crm-os/api test` | **PASS** — 28/28 |
| `pnpm --filter @crm-os/database test` | **PASS** — 13/13 |
| `pnpm --filter @crm-os/web test` | **PASS** — 16/16 |
| `pnpm db:test:rls` | **PASS** — 11/11 |

## RLS evidence

- Migration: `packages/database/migrations/003_crm/migration.sql` (FORCE RLS on 6 CRM tables)
- IAM band: `002_iam` unchanged
- Proof: `packages/database/src/rls.test.ts` (5) + `rls-crm.test.ts` (6)
- Cross-tenant: Tenant A cannot read Tenant B CRM rows

## Deferred scope (confirmed out of Sprint-03)

- DELETE `/customers` and `customer.delete` HTTP usage
- Related-entity CRUD (contacts, addresses, tags, notes, files)
- File upload, storage, CDN, signed URLs
- Sprint-04 analytics (scores, LTV, risk, timeline)
- IAM Frontend Slice B
- Lead, pipeline, quote, order, inventory, finance
- RabbitMQ, AI Gateway, workflow engine

## Rollback notes

1. **Pre-merge to main:** reset integration to `c6657a6` or revert Sprint-03 commits in reverse order.
2. **Database:** CRM band `003_crm` in `schema_migrations`; do not drop IAM `002_iam`. Forward-fix preferred.
3. **Frontend:** Customer routes under `apps/web/app/(app)/customers/**`; `/login` isolated.
4. **Permissions/events:** Customer permissions appended in seed; coordinate rollback with DBA runbook.

## Final PR checklist (main merge — next step)

- [x] All Sprint-03 PRs merged to integration (#6–#14)
- [x] `pnpm sprint:03:verify` green locally and in CI
- [x] QA gate PASS
- [x] Security gate PASS with WARN documented
- [x] Review gate approved
- [x] No forbidden scope in integration diff vs `main`
- [x] This report updated to **PASS**
- [ ] **Open PR:** `agent/sprint-03-customer-core` → `main` (not done yet)
- [ ] Merge to `main` after stakeholder approval
