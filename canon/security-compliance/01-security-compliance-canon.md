# CRM OS Security & Compliance Canon v1

## Mission

CRM OS is a multi-tenant enterprise SaaS platform. Security is not a feature; it is a baseline requirement.

Every module must satisfy:

- Tenant isolation
- Permission enforcement
- Auditability
- Secure defaults
- Privacy and compliance readiness
- Safe file, API, webhook, and AI behavior

## Non-Negotiable Rules

- Every tenant-owned table must include `tenant_id`.
- PostgreSQL RLS is mandatory for tenant-owned tables.
- Backend must set `app.tenant_id` and `app.user_id` per request.
- Every protected API route must have permission enforcement.
- Critical business operations must write audit logs.
- Sensitive exports require explicit permission.
- AI must never bypass RBAC, tenant scope, audit scope, or approval rules.
- Secrets must never be committed, logged, returned, or embedded in images.
