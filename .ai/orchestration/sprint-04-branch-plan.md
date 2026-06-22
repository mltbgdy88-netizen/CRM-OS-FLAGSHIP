# Sprint-04 Branch Plan

Source Status: SPRINT_04_ORCHESTRATION_ACTIVE_v1.1

Repo: `mltbgdy88-netizen/CRM-OS-FLAGSHIP`
Base: `main` @ `92595b0` (Sprint-03 complete, tag `sprint-03-full-pass`)

## Branch Tree

```text
main
└── agent/sprint-04-customer-360              ← integration branch (Phase 0.2)
    ├── agent/sprint-04-db-crm-360            ← Phase 1 (Database agent)
    ├── agent/sprint-04-backend-customer-360  ← Phase 2 (Backend agent)
    ├── agent/sprint-04-frontend-customer-360 ← Phase 3 (Frontend agent)
    ├── agent/sprint-04-docs-customer-360     ← Phase 3.5 (Documentation)
    └── agent/sprint-04-*-gate                ← Phase 4 swarm (QA, Security, DevOps, Review, Release)
```

## PR Sequence

| Order | Branch | Into | Scope |
|-------|--------|------|-------|
| PR-0 | `agent/sprint-04-orchestration` | integration | Phase 0.2 orchestration only (optional child) |
| PR-1 | `agent/sprint-04-db-crm-360` | integration | `003_crm_360` migration, RLS, seeds, RLS tests |
| PR-2 | `agent/sprint-04-backend-customer-360` | integration | 360 + timeline APIs, permissions/events append |
| PR-3 | `agent/sprint-04-frontend-customer-360` | integration | Functional 360/timeline UI proof |
| PR-3.5 | `agent/sprint-04-docs-customer-360` | integration | OpenAPI, audit/events/permissions docs |
| PR-4 | Phase 4 swarm branches | integration | QA, Security, DevOps CI, Review, Release |
| PR-final | `agent/sprint-04-customer-360` | `main` | Full Sprint-04 after all gates |

## Commit Convention

```text
chore(sprint-04): activate customer 360 orchestration
feat(sprint-04): add 003_crm_360 migration and rls proof
feat(sprint-04): add customer 360 backend read apis
feat(sprint-04): add customer 360 functional ui proof
chore(sprint-04): wire sprint-04-verify ci gate
```

## Phase 0.2 Git Steps

```bash
git checkout main
git pull origin main
git checkout -b agent/sprint-04-customer-360
# commit orchestration files on integration branch
```

## Gate Commands

| Phase | Required verify |
|-------|-----------------|
| 0.2 | `pnpm sprint:03:verify` + `pnpm sprint:02:verify` |
| 1–3 | above + local CRM 360 tests per agent handoff |
| 4 DevOps | `pnpm sprint:04:verify` (full definition) + CI green |
| PR-final | all Phase 4 gates + no Sprint-02/03 regression |

## Scope Locks (branch-level)

```text
ALLOWED:
  - migration band 003_crm_360 only (new tables)
  - GET /customers/{id}/360 and GET /customers/{id}/timeline
  - customer.timeline.read, customer.export permissions
  - functional UI proof for 360 + timeline
  - CustomerUpdated event on 360 writes

FORBIDDEN:
  - 002_iam, 003_crm SQL edits
  - Sprint-03 four-endpoint API changes
  - Sprint-05 Lead (004_lead band)
  - file upload/storage/CDN
  - final visual UI / AppShell redesign
  - CustomerMerged without merge API
  - comments table duplicating customer_notes
```

Do not merge to `main` until Sprint-04 Phase 4 release acceptance.
