# Security Quality Gates v1

## Required Gates

```text
[ ] Tenant-owned tables include tenant_id.
[ ] RLS exists for tenant-owned tables.
[ ] Backend sets tenant context per request.
[ ] Protected endpoints use PermissionGuard.
[ ] Sensitive operations write audit logs.
[ ] Exports are permission-protected.
[ ] Webhooks use signature verification.
[ ] File upload validates type and size.
[ ] Secrets are not committed or logged.
[ ] AI actions require review and audit.
[ ] Tests include tenant isolation cases.
[ ] Tests include permission-denied cases.
```

## Release Blockers

- Cross-tenant data leakage
- Missing RLS on tenant table
- Missing permission guard
- Missing audit log for critical action
- Secret leakage
- Unsafe migration
- Unvalidated webhook
- Unrestricted export
