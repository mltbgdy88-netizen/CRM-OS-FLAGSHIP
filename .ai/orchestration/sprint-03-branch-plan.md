# Sprint-03 Branch Plan

Source Status: SPRINT_03_ORCHESTRATION_ACTIVE_v1.1

Repo: `mltbgdy88-netizen/CRM-OS-FLAGSHIP`
Base: `main` @ `c6657a6` (Sprint-02 complete, tag `sprint-02-full-pass`)

## Branch Tree

```text
main
└── agent/sprint-03-customer-core              ← integration branch (Phase 0.2)
    ├── agent/sprint-03-orchestration        ← Phase 0.2 (optional child PR)
    ├── agent/sprint-03-db-crm-migration     ← Phase 1 (Database agent)
    ├── agent/sprint-03-backend-customer     ← Phase 2 (Backend agent)
    └── agent/sprint-03-frontend-customer    ← Phase 3 (Frontend agent)
```

## PR Sequence

| Order | Branch | Into | Scope |
|-------|--------|------|-------|
| PR-0 | `agent/sprint-03-orchestration` | `agent/sprint-03-customer-core` | Phase 0.2 orchestration files only (optional) |
| PR-1 | `agent/sprint-03-db-crm-migration` | integration | 003_crm schema, RLS, seeds, CRM DB tests |
| PR-2 | `agent/sprint-03-backend-customer` | integration | Customer backend, permissions/events append |
| PR-3 | `agent/sprint-03-frontend-customer` | integration | Minimal AppShell + customer list/detail |
| PR-4 | DevOps on integration | integration | Extend sprint:03:verify + CI job (Phase 4) |
| PR-final | `agent/sprint-03-customer-core` | `main` | Full Sprint-03 after all gates |

## Commit Convention

```text
chore(sprint-03): orchestration activation
feat(sprint-03): add 003_crm migration and rls proof
feat(sprint-03): add customer backend api and guards
feat(sprint-03): add appshell and customer ui
chore(sprint-03): wire sprint-03-verify ci gate
```

## Phase 0.2 Git Steps

```bash
git checkout main
git pull origin main
git checkout -b agent/sprint-03-customer-core
# commit orchestration files on integration branch
# optional: git checkout -b agent/sprint-03-orchestration → PR-0
```

## Gate Commands

| Phase | Required verify |
|-------|-----------------|
| 0.2 | `pnpm sprint:01:verify` + `pnpm sprint:02:verify` |
| 1–3 | above + local CRM tests per agent handoff |
| 4 DevOps | `pnpm sprint:03:verify` (full definition) + CI green |
| PR-final | all Phase 4 gates + no Sprint-02 regression |

## Scope Locks (branch-level)

```text
ALLOWED:
  - migration band 003_crm
  - customer 4-endpoint API
  - customer.* permissions + CustomerCreated/Updated events
  - minimal AppShell + customer UI
  - read aggregation of related entities in detail

FORBIDDEN:
  - 002_iam edits
  - Sprint-02 IAM/auth regression
  - separate related-entity CRUD APIs
  - file upload/storage/CDN
  - Sprint-04+ modules
  - RabbitMQ / AI Gateway / workflow engine
  - Frontend IAM Slice B
```

Do not merge to `main` until Sprint-03 Phase 4 release acceptance.
