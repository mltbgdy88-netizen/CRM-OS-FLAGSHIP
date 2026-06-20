# Sprint-01 — Repository Bootstrap

Source Status: CANON_FIXED_FOR_CURSOR_READY_v1.1

## Objective

Create the executable CRM OS monorepo foundation only.

Sprint-01 must make the repository installable, lintable, typecheckable, testable, buildable, and understandable by Cursor and CI.

## Hard Scope

Sprint-01 includes only:

```text
- root package setup
- pnpm workspace
- turbo config
- TypeScript base config
- ESLint/Prettier baseline
- apps/api NestJS skeleton
- apps/web Next.js App Router skeleton
- packages/shared skeleton
- packages/database skeleton without business schema
- packages/config skeleton if needed
- Docker Compose for PostgreSQL and Redis
- .env.example
- GitHub Actions CI skeleton
- API health endpoint only
- minimal tests proving apps/packages boot
- README bootstrap commands
```

## Explicitly Forbidden in Sprint-01

Sprint-01 must not implement:

```text
- customer module
- lead module
- contact module
- company module
- quote module
- order module
- inventory module
- finance module
- real auth implementation
- user/session business implementation
- tenant/workspace business implementation
- audit log business implementation
- permission matrix implementation
- RLS business tables
- AI Gateway
- Ask CRM
- workflow engine
- generator runtime execution
- production secrets
- fake production-ready claims
```

## Deferred to Sprint-02

Sprint-02 owns:

```text
- tenant/workspace foundation
- users
- identities/sessions
- roles
- permissions
- audit_logs
- tenant context
- first PostgreSQL RLS proof
```

## Backend Scope

```text
apps/api:
- NestJS application skeleton
- /health endpoint
- validation/config baseline
- test proving app boots
```

## Frontend Scope

```text
apps/web:
- Next.js App Router skeleton
- root page
- health/status placeholder page
- test/build proof
```

## Database Scope

```text
packages/database:
- package skeleton
- connection/config placeholders only
- no CRM business schema
- no tenant/user/audit tables yet
```

## Infrastructure Scope

```text
infra/docker-compose.yml or docker-compose.yml:
- PostgreSQL service
- Redis service
- local-only defaults
```

## CI Scope

```text
.github/workflows/ci.yml:
- checkout
- setup Node
- setup pnpm
- install
- lint
- typecheck
- test
- build
```

## Quality Gates

Sprint-01 is complete only when:

```text
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm sprint:01:verify
```

can be run or are implemented as real executable checks for the skeleton.

## Definition of Done

```text
- Cursor can identify root source order.
- Monorepo packages are discoverable by pnpm.
- API skeleton starts or builds.
- Web skeleton starts or builds.
- Shared/database packages build or typecheck.
- CI workflow exists.
- No business module is implemented.
- No Sprint-02 scope is implemented.
```
