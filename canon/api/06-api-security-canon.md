# CRM OS API Security Canon v1

## 1. Security Layers

```txt
Authentication
Tenant Context
Permission Guard
Scope Guard
RLS
Rate Limit
Audit Log
Input Validation
Output Filtering
```

## 2. Required Guards

Authenticated tenant endpoint:

```txt
JwtAuthGuard
TenantContextGuard
PermissionGuard
```

Public API endpoint:

```txt
ApiKeyOrOAuthGuard
ApiScopeGuard
RateLimitGuard
TenantContextGuard
```

## 3. Permission Rule

Every mutating endpoint must declare permission.

Examples:

```txt
POST /customers => customer.create
PATCH /customers/{id} => customer.update
DELETE /customers/{id} => customer.delete
POST /leads/{id}/convert => lead.convert
POST /quotes/{id}/approve => quote.approve
POST /orders/{id}/reserve-stock => inventory.reserve
```

## 4. RLS Rule

Backend permission checks are not enough. Tenant-owned tables must enable PostgreSQL RLS.

## 5. Audit Rule

Audit required for:

```txt
create
update
delete
approve
reject
convert
send
export
import
permission change
security setting change
```

## 6. Export Security

Export endpoints require explicit permission:

```txt
customer.export
quote.export
order.export
report.export
```

Export operations must create audit logs.

## 7. Rate Limit

Authentication, public API and AI endpoints must be rate-limited.

## 8. File Upload

File upload endpoint rules:

```txt
- file type whitelist
- max size
- virus scan state
- tenant scoped object path
- audit metadata
```

## 9. AI API Security

AI endpoints:
- must respect RBAC,
- must not expose restricted data,
- must not silently mutate records,
- must create audit/timeline trace when suggestion applied.
