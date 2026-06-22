# Sprint-04 Integration Status

Last updated: Phase 0.2 orchestration activation on `agent/sprint-04-customer-360`.

## Phase checklist

| Phase | Description | Status | Evidence |
|-------|-------------|--------|----------|
| **0.2** | Orchestration, guards, handoff order, branch plan | **Complete** | this commit |
| **1** | Database: `003_crm_360`, RLS, seeds, RLS tests | **Blocked** | awaits Phase 0.2 merge |
| **2** | Backend: 360 + timeline read APIs | **Blocked** | awaits Phase 1 |
| **3** | Frontend: functional 360/timeline UI proof | **Blocked** | awaits Phase 2 |
| **3.5** | Docs / OpenAPI contract | **Blocked** | awaits API freeze |
| **4** | QA, Security, DevOps CI, Review, Release gates | **Blocked** | awaits Phase 3 |

## Integration branch

```text
Branch: agent/sprint-04-customer-360
Base:   main @ 92595b0 (tag sprint-03-full-pass)
main:   unchanged until final PR merge
```

## Locked architect decisions

| Topic | Decision |
|-------|----------|
| Sprint identity | Customer 360 (Sprint-05 = Lead) |
| Migration band | `003_crm_360` (`004_lead` reserved) |
| API boundary | Sprint-03 four endpoints frozen; add `/360` + `/timeline` |
| Notes entity | `customer_notes` only (no `comments` table) |
| Files | `customer_files` metadata only |
| CustomerMerged | Deferred (future-only) |
| UI | Functional proof only (`docs/DECISIONS.md`) |

## Gates required before Phase 1

| Gate | Status |
|------|--------|
| `pnpm sprint:03:verify` | Required at Phase 0.2 |
| `pnpm sprint:02:verify` | Required at Phase 0.2 |

## Documentation index (planned)

| Area | Document |
|------|----------|
| Sprint spec | `docs/sprints/sprint-04.md` |
| YAML spec | `specs/sprints/sprint-04-customer-360.yaml` |
| Handoff | `.ai/orchestration/sprint-04-handoff-order.md` |
| Branch plan | `.ai/orchestration/sprint-04-branch-plan.md` |
| UI policy | `docs/DECISIONS.md` |
