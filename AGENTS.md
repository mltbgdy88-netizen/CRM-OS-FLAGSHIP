# CRM OS Agent Operating Manual v8

## Mission

Build CRM OS using spec-driven, test-first, tenant-safe and permission-aware development.

## Required Reading Before Coding

1. `MASTER-SOURCE-OF-TRUTH-v8.md`
2. `.cursor/rules/*`
3. Active `docs/sprints/sprint-XX.md`
4. Active `specs/sprints/sprint-XX-*.yaml`
5. Relevant UX, API, database and security documents

## Non-Negotiable Rules

- Tenant isolation is mandatory.
- PostgreSQL RLS is mandatory for tenant-owned tables.
- PermissionGuard is mandatory for protected endpoints.
- Audit log is mandatory for critical actions.
- Domain events are mandatory for critical business transitions.
- Tests are mandatory.
- No secrets in code, logs, commits or images.
- No unrelated module changes.

## Required Output Per Task

- Source code
- Migration when database changes
- Tests
- OpenAPI or contract update when API changes
- Permission and event registry update
- Documentation update
- Review notes

## Merge Blockers

- Cross-tenant access
- Missing permission guard
- Missing RLS
- Unsafe migration
- Missing audit trail
- Broken tests
- Secret leakage
- Unreviewed AI data mutation

# Cursor Ready v1.1 Hard Guard

Active sprint: Sprint-01 Repository Bootstrap only.

Agents must not implement Sprint-02+ scope during Sprint-01.

Forbidden in Sprint-01:
- business CRM modules
- auth implementation
- tenant/user/audit implementation
- RLS business tables
- AI Gateway
- workflow engine
- production secrets

Required first action:
Return plan only and stop before writing code.
