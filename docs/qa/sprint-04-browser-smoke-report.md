# Sprint-04 Browser Smoke Report

**Date:** 2026-06-30  
**Environment:** Local proof Postgres `127.0.0.1:5433`, API `localhost:3001`

## Results

| Check | Method | Result | Notes |
|-------|--------|--------|-------|
| Health | `GET /health` | **PASS** | HTTP 200 |
| Login | `POST /api/v1/auth/login` | **PASS** | JWT returned |
| Customers list | `GET /api/v1/customers?pageSize=8` | **PASS** | 2 seed customers |
| Customer 360 | `GET .../360` | **PASS** | Aggregation returned |
| Timeline | `GET .../timeline?pageSize=5` | **PASS** | 1 event |
| CORS | API e2e (`cors.e2e-spec.ts`) | **PASS** | Covered in `pnpm sprint:04:verify` |
| Browser UI flow | IDE browser → `localhost:3000` | **BLOCKED** | `chrome-error://` — web not reachable from Cursor browser; port 3000 EADDRINUSE on retry |

## Browser UI (manual fallback)

If `pnpm --filter @crm-os/web dev` is running:

1. `http://localhost:3000/login` — `admin@default.local` / `Admin123!` / tenant `default`
2. Navigate to `/customers`
3. Open seed customer `40000000-0000-4000-8000-000000000001`
4. Confirm 360 panels + timeline render

## Recommendation

- Use API smoke (above) as billing-wait proof when IDE browser cannot reach localhost
- Re-run browser smoke after starting web dev server on a free port or killing stale process on `:3000`
