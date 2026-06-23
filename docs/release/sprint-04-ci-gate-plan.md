# Sprint-04 CI Gate Plan

Integration: `agent/sprint-04-customer-360` @ `4bd8e8a`

## Workflow changes (`.github/workflows/ci.yml`)

| Change | Detail |
|--------|--------|
| Branch trigger | Added `agent/sprint-04-customer-360` to `push` branches |
| New job | `sprint-04-verify` — runs `pnpm sprint:04:verify` |
| Postgres service | `postgres:16` on port 5432 |
| Env | `DATABASE_URL`, `DATABASE_APP_URL`, `JWT_SECRET`, `CORS_ORIGIN=http://localhost:3000` |

## Unchanged

- `workspace-check` job (lint, typecheck, test, build)
- `sprint-02-verify` job
- `sprint-03-verify` job (not weakened)
- No `--ignore-scripts`

## `sprint:04:verify` definition

Root `package.json`: delegates to `pnpm sprint:03:verify` (includes migrate, seed, RLS, API/DB/web tests, sprint:02).

## Evidence target

After merge, CI on integration branch should show four jobs:

1. Workspace Check
2. Sprint-02 Verify
3. Sprint-03 Verify (preparatory)
4. **Sprint-04 Verify** (new)

## Prior CI runs

| Run | Branch | Result | Notes |
|-----|--------|--------|-------|
| 28010127223 | `fix/sprint-04-local-cors` | **success** | No dedicated Sprint-04 job yet |
| 27979994690 | Frontend PR #19 | **success** | Pre-CORS fix |

## Rollback

Revert DevOps PR commit to remove `sprint-04-verify` job and branch trigger only.
