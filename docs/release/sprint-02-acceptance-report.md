# Sprint-02 Acceptance Report

**Integration branch:** `agent/sprint-02-auth-tenant-iam`  
**Target for final PR:** `main` (not merged yet)  
**Agent:** Release  
**Date:** 2026-06-21

## Completed phases

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 0.2 | Orchestration, hard guard, handoff order | Complete (`36d3df0`) |
| 1 | `002_iam` migration, RLS, seeds, RLS tests | Complete (`2a34783`) |
| 2 | Backend IAM: auth, guards, audit, events, API tests | Complete (`7c3abb3`) |
| 2.5 | IAM docs (OpenAPI, auth flow, permissions, audit) | Complete (`5971e11`) |
| 3A | Frontend login slice (`/login`, auth client, tests) | Complete (`a6fc8d2`) |
| 4 | DevOps CI gate, QA/Security/Review activation | In progress (this commit) |

## CI evidence

| Gate | Command / job | Status |
|------|---------------|--------|
| Sprint-01 workspace | `workspace-check` job — lint, typecheck, test, build | Pass (existing) |
| Sprint-02 full | `sprint-02-verify` job — PostgreSQL 16 + `pnpm sprint:02:verify` | Pending push (DevOps) |
| Prior PR CI | Run `27889880359` (frontend login PR) | Success |

## RLS evidence

- Migration: `packages/database/migrations/002_iam/migration.sql`
- Proof tests: `pnpm db:test:rls` — 5/5 pass locally
- Cross-tenant isolation: Tenant A cannot read Tenant B rows (`rls.test.ts`)

## Known deferred scope

- Frontend Slice B (users list, role create UI, session/device panel, AppShell) — **disabled**
- CRM modules (Sprint-03+)
- RabbitMQ, AI Gateway, workflow engine
- Production httpOnly cookie auth (frontend uses sessionStorage skeleton for local dev)
- JWT dev fallback hardening (Security WARN)
- Audit events for refresh/failed login

## Rollback notes

1. **Pre-merge to main:** revert integration branch or reset to `5f9c3d0` on `main` (unchanged).
2. **Post-merge:** revert merge commit on `main`; run `DROP` of IAM tables only if migration band `002_iam` was applied — prefer forward-fix.
3. **Database:** `002_iam` is idempotent via `schema_migrations` band tracking; do not re-run destructive drops in shared environments without DBA review.
4. **Frontend:** removing `/login` route is isolated to `apps/web`; no backend dependency for rollback of UI-only changes.

## Final PR checklist (main merge)

- [ ] `sprint-02-verify` GitHub Actions job green on integration branch
- [ ] QA gate report signed (`docs/qa/sprint-02-qa-gate-report.md`)
- [ ] Security gate report signed (`docs/security/sprint-02-security-gate-report.md`)
- [ ] Review Agent scope diff clean (`origin/main..HEAD`)
- [ ] `docs/sprints/sprint-02-status.md` updated to HEAD
- [ ] No forbidden scope in diff
- [ ] `main` merge only after all gates pass

## Acceptance verdict

**Conditional accept** — Sprint-02 Phases 0–3A complete. Ready for final PR to `main` after Phase 4 CI push confirms `sprint-02-verify` passes on GitHub Actions.
