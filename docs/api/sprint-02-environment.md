# Sprint-02 Environment (IAM)

Variables required for local API + IAM integration tests.

## Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes (IAM tests / migrate / seed) | PostgreSQL admin connection for migrations and seed (`postgres` user) |
| `DATABASE_APP_URL` | Yes (runtime API + RLS tests) | Application role connection (`crmos_app`, RLS enforced). Derived from `DATABASE_URL` when unset — see `@crm-os/database` `getAppDatabaseUrlFromEnv()` |
| `JWT_SECRET` | Yes (auth) | HMAC secret for access JWT signing. Default in code: `change-me-local-only` — **must override outside local dev** |
| `API_PORT` | No | HTTP port for NestJS API. Default: `3001` |
| `JWT_ACCESS_TTL_SECONDS` | No | Access token TTL. Default: `900` |
| `JWT_REFRESH_TTL_SECONDS` | No | Refresh session TTL. Default: `604800` |

## Local example

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/crmos
DATABASE_APP_URL=postgresql://crmos_app:crmos_app@127.0.0.1:5433/crmos
JWT_SECRET=change-me-local-only
API_PORT=3001
```

## Database setup sequence

```bash
pnpm db:migrate
pnpm db:seed
pnpm db:test:rls
```

See `packages/database/README.md` for schema ownership and `crmos_app` role notes.

## Local-only credential warnings

| Item | Warning |
|------|---------|
| `admin@default.local` / `Admin123!` | Seed data only — documented in auth flow |
| `JWT_SECRET=change-me-local-only` | Never use in staging/production |
| `crmos_app` / `crmos_app` password | Created by `002_iam` migration for **dev/local/CI proof only** |
| Password hashing | Sprint-02 uses SHA256 placeholder; production must use bcrypt/argon2 before go-live |

**No production secrets belong in this repository.**

## CI note

Generic `pnpm test` skips IAM e2e when `DATABASE_URL` is unset. Sprint-02 final acceptance requires real PostgreSQL RLS gate in CI (DevOps pending — see `docs/sprints/sprint-02-status.md`).
