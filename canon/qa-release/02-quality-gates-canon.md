# CRM OS Quality Gates Canon

## Global Gates

Every PR must pass:

- lint
- typecheck
- unit tests
- integration tests for touched module
- migration validation
- OpenAPI validation
- permission validation
- tenant isolation validation
- Storybook build if UI changed
- security scan if auth, permission, file, webhook, AI, or payment code changed

## Sprint Completion Gates

A sprint is complete only when:

- code implemented
- migrations included if needed
- API contract updated
- permissions updated
- events updated
- tests implemented
- documentation updated
- release notes written
- rollback notes written

## Merge Blockers

- cross-tenant data exposure
- missing RLS for tenant-owned tables
- missing PermissionGuard on protected endpoints
- unsafe migration
- untyped public API shape
- broken tests
- secrets in source
- AI action without review flow
