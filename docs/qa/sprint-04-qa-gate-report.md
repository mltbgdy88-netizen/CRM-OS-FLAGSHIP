# Sprint-04 QA Gate Report

**Branch:** `agent/sprint-04-customer-360`  
**HEAD:** `4bd8e8a`  
**Agent:** QA  
**Date:** 2026-06-23 (Phase 4)

## Verification matrix

| # | Scenario | Method | Expected | Result |
|---|----------|--------|----------|--------|
| 1 | GET `/customers/{id}/360` auth required | `customers-360.e2e-spec.ts` | 401 without bearer | **PASS** |
| 2 | GET `/360` requires `customer.read` | e2e permission cases | 403 without permission | **PASS** |
| 3 | GET `/timeline` requires `customer.timeline.read` | e2e permission cases | 403 without permission | **PASS** |
| 4 | Cross-tenant 360 access | e2e | 404 | **PASS** |
| 5 | 360 aggregation shape | e2e seeded customer | scores, risk, LTV, notes, files, timelinePreview | **PASS** |
| 6 | Timeline pagination | e2e | items, page, pageSize, total | **PASS** |
| 7 | CRM 360 RLS isolation | `pnpm db:test:rls` | No cross-tenant 360 rows | **PASS** (17/17) |
| 8 | CORS preflight | `cors.e2e-spec.ts` | OPTIONS `/auth/login` headers | **PASS** |
| 9 | Frontend 360 loaded state | `customer-detail.test.tsx` | scores/risk/LTV/preview | **PASS** |
| 10 | Frontend 360 empty/error/forbidden | `customer-detail.test.tsx` | isolated panel states | **PASS** |
| 11 | Frontend timeline rows | `customer-timeline.test.tsx` | event list + 403 | **PASS** |
| 12 | API client URLs | `customer-360-client.test.ts` | `/360` and `/timeline` | **PASS** |
| 13 | No upload UI | detail/list tests | no file input | **PASS** |
| 14 | No export UI | manual browser + code review | absent | **PASS** |
| 15 | No merge UI | manual browser + code review | absent | **PASS** |
| 16 | No DELETE UI | manual browser + code review | absent | **PASS** |
| 17 | Sprint-03 customer detail regression | `customer-detail.test.tsx` + e2e | contacts/tags still render | **PASS** |
| 18 | Sprint-02 login regression | `login-form.test.tsx` + IAM e2e | login unchanged | **PASS** |
| 19 | Health regression | `health.e2e-spec.ts` | GET `/health` 200 | **PASS** |
| 20 | Manual browser login | local proof | success message + token | **PASS** |
| 21 | Manual browser 360 panel | local proof seeded customer | all sections render | **PASS** |
| 22 | Manual browser timeline | local proof | list + pagination | **PASS** |

## Automated gate commands

```bash
pnpm sprint:04:verify
pnpm sprint:03:verify
pnpm --filter @crm-os/api test
pnpm --filter @crm-os/database test
pnpm --filter @crm-os/web test
pnpm db:test:rls
```

## Local execution summary

| Command | Result |
|---------|--------|
| `pnpm sprint:04:verify` | **PASS** |
| `pnpm sprint:03:verify` | **PASS** |
| `pnpm --filter @crm-os/api test` | **PASS** — 41/41 |
| `pnpm --filter @crm-os/database test` | **PASS** — 19/19 |
| `pnpm --filter @crm-os/web test` | **PASS** — 23/23 |
| `pnpm db:test:rls` | **PASS** — 17/17 (5 IAM + 6 CRM + 6 CRM-360) |

## Manual browser proof (post-CORS @ `4bd8e8a`)

| Step | Result |
|------|--------|
| Login `admin@default.local` / `default` | **PASS** |
| `/customers/40000000-0000-4000-8000-000000000001` | **PASS** |
| Scores `engagement: 82.5` | **PASS** |
| Risk `low · 12.5` | **PASS** |
| LTV `125000 TRY` | **PASS** |
| Notes / files metadata | **PASS** |
| Timeline preview + list | **PASS** |

Requires proof Postgres on `127.0.0.1:5433`, `CORS_ORIGIN=http://localhost:3000`, `NEXT_PUBLIC_API_URL=http://localhost:3001`.

## CI evidence

| Job | Run | Result |
|-----|-----|--------|
| Workspace Check | [28010127223](https://github.com/mltbgdy88-netizen/CRM-OS-FLAGSHIP/actions/runs/28010127223) (CORS fix) | **success** |
| Sprint-04 Verify | Pending Phase 4 DevOps PR | — |

## Out of scope (confirmed not tested as product)

- Export endpoint/UI
- Upload/storage/CDN
- Customer merge
- DELETE customer
- Sprint-05 Lead
- Final UI/UX shell polish

## QA gate verdict

**PASS** — Automated and manual evidence green on integration `4bd8e8a`. Pending dedicated `sprint-04-verify` CI job merge for full Phase 4 sign-off.
