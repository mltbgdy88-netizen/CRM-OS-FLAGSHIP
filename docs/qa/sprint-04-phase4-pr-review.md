# Sprint-04 Phase 4 PR Review (Local)

**Date:** 2026-06-30  
**Base:** `agent/sprint-04-customer-360`  
**CI:** All gate PRs red (billing block) — review is **read-only**, no merge.

## Merge order (when green)

#21 → #22 → #23 → #25 → #26 → **#24 last**

| PR | Title | Scope | Review notes |
|----|-------|-------|--------------|
| [#21](https://github.com/mltbgdy88-netizen/CRM-OS-FLAGSHIP/pull/21) | Customer 360 API contract | +327/−36, 6 files | OpenAPI, handoff, permissions matrix, contract index. **Merge first** — defines contract for gates. |
| [#22](https://github.com/mltbgdy88-netizen/CRM-OS-FLAGSHIP/pull/22) | QA gate report | +96, docs only | Representative CI PR. Rerun after billing fix. |
| [#23](https://github.com/mltbgdy88-netizen/CRM-OS-FLAGSHIP/pull/23) | Security gate report | +62, 2 files | Security index + gate report. Aligns with RLS/permission proof. |
| [#25](https://github.com/mltbgdy88-netizen/CRM-OS-FLAGSHIP/pull/25) | Review gate report | +91, docs only | Code review sign-off artifact. |
| [#26](https://github.com/mltbgdy88-netizen/CRM-OS-FLAGSHIP/pull/26) | Acceptance report (PENDING) | +127, docs only | Release acceptance — status PENDING until CI + merge. |
| [#24](https://github.com/mltbgdy88-netizen/CRM-OS-FLAGSHIP/pull/24) | Sprint-04 verify CI job | +88, `ci.yml` | **Merge last** — touches workflow; may conflict if billing still flaky. |

## #21 — Contract PR (critical)

Files:

- `docs/api/sprint-04-customer-360-openapi.md`
- `docs/frontend/sprint-04-customer-360-handoff.md`
- `docs/security/sprint-04-customer-360-permissions.md`
- `docs/sprints/sprint-04-contract-index.md`

**Local code alignment:** See `docs/qa/sprint-04-openapi-contract-sync.md`.

## #22 — QA (representative gate)

- No application code changes
- Use `gh pr checks 22` after billing recovery
- Do not merge on red `runner_id: 0` jobs

## #24 — DevOps CI

- Adds Sprint-04 verify job to `.github/workflows/ci.yml`
- Merge only after docs/gate PRs and when Actions billing works

## Open questions for merge day

1. Does #21 OpenAPI match integration controllers after all PRs land?
2. Does #24 CI job duplicate or replace existing sprint verify jobs?
3. Update #26 acceptance from PENDING → PASS only after integration verify on merged branch.

## Related

- `docs/release/sprint-04-merge-runbook.md`
- `docs/qa/sprint-04-local-verify-report-2026-06-30.md`
