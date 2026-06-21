# Sprint-03 QA Gate Plan

**Integration branch:** `agent/sprint-03-customer-core` @ `db4e9ba`  
**Agent:** QA Team C  
**Date:** 2026-06-21  
**Status:** PLAN — Phase 4 execution pending Frontend PR merge

## Gate objective

Verify Customer Core end-to-end without regressing Sprint-02 IAM, tenant isolation, or health/login behavior.

## Verification matrix

| # | Scenario | Method | Expected | Phase |
|---|----------|--------|----------|-------|
| 1 | Customer list auth required | GET `/api/v1/customers` without bearer | 401 | Backend e2e |
| 2 | Customer list requires `customer.read` | Member without read permission | 403 | Backend e2e |
| 3 | Customer create requires `customer.create` | POST without permission | 403 | Backend e2e |
| 4 | Customer update requires `customer.update` | PATCH without permission | 403 | Backend e2e |
| 5 | Tenant A cannot access tenant B customer | Cross-tenant GET by id | 404 | Backend e2e + RLS |
| 6 | Detail aggregation shape | GET `/customers/{id}` | contacts, addresses, tags, notes, files metadata | Backend e2e |
| 7 | Pagination contract | GET list with page/pageSize | `items`, `page`, `pageSize`, `total` | Backend e2e |
| 8 | Audit on create | POST customer | `customer.created` row in tenant scope | Backend e2e |
| 9 | Audit on update | PATCH customer | `customer.updated` row in tenant scope | Backend e2e |
| 10 | CustomerCreated event | POST customer | Event envelope tenant + aggregate | Backend e2e |
| 11 | CustomerUpdated event | PATCH customer | Event envelope with changes | Backend e2e |
| 12 | CRM RLS isolation | `pnpm db:test:rls` CRM band | No cross-tenant CRM rows | Database test |
| 13 | Frontend list loading | `customer-list.test.tsx` | loading → success | Web test |
| 14 | Frontend list empty | Mock empty page | empty state | Web test |
| 15 | Frontend list error | Mock rejection | error state | Web test |
| 16 | Frontend list forbidden | Mock 403 | permission-denied state | Web test |
| 17 | Frontend detail 360 | `customer-detail.test.tsx` | all aggregation sections | Web test |
| 18 | No upload UI | List + detail tests | no file input / upload control | Web test |
| 19 | AppShell auth required | `app-shell.test.tsx` | gate without token | Web test |
| 20 | Health regression | `health.e2e-spec.ts` | GET `/health` 200 | API e2e |
| 21 | Login regression | `login-form.test.tsx` + IAM e2e | login/refresh unchanged | Web + API |
| 22 | Sprint-02 IAM regression | `iam.e2e-spec.ts` full suite | all Sprint-02 cases pass | API e2e |

## Gate commands

```bash
pnpm sprint:03:verify   # after DevOps PR merges expanded script
# interim (current):
pnpm sprint:02:verify
```

## Evidence links (fill on Phase 4)

| Area | Location |
|------|----------|
| Backend e2e | `apps/api/test/customers.e2e-spec.ts` |
| RLS | `packages/database/src/rls.test.ts` |
| Frontend | `apps/web/__tests__/customer-*.tsx`, `app-shell.test.tsx` |
| CI | GitHub Actions `sprint-02-verify` / `sprint-03-verify` jobs |

## Out of scope (must remain untested as product)

- DELETE `/customers`
- Related-entity CRUD routes or UI
- File upload/storage/CDN
- Sprint-04 analytics (scores, LTV, risk, timeline)
- IAM Slice B admin screens
- RabbitMQ, AI Gateway, workflow engine

## QA gate verdict

**PENDING** — Execute matrix after Frontend PR #8 merges to integration and `sprint:03:verify` CI job is active.
