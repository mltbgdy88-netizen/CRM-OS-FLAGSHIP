# Sprint-03 CI Gate Plan

**Team:** DevOps (Team E)  
**Branch:** `agent/sprint-03-devops-verify`  
**Status:** PREPARATORY — expand CI before Phase 4; do not block integration until Frontend PR #8 merges

## `sprint:03:verify` script (root `package.json`)

Expanded gate sequence:

1. `pnpm --filter @crm-os/database prisma:generate`
2. `pnpm db:migrate`
3. `pnpm db:seed`
4. `pnpm db:test:rls`
5. `pnpm turbo build --filter=@crm-os/api... --filter=@crm-os/database... --filter=@crm-os/web...`
6. `pnpm --filter @crm-os/api test`
7. `pnpm --filter @crm-os/database test`
8. `pnpm --filter @crm-os/web test`
9. `pnpm sprint:02:verify` (includes Sprint-01 regression; does not weaken Sprint-02)

Note: steps 1–8 overlap Sprint-02; step 9 ensures IAM + workspace gates remain mandatory.

## CI workflow

| Job | Command | PostgreSQL 16 |
|-----|---------|---------------|
| `workspace-check` | lint, typecheck, test, build | No |
| `sprint-02-verify` | `pnpm sprint:02:verify` | Yes |
| `sprint-03-verify` | `pnpm sprint:03:verify` | Yes (preparatory) |

Push branch trigger includes `agent/sprint-03-customer-core`.

## Constraints honored

- No `--ignore-scripts`
- `sprint:02:verify` unchanged
- No merge to `main`

## Evidence (fill after CI run)

| PR | sprint-02-verify | sprint-03-verify |
|----|------------------|------------------|
| Frontend #8 | | |
| DevOps Team E | | |

See also [sprint-03-qa-gate-plan.md](../qa/sprint-03-qa-gate-plan.md).
