# 03 Database Rules v8

- PostgreSQL is the source of truth.
- Every tenant-owned table must include tenant_id and RLS.
- All business tables include audit columns and optimistic locking version.
- Use soft delete where records are business-important.
- Add tenant-aware indexes for status, owner, created_at and deleted_at.
- Migration review is required before merge.
