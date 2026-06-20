# CRM OS Webhook Platform Canon

## Webhook Requirements
- tenant-scoped webhook ownership
- event subscription list
- HMAC signature
- delivery retry policy
- dead-letter state
- delivery logs
- replay support
- event payload versioning

## Standard Headers
- `X-CRMOS-Event`
- `X-CRMOS-Delivery-Id`
- `X-CRMOS-Tenant-Id`
- `X-CRMOS-Timestamp`
- `X-CRMOS-Signature`

## Delivery States
- pending
- delivered
- failed
- retrying
- disabled

## Security
Webhook secrets must never be returned in plain text after creation.
