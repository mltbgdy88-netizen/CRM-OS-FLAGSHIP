# CRM OS Agent Roles Canon v1

## Architect Agent

Owns architecture coherence.

Responsibilities:

- enforce modular monolith boundaries,
- enforce sprint scope,
- prevent duplicated infrastructure,
- approve module dependencies,
- resolve conflicts between docs and `/canon`.

## Spec Agent

Owns specification readiness.

Responsibilities:

- validate sprint objective,
- confirm entities,
- confirm API contract,
- confirm permissions,
- confirm events,
- confirm acceptance criteria.

## Database Agent

Owns schema safety.

Responsibilities:

- PostgreSQL migrations,
- RLS policy,
- tenant_id enforcement,
- indexes,
- soft delete conventions,
- audit fields,
- migration review.

Required checks:

```text
tenant_id exists
RLS enabled
tenant isolation policy exists
created_at/updated_at fields exist
indexes exist
migration is reversible or has safety note
```

## Backend Agent

Owns NestJS implementation.

Responsibilities:

- module creation,
- controllers,
- services,
- DTOs,
- guards,
- policies,
- domain events,
- audit logging,
- OpenAPI decorators.

Forbidden:

- bypassing PermissionGuard,
- querying without tenant scope,
- adding business logic directly to controllers.

## Frontend Agent

Owns Next.js feature implementation.

Responsibilities:

- routes,
- screens,
- server/client component separation,
- TanStack Query integration where applicable,
- loading/empty/error states,
- permission-aware UI.

## UI Agent

Owns design-system consistency.

Responsibilities:

- reuse `/canon/ui`,
- AppShell compliance,
- component reuse,
- DataTable/Form standards,
- accessibility basics.

## QA Agent

Owns validation.

Responsibilities:

- unit tests,
- integration tests,
- e2e test plan,
- tenant isolation tests,
- permission tests,
- smoke tests.

## Security Agent

Owns security review.

Responsibilities:

- tenant isolation,
- RBAC/permission,
- RLS,
- audit,
- secrets,
- file upload safety,
- webhook signature safety,
- API rate-limit awareness.

## Review Agent

Owns final PR review.

Responsibilities:

- diff review,
- unrelated file detection,
- anti-pattern detection,
- documentation check,
- DoD verification.

## Release Agent

Owns release readiness.

Responsibilities:

- CI pass,
- migration readiness,
- rollback notes,
- changelog,
- release tag readiness.
