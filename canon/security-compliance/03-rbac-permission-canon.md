# RBAC & Permission Canon v1

## Authorization Model

CRM OS uses:

```text
RBAC
+ permission codes
+ tenant scope
+ branch scope
+ team scope
+ record ownership
```

## Roles

System roles:

- Super Admin
- Tenant Admin
- Sales Manager
- Sales Representative
- Finance User
- Warehouse User
- Support Agent
- Marketing User
- Dealer User
- Customer Portal User

## Permission Code Format

```text
module.resource.action
```

Examples:

```text
customer.read
customer.create
customer.update
customer.delete
customer.export
lead.assign
lead.convert
quote.approve
quote.discount.approve
order.cancel
inventory.adjust
workflow.manage
ai.use
admin.manage
```

## UI Rule

Unauthorized actions must be hidden or permission-filtered. Do not expose restricted actions with internal permission details.

## API Rule

Every protected endpoint must define required permissions explicitly.
