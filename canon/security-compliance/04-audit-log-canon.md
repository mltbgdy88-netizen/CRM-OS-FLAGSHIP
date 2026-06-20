# Audit Log Canon v1

## Required Audit Events

Audit logs are mandatory for:

- Login and logout
- Failed login
- User invite
- Role change
- Permission change
- Customer create/update/delete/merge
- Lead conversion
- Opportunity stage change
- Quote approval/rejection
- Order cancellation
- Payment creation
- Inventory adjustment
- Workflow publish
- AI action applied
- API key creation/revocation
- Webhook creation/update
- Data export
- File upload/delete
- Admin setting changes

## Audit Log Fields

```text
id
tenant_id
user_id
entity_type
entity_id
action
old_data
new_data
ip_address
user_agent
request_id
created_at
```

## Rules

- Audit logs are append-only.
- Audit logs must not be soft-deleted by normal users.
- Sensitive values must be masked.
- Audit logs must be queryable by tenant and time.
