# Sprint-04 Customer 360 Frontend Handoff

Integration: `agent/sprint-04-customer-360` @ `4bd8e8a` (Frontend PR #19, CORS PR #20)

## Routes

| Route | Component | API calls |
|-------|-----------|-----------|
| `/customers/[id]` | `CustomerDetailView` | `getCustomer` + `getCustomer360` (parallel) |
| — | `CustomerTimelineSection` | `getCustomerTimeline(id, page, pageSize)` |

## API client

`apps/web/lib/api/customer-360-client.ts`

- `getCustomer360(id)` → `GET /api/v1/customers/:id/360`
- `getCustomerTimeline(id, page, pageSize)` → `GET /api/v1/customers/:id/timeline`

Uses `authenticatedFetch` + `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`).

## UI states (functional proof only)

| Area | States |
|------|--------|
| Customer 360 panel | loading, forbidden, error, empty, success |
| Timeline section | loading, forbidden, error, empty, success + pagination |

## Local browser proof

1. API: `CORS_ORIGIN=http://localhost:3000`, `API_PORT=3001`
2. Web: `NEXT_PUBLIC_API_URL=http://localhost:3001`
3. Login at `/login` — `admin@default.local` / `Admin123!` / `default`
4. Open `/customers/40000000-0000-4000-8000-000000000001`

Verified sections: scores, risk, LTV, notes, files metadata, timeline preview, timeline list.

## Out of scope

No export, upload, merge, DELETE customer, or related-entity CRUD UI. No final AppShell/dashboard/design system polish.
