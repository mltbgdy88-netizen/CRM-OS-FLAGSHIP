# Sprint-03 Customer Frontend Handoff

Target branch: `agent/sprint-03-frontend-customer` → `agent/sprint-03-customer-core`  
API contract: [sprint-03-customer-openapi.md](../api/sprint-03-customer-openapi.md)

## Delivered scope

| Area | Requirement | Status |
|------|-------------|--------|
| AppShell | Minimal authenticated shell; auth-required gate | PR #8 |
| Routes | `/customers`, `/customers/[id]`, `/customers/new` | PR #8 |
| API client | GET list, POST, GET by id, PATCH only | PR #8 |
| List states | loading, empty, error, 403, pagination display | PR #8 |
| Detail 360 | Read-only contacts, addresses, tags, notes, files metadata | PR #8 |
| Create | POST `/customers` form | PR #8 |
| Edit core | PATCH `/customers/{id}` for displayName/email/phone/status | PR #8 |
| Login/health | Sprint-02 `/login`, `/health` unchanged | PR #8 |

## Forbidden (confirmed)

- No DELETE customer UI
- No related-entity edit UI (contacts, addresses, tags, notes)
- No file upload UI or `<input type="file">`
- No IAM Slice B (users, roles, session admin)
- No dashboard expansion beyond minimal shell nav

## Auth reuse

- Access token: `apps/web/lib/auth/token-storage.ts` (sessionStorage skeleton)
- Authenticated fetch: bearer header via `authenticated-fetch.ts`
- Unauthenticated users see AppShell auth-required state with link to `/login`

## Test coverage

- `apps/web/__tests__/app-shell.test.tsx`
- `apps/web/__tests__/customer-list.test.tsx`
- `apps/web/__tests__/customer-detail.test.tsx` (includes no-upload assertion)

## Manual checklist (staging)

- [ ] Login as default admin, navigate to `/customers`
- [ ] Confirm pagination footer shows page, pageSize, total
- [ ] Open seeded customer detail; verify 360 sections render
- [ ] Member without `customer.read` sees 403 state on list
