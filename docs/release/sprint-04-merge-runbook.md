# Sprint-04 Merge Runbook

**Status:** Blocked on GitHub Actions billing (Category A). Local verify may pass; CI evidence required before merge.

## Preconditions

| Gate | Requirement |
|------|-------------|
| Billing | GitHub Actions runners allocate (`runner_id` ≠ 0) |
| Representative CI | PR **#22** (QA) green on latest commit |
| Local proof | `pnpm sprint:04:verify` PASS (see `docs/qa/sprint-04-local-verify-report-*.md`) |
| Policy | No merge without green CI; no Sprint-05 until Sprint-04 closed |

## Integration branch

```text
Branch: agent/sprint-04-customer-360
Base:   main @ 92595b0 (tag sprint-03-full-pass)
```

## Phase 4 PR merge order

Merge **only when CI is green** on each PR before proceeding.

| Order | PR | Team | Notes |
|-------|-----|------|-------|
| 1 | #21 | Documentation | OpenAPI / contract docs |
| 2 | #22 | QA | Representative gate — rerun CI after billing fix |
| 3 | #23 | Security | Security review artifacts |
| 4 | #25 | Review | Code review sign-off |
| 5 | #26 | Release | Release / acceptance |
| 6 | #24 | DevOps | Sprint-04 CI job — **last** (may touch workflow) |

**Do not merge #24 before #21–#23 and #25–#26.**

## Post–Phase 4 (integration only)

1. `pnpm sprint:04:verify` on `agent/sprint-04-customer-360`
2. Update sprint acceptance / status docs to PASS
3. Open final PR: `agent/sprint-04-customer-360` → `main` (separate approval)

## Billing recovery checklist

1. Fix payment / spending limit in GitHub billing settings
2. `gh pr checks 22` — confirm jobs start and complete
3. If stale: re-run failed workflows on PR #22 only first
4. On green #22: merge in table order above
5. Re-run integration verify; then plan `main` PR

## Explicit non-actions

- Do not merge Phase 4 PRs on red CI or billing block
- Do not bypass gates with local-only evidence
- Do not start Sprint-05 (Lead) until Sprint-04 integration + release sign-off
