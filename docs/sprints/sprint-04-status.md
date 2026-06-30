# Sprint-04 Integration Status

Last updated: Sprint-04 merged to `main` @ `f49d0b7`; UI shell merged @ `c2cfca2` (2026-06-30).

## Phase checklist

| Phase | Description | Status | Evidence |
|-------|-------------|--------|----------|
| **0.2** | Orchestration, guards, handoff order | **Complete** | integration branch |
| **1** | Database `003_crm_360`, RLS, seeds | **Complete** | PR #17 |
| **2** | Backend `/360` + `/timeline` | **Complete** | PR #18 |
| **3** | Frontend functional 360/timeline UI | **Complete** | PR #19 |
| **3.5** | CORS local browser hotfix | **Complete** | PR #20 |
| **4** | Docs, QA, Security, DevOps, Review, Release | **Complete** | PRs #21–#26 |

## Integration branch

```text
Branch: main (Sprint-04 release merged via PR #29 @ f49d0b7)
UI:     Bitrix Space+ shell merged via PR #30 @ c2cfca2
```

## Merged delivery PRs

| PR | Phase | Title |
|----|-------|-------|
| #17 | Database | `003_crm_360` migration + RLS |
| #18 | Backend | Customer 360 API |
| #19 | Frontend | Customer 360 UI proof |
| #20 | DevOps/dev | Local browser CORS |
| #21 | Phase 4 | Customer 360 OpenAPI contract |
| #22 | Phase 4 | QA gate report |
| #23 | Phase 4 | Security gate report |
| #25 | Phase 4 | Review gate report |
| #26 | Phase 4 | Acceptance report |
| #24 | Phase 4 | Sprint-04 verify CI job |
| #29 | Release | Sprint-04 Customer 360 → main |
| #30 | UI | Bitrix Space+ shell and customer workspace |

## Local verification (latest)

| Gate | Result |
|------|--------|
| GitHub CI (PR #22 representative) | **PASS** (post billing fix) |
| `pnpm sprint:04:verify` | **PASS** (proof Postgres on :5433; Windows EPERM retry once if needed) |
| API tests | 41/41 |
| DB tests | 19/19 |
| RLS tests | 17/17 |
| Web tests | 23/23 |
| Manual browser proof | **PASS** (post-CORS) |

## Reference index

| Area | Document |
|------|----------|
| Sprint spec | `docs/sprints/sprint-04.md` |
| YAML spec | `specs/sprints/sprint-04-customer-360.yaml` |
| Handoff | `.ai/orchestration/sprint-04-handoff-order.md` |
| Branch plan | `.ai/orchestration/sprint-04-branch-plan.md` |
| UI policy | `docs/DECISIONS.md` |
| UI canon (Customer) | `docs/ux/crm-os-ui-canon-vfinal-customer-module.md` |
| Local smoke | `docs/qa/sprint-04-local-smoke-checklist.md` |
| Merge runbook | `docs/release/sprint-04-merge-runbook.md` |
| Acceptance | `docs/release/sprint-04-acceptance-report.md` |

## Next gate

- Sprint-04 **complete on `main`**
- Sprint-05 (Lead) **blocked** until explicit product sign-off
