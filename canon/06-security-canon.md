# CRM OS Security Canon v1

## Security Model

CRM OS uses:

```text
RBAC + Permission + Tenant Scope + Branch Scope + Team Scope
```

## Mandatory Controls

- PostgreSQL RLS
- RBAC
- PermissionGuard
- 2FA support
- JWT rotation
- Refresh token revocation
- Audit log
- IP whitelist support
- Rate limit
- Webhook signature verification
- File upload validation
- Virus scan integration point
- Encryption at rest
- Encryption in transit
- Secret manager
- Backup encryption

## Permission Examples

- customer.read
- customer.create
- customer.update
- customer.delete
- customer.export
- lead.read
- lead.assign
- lead.convert
- quote.create
- quote.send
- quote.approve
- quote.discount.approve
- order.create
- order.cancel
- payment.read
- payment.create
- inventory.read
- inventory.adjust
- workflow.manage
- ai.use
- admin.manage

## Compliance Requirements

- consent records
- data export request
- data deletion request
- retention policies
- data masking
- audit trail

## Security Definition of Done

A feature is not complete unless:

- tenant isolation is enforced
- permissions are checked
- RLS exists for tenant-owned tables
- audit log exists for critical actions
- sensitive fields are protected
- tests cover unauthorized access
