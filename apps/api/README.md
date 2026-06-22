# @crm-os/api

NestJS API skeleton for Sprint-01; Sprint-02 adds IAM auth module.

## Commands

```bash
pnpm --filter @crm-os/api dev
pnpm --filter @crm-os/api test
```

Health endpoint: `GET /health` (no database required)

## IAM refresh flow (Sprint-02)

1. **Login** (`POST /api/v1/auth/login`) validates credentials, resolves tenant membership, and issues:
   - a signed JWT access token (`sub`, `email`, `tenantId`)
   - an opaque refresh token: `base64url(userId:tenantId:nonce)`
2. The refresh token hash is stored in `sessions` via `IamRepository.createSession`, which runs inside `withTenantContext` so RLS applies.
3. **Refresh** (`POST /api/v1/auth/refresh`) parses `userId` and `tenantId` from the opaque token **before** any DB lookup, builds tenant context from those values, then looks up the session with `IamRepository.findSessionByRefreshHash` (also inside `withTenantContext`).
4. A tampered token with a mismatched `tenantId` cannot find the session row under the wrong tenant RLS scope and returns `401`.
5. Controllers never touch Prisma; all session access goes through `IamRepository`.

Required env for IAM integration tests:

- `DATABASE_URL` — migration/seed (postgres superuser)
- `DATABASE_APP_URL` — runtime API (`crmos_app`, RLS enforced)
- `JWT_SECRET` — local dev only
- `API_PORT` — optional, default `3001`
- `CORS_ORIGIN` — browser web origin for local dev (default `http://localhost:3000`). Required when the Next.js app at `:3000` calls this API at `:3001`.

Full environment reference: `docs/api/sprint-02-environment.md`  
OpenAPI-style contract: `docs/api/sprint-02-iam-openapi.md`  
Sprint-03 customer API: `docs/api/sprint-03-customer-openapi.md`
