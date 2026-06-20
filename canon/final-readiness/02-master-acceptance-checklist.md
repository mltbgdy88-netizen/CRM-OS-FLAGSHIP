# CRM OS Master Acceptance Checklist

## Repository Acceptance

- Root files exist.
- Workspace package manager is defined.
- Apps and packages structure exists.
- Cursor rules exist.
- Agent prompts exist.
- Canon layers exist.
- Sprint specs exist.
- Quality gates exist.

## Architecture Acceptance

- Modular monolith is the default backend architecture.
- Event-driven patterns are defined.
- Service extraction candidates are documented.
- Tenant-aware request context is mandatory.
- Audit and observability are mandatory.

## Database Acceptance

- Every business table has `tenant_id`.
- RLS policy pattern is defined.
- Migration order is defined.
- Naming standard is defined.
- Index standard is defined.
- Partition candidates are defined.

## API Acceptance

- REST standard exists.
- OpenAPI contract exists.
- Error response format exists.
- Tenant header rules exist.
- Webhook rules exist.
- Public API security rules exist.

## UI Acceptance

- AppShell exists as the default authenticated UI frame.
- Design tokens are defined.
- Component-first generation is required.
- Data tables, forms, domain components, AI panels, and responsive behavior are standardized.
- Loading, empty, error, read-only, and permission states are mandatory.

## Security Acceptance

- RBAC and permission checks are mandatory.
- Tenant isolation tests are mandatory.
- Audit logging is mandatory.
- Secrets must not be committed.
- API rate limits and webhook signatures are mandatory.
- AI actions require review before mutation.

## DevOps Acceptance

- CI pipeline must run lint, typecheck, tests, migration validation, build, and security scan.
- Docker baseline exists.
- Kubernetes and Helm direction exists.
- Observability baseline exists.
- Backup and rollback rules exist.

## Sprint Acceptance

Every sprint must include:

- Objective
- Scope
- Entities
- API
- Permissions
- Events
- Tests
- Quality gates
- Definition of Done

## Cursor Acceptance

Cursor must:

- Read canon first.
- Generate small tasks.
- Stop on failing gates.
- Never generate uncontrolled full platform code in one step.
- Commit only after verification.
