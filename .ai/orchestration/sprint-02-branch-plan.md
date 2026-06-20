# Sprint-02 Branch Plan

Source Status: SPRINT_02_ORCHESTRATION_ACTIVE_v1.1

Repo: `mltbgdy88-netizen/CRM-OS-FLAGSHIP`
Base: `main` (Sprint-01 complete, CI green)

## Branch Tree

```text
main
└── agent/sprint-02-auth-tenant-iam          ← integration branch (create at Phase 0.2 merge)
    ├── agent/sprint-02-orchestration        ← Phase 0.2 (this activation)
    ├── agent/sprint-02-db-iam-migration     ← Phase 1 (Database agent)
    ├── agent/sprint-02-backend-iam-core     ← Phase 2 (Backend agent)
    ├── agent/sprint-02-frontend-login       ← Phase 3A (Frontend Slice A)
    └── agent/sprint-02-frontend-iam-admin   ← Phase 3B DISABLED until RLS proof
```

## PR Sequence

| Order | Branch | Into | Scope |
|-------|--------|------|-------|
| PR-0 | `agent/sprint-02-orchestration` | `agent/sprint-02-auth-tenant-iam` | Phase 0.2 orchestration files only |
| PR-1 | `agent/sprint-02-db-iam-migration` | integration | 002_iam schema, RLS, seeds, DB tests |
| PR-2 | `agent/sprint-02-backend-iam-core` | integration | IAM backend, packages/permissions, packages/events |
| PR-3 | `agent/sprint-02-frontend-login` | integration | Login Slice A only |
| PR-4 | `agent/sprint-02-frontend-iam-admin` | integration | **Blocked** — Slice B |
| PR-final | `agent/sprint-02-auth-tenant-iam` | `main` | Full Sprint-02 after all gates |

## Commit Convention

```text
chore(sprint-02): orchestration activation
feat(sprint-02): add 002_iam migration and rls proof
feat(sprint-02): add iam backend auth and guards
feat(sprint-02): add login slice a
```

## Phase 0.2 Immediate Git Steps (when user requests commit)

```bash
git checkout -b agent/sprint-02-auth-tenant-iam
git checkout -b agent/sprint-02-orchestration
# commit orchestration files
# open PR-0 → agent/sprint-02-auth-tenant-iam
```

Do not merge to `main` until Sprint-02 Phase 4 release acceptance.
