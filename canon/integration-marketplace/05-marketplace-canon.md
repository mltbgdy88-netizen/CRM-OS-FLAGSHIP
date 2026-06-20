# CRM OS Marketplace Canon

## Marketplace App Model
Marketplace apps define:
- name
- vendor
- scopes
- permissions
- webhook subscriptions
- OAuth configuration
- plan restrictions
- install state

## Installation Flow
1. Tenant admin reviews app.
2. Required permissions are displayed.
3. OAuth/API credentials are created.
4. Install event is audited.
5. App appears in integration health.

## Uninstall Flow
- revoke tokens
- disable webhooks
- preserve audit logs
- keep historical records
