# Sprint-03 Customer Audit Actions

Source: `CustomersService` via `IamRepository.writeAuditLog` (no IAM module changes).

## Actions

| Action | HTTP trigger | Resource type |
|--------|--------------|---------------|
| `customer.created` | POST `/api/v1/customers` | `customer` |
| `customer.updated` | PATCH `/api/v1/customers/{id}` | `customer` |

## Write path

1. Controller resolves tenant context via `TenantContextInterceptor`.
2. Service performs repository mutation inside `withTenantContext`.
3. Service calls `IamRepository.writeAuditLog(context, { action, resourceType, resourceId, metadata })`.

Audit rows inherit tenant RLS from IAM `audit_logs` table (Sprint-02).

## Metadata (non-secret)

Create/update metadata includes customer id and changed field names only — no passwords, tokens, or file bytes.

## Not audited in Sprint-03

- GET list/detail (read-only)
- DELETE (no route)
- Related-entity CRUD (not exposed)

## QA references

- E2E: `apps/api/test/customers.e2e-spec.ts` asserts audit rows for create/update
- Verify tenant A audit logs invisible to tenant B session

See [sprint-03-customer-openapi.md](../api/sprint-03-customer-openapi.md).
