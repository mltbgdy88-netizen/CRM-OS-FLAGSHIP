# CRM OS v7 Production Sequence

## Rule

Do not ask Cursor to build all CRM OS at once.

## Sequence

1. Sprint-01 Foundation / Repository Bootstrap
2. Validate and commit
3. Sprint-02 IAM + Tenant
4. Validate and commit
5. Sprint-03 CRM Core
6. Validate and commit
7. Sprint-04 Lead
8. Validate and commit
9. Sprint-05 Sales / Pipeline
10. Validate and commit
11. Sprint-06 Quote + Dashboard
12. Validate and commit

## Task Size

Each Cursor task should produce a small PR-size change.

## Validation Required Before Next Sprint

- pnpm install
- pnpm lint
- pnpm typecheck
- pnpm test
- docker compose smoke test where applicable
- migration check where applicable
- tenant isolation test where applicable
- permission test where applicable
