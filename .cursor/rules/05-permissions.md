# 05 Permission Rules v8

- Permissions follow `module.action` naming, such as `customer.read`.
- UI must hide actions that the user cannot perform.
- Backend remains authoritative even if UI hides actions.
- Bulk actions and exports require explicit permissions.
- Permission changes must be auditable.
