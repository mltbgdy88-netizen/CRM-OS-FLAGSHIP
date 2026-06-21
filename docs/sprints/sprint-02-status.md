# Sprint-02 Integration Status

Last updated: Phase 2 backend merge on `agent/sprint-02-auth-tenant-iam`.

## Phase checklist

| Phase | Description | Status | Evidence |
|-------|-------------|--------|----------|
| **0.2** | Orchestration, guards, handoff order, branch plan | **Complete** | Commit `36d3df0`, `.cursor/rules/00-sprint-02-hard-guard.md` |
| **1** | Database: `002_iam`, RLS, seeds, RLS tests | **Complete** | PR #1 → `2a34783` |
| **2** | Backend IAM: auth, guards, audit, events, API tests | **Complete** | PR #2 → squash `7c3abb3` |
| **3A** | Frontend Slice A (login + auth wiring) | **Not started** | Awaiting Frontend Agent |
| **3B** | Frontend IAM admin (users, roles, sessions) | **Disabled** | locks.yaml + hard guard |
| **4** | QA, Security, Reviewer, Release | **Not started** | — |

## Integration branch

```text
Branch: agent/sprint-02-auth-tenant-iam
HEAD:   7c3abb3 feat(sprint-02): add backend IAM core
main:   unchanged (5f9c3d0) — Sprint-02 not merged to main
```

## Gates passed (local / CI)

| Gate | Status |
|------|--------|
| `pnpm sprint:01:verify` | Pass on integration branch |
| `pnpm --filter @crm-os/api test` | Pass (18/18 with PostgreSQL) |
| `pnpm --filter @crm-os/database test` | Pass (7/7 with PostgreSQL) |
| `pnpm db:test:rls` | Pass locally |
| GitHub Actions PR #2 run `27885756143` | Success |

## Pending before PR-final → `main`

| Item | Owner | Notes |
|------|-------|-------|
| Real PostgreSQL RLS gate in GitHub Actions | DevOps | `pnpm db:migrate`, `db:seed`, `db:test:rls` with service container |
| Security agent sign-off | Security | IAM data plane checklist |
| Frontend Slice A | Frontend Agent | Login only |
| OpenAPI / docs | Documentation | This doc set (Phase 2.5) |

Generic CI `pnpm test` **skips** IAM e2e and RLS tests when `DATABASE_URL` is unset — not sufficient alone for Sprint-02 acceptance.

## Documentation index (Sprint-02 IAM)

| Doc | Path |
|-----|------|
| API contract | `docs/api/sprint-02-iam-openapi.md` |
| Environment | `docs/api/sprint-02-environment.md` |
| Auth flow | `docs/security/sprint-02-auth-flow.md` |
| Permissions | `docs/security/sprint-02-permission-registry.md` |
| Events | `docs/events/sprint-02-iam-events.md` |
| Audit | `docs/audit/sprint-02-iam-audit.md` |
| Frontend Slice A | `docs/frontend/sprint-02-slice-a-handoff.md` |

## Explicit non-goals (still forbidden)

- CRM modules (customer, lead, quote, order, inventory, finance, …)
- RabbitMQ / AI Gateway / workflow engine
- Frontend Slice B until backend + RLS + security sign-off
- Merge to `main` until Phase 4 release gate
