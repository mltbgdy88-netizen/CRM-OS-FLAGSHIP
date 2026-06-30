# Sprint-04 Local Smoke Checklist

Short manual/API smoke for billing-wait local proof. Does **not** replace CI gates on Phase 4 PRs.

## Prerequisites

- Proof Postgres: `crmos-sprint02-proof-pg` on `127.0.0.1:5433`
- Env from `.env.example` (`DATABASE_URL`, `DATABASE_APP_URL`, `JWT_SECRET`, `CORS_ORIGIN`)
- API on `http://localhost:3001`, Web on `http://localhost:3000` (for browser checks)

## Automated gate

```bash
pnpm sprint:04:verify
```

## API smoke (curl)

| # | Check | Command / expectation |
|---|-------|----------------------|
| 1 | Health | `GET /health` → `200` |
| 2 | Login | `POST /api/v1/auth/login` with `admin@default.local` / `Admin123!` / tenant `default` → JWT |
| 3 | CORS | `OPTIONS` preflight from `http://localhost:3000` → `Access-Control-Allow-Origin` |
| 4 | Customers list | `GET /api/v1/customers` with Bearer → `200`, seeded `displayName` |
| 5 | Customer 360 | `GET /api/v1/customers/40000000-0000-4000-8000-000000000001/360` → `200` |
| 6 | Timeline | `GET /api/v1/customers/40000000-0000-4000-8000-000000000001/timeline` → `200` |

## Browser smoke (optional)

1. Login at `/login` → redirect or success, not stuck on login page
2. `/customers` → list renders, row navigates to `/customers/:id`
3. Detail → 360 modules + timeline visible (functional proof; shell canon is separate)

## Seed reference

| Field | Value |
|-------|-------|
| Customer ID | `40000000-0000-4000-8000-000000000001` |
| Email | `demo@default.local` |
| Admin | `admin@default.local` / `Admin123!` / tenant `default` |

## Out of scope (billing wait)

- Phase 4 PR merge (#21–#26)
- `main` merge
- Sprint-05 / Lead module
- Export, bulk, merge, delete UI
