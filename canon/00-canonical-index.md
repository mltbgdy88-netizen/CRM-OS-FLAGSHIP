# CRM OS Canonical Index v1

## Canon Files

1. `01-product-canon.md`
2. `02-architecture-canon.md`
3. `03-domain-canon.md`
4. `04-database-canon.md`
5. `05-api-canon.md`
6. `06-security-canon.md`
7. `07-ux-canon.md`
8. `08-ai-canon.md`
9. `09-sprint-canon.md`
10. `10-factory-canon.md`
11. `11-cursor-canon.md`
12. `12-production-canon.md`
13. `13-build-order-canon.md`

## Absolute Rules

- CRM OS is a multi-tenant SaaS platform.
- PostgreSQL RLS is mandatory for tenant-owned tables.
- `tenant_id` is mandatory for tenant-owned business data.
- RBAC + permission checks are mandatory.
- Critical business actions must create audit logs.
- Critical business actions must emit domain events.
- Cursor must generate small, testable increments.
- No sprint may bypass quality, security or tenant isolation gates.

## v10 Database Canon Layer

- `database/master-erd-canon-v1.md`
- `database/data-dictionary-canon-v1.md`
- `database/migration-canon-v1.md`
- `database/rls-security-canon-v1.md`
- `database/index-partition-canon-v1.md`

Database canon overrides older ERD, migration, and schema docs.
