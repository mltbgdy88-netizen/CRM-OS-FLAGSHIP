# Sprint-02 Integration Status

Last updated: Phase 4 gate activation on `agent/sprint-02-auth-tenant-iam`.

## Phase checklist

| Phase | Description | Status | Evidence |
|-------|-------------|--------|----------|
| **0.2** | Orchestration, guards, handoff order, branch plan | **Complete** | Commit `36d3df0`, `.cursor/rules/00-sprint-02-hard-guard.md` |
| **1** | Database: `002_iam`, RLS, seeds, RLS tests | **Complete** | PR #1 → `2a34783` |
| **2** | Backend IAM: auth, guards, audit, events, API tests | **Complete** | PR #2 → squash `7c3abb3` |
| **2.5** | IAM documentation | **Complete** | `5971e11` |
| **3A** | Frontend Slice A (login + auth wiring) | **Complete** | PR #3 → squash `a6fc8d2` |
| **3B** | Frontend IAM admin (users, roles, sessions) | **Disabled** | locks.yaml + hard guard |
| **4** | DevOps CI gate, QA, Security, Review, Release | **In progress** | `sprint-02-verify` CI job + gate reports |

## Integration branch

```text
Branch: agent/sprint-02-auth-tenant-iam
HEAD:   a6fc8d2 feat(sprint-02): add frontend login slice
main:   unchanged (5f9c3d0) — Sprint-02 not merged to main
```

## Gates passed (local / CI)

| Gate | Status |
|------|--------|
| `pnpm sprint:01:verify` | Pass |
| `pnpm sprint:02:verify` | Pass locally (PostgreSQL required) |
| `pnpm --filter @crm-os/api test` | Pass (18/18 with PostgreSQL) |
| `pnpm --filter @crm-os/database test` | Pass (7/7 with PostgreSQL) |
| `pnpm --filter @crm-os/web test` | Pass (9/9) |
| `pnpm db:test:rls` | Pass (5/5) |
| GitHub Actions PR #3 run `27889880359` | Success |
| GitHub Actions `sprint-02-verify` job | Pending Phase 4 push |

## Pending before PR-final → `main`

| Item | Owner | Notes |
|------|-------|-------|
| `sprint-02-verify` CI green on GitHub | DevOps | PostgreSQL 16 service container |
| QA gate report | QA | `docs/qa/sprint-02-qa-gate-report.md` |
| Security gate report | Security | `docs/security/sprint-02-security-gate-report.md` |
| Release acceptance report | Release | `docs/release/sprint-02-acceptance-report.md` |
| Review Agent sign-off | Review | Scope diff clean; merge after CI green |

Generic CI `pnpm test` **skips** IAM e2e and RLS tests when `DATABASE_URL` is unset — use `pnpm sprint:02:verify` for Sprint-02 acceptance.

## Documentation index (Sprint-02 IAM)

| Doc | Path |
|-----|------|
| API contract | `docs/api/sprint-02-iam-openapi.md` |
| Environment | `docs/api/sprint-02-environment.md` |
| Auth flow | `docs/security/sprint-02-auth-flow.md` |
| Permissions | `docs/security/sprint-02-permission-registry.md` |
| Security gate | `docs/security/sprint-02-security-gate-report.md` |
| QA gate | `docs/qa/sprint-02-qa-gate-report.md` |
| Acceptance | `docs/release/sprint-02-acceptance-report.md` |
| Events | `docs/events/sprint-02-iam-events.md` |
| Audit | `docs/audit/sprint-02-iam-audit.md` |
| Frontend Slice A | `docs/frontend/sprint-02-slice-a-handoff.md` |

## Explicit non-goals (still forbidden)

- CRM modules (customer, lead, quote, order, inventory, finance, …)
- RabbitMQ / AI Gateway / workflow engine
- Frontend Slice B until backend + RLS + security sign-off
- Merge to `main` until Phase 4 release gate
