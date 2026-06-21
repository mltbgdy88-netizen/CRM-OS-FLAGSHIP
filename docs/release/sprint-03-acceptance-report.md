# Sprint-03 Customer Core Acceptance Report

**Integration branch:** `agent/sprint-03-customer-core`  
**Integration HEAD:** `db4e9ba` (pre-Phase-3 merge)  
**Target for final PR:** `main` — **NOT MERGED** (Sprint-03 in progress)  
**Agent:** Release Team G  
**Date:** 2026-06-21

## Phase status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 0.2 | Orchestration activation | **Complete** (`0c646b0`) |
| 1 | `003_crm` migration, CRM RLS, seeds | **Complete** (`1e4e555`) |
| 2 | Backend customer API (4 endpoints) | **Complete** (`db4e9ba`) |
| 3 | Frontend customer list/detail/AppShell | **Open** — PR #8 |
| 4 | QA, Security, CI, Review, Release gates | **In progress** — PRs #9–#13 |

## Acceptance verdict

**PENDING** — Do not claim PASS until Phase 4 gates complete and Frontend PR #8 merges to integration.

---

## DB evidence

| Item | Evidence | Status |
|------|----------|--------|
| `003_crm` migration applied | `packages/database/migrations/003_crm/migration.sql` | _TBD_ |
| FORCE RLS on CRM tables | Migration + `pnpm db:test:rls` | _TBD_ |
| `002_iam/**` untouched | Diff review | _TBD_ |
| CRM seed data | `pnpm db:seed` | _TBD_ |

## Backend evidence

| Item | Evidence | Status |
|------|----------|--------|
| GET/POST/GET/PATCH customers | `apps/api/test/customers.e2e-spec.ts` | _TBD_ |
| Permission guards | `customer.read/create/update` | _TBD_ |
| Audit create/update | `customer.created`, `customer.updated` | _TBD_ |
| Events | `CustomerCreated`, `CustomerUpdated` | _TBD_ |
| No DELETE route | Controller review | _TBD_ |

## Frontend evidence

| Item | Evidence | Status |
|------|----------|--------|
| AppShell auth gate | PR #8 + `app-shell.test.tsx` | _TBD_ |
| List states | `customer-list.test.tsx` | _TBD_ |
| Detail 360 read-only | `customer-detail.test.tsx` | _TBD_ |
| No upload UI | Test assertions | _TBD_ |
| Login/health regression | Sprint-02 routes unchanged | _TBD_ |

## QA evidence

| Item | Document | Status |
|------|----------|--------|
| Verification matrix | `docs/qa/sprint-03-qa-gate-plan.md` | _TBD_ |
| Matrix execution | Local + CI | _TBD_ |

## Security evidence

| Item | Document | Status |
|------|----------|--------|
| Security gate | `docs/security/sprint-03-security-gate-plan.md` | _TBD_ |
| JWT fallback WARN | Issue #5 — non-blocker for Sprint-03 | _TBD_ |

## CI evidence

| Gate | Command / job | Status |
|------|---------------|--------|
| Sprint-02 regression | `sprint-02-verify` job | _TBD_ |
| Sprint-03 full | `sprint-03-verify` job | _TBD_ |
| CI plan | `docs/release/sprint-03-ci-gate-plan.md` | Preparatory |

## Deferred scope (confirmed out of Sprint-03)

- DELETE `/customers` and `customer.delete` HTTP usage
- Related-entity CRUD (contacts, addresses, tags, notes, files)
- File upload, storage, CDN, signed URLs
- Sprint-04 analytics (scores, LTV, risk, timeline)
- IAM Frontend Slice B
- Lead, pipeline, quote, order, inventory, finance
- RabbitMQ, AI Gateway, workflow engine

## Rollback notes

1. **Pre-merge to main:** reset integration branch to `c6657a6` (`sprint-02-full-pass` on `main`) or revert Sprint-03 merge commits in reverse order (frontend → backend → DB → orchestration).
2. **Database:** CRM band `003_crm` tracked in `schema_migrations`; do not drop IAM band `002_iam`. Forward-fix preferred over destructive rollback in shared DBs.
3. **Frontend:** Customer routes isolated under `apps/web/app/(app)/customers/**`; revert PR #8 without affecting `/login`.
4. **Permissions/events:** Customer permissions appended; rollback requires seed/migration band coordination — document in DBA runbook before production.

## Final checklist (before main merge — future)

- [ ] All Sprint-03 PRs merged to integration
- [ ] `pnpm sprint:03:verify` green locally and in CI
- [ ] QA gate PASS
- [ ] Security gate PASS with WARN documented
- [ ] Review gate approved (`docs/review/sprint-03-review-gate-plan.md`)
- [ ] No forbidden scope in integration diff vs `main`
- [ ] This report updated to **PASS**
