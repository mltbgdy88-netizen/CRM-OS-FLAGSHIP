# CRM OS Offline Sync Canon

## Offline Principle

Mobile must support controlled offline work for field operations.

## Offline-Capable Domains

- Customers: read/search/favorite/recent
- Leads: create/edit draft
- Tasks: view/update/complete
- Activities: create notes, visits, calls
- Visits: check-in/check-out drafts
- Products: cached catalog subset
- Inventory: cached availability snapshot
- Approvals: review queue with delayed decision submission

## Sync Rules

- Every offline write receives a local temporary id.
- Sync must be explicit and observable.
- Conflicts must not be silently overwritten.
- Server state wins only when policy says so.
- User must see sync status: pending, synced, failed, conflict.
- Every synced write must preserve tenant_id and user identity.
- Offline data must be encrypted at rest on device.

## Conflict Resolution

Conflict types:

- Field conflict
- Permission conflict
- Deleted record conflict
- Version conflict
- Tenant context conflict

Resolution options:

- Keep local
- Keep server
- Merge manually
- Discard local draft

## Cursor Rule

Do not implement offline sync as hidden magic. Build visible sync state, local draft tracking, and conflict UI.
