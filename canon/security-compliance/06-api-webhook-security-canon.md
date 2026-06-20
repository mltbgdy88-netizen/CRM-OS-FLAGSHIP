# API & Webhook Security Canon v1

## API Security

Required:

- JWT access token
- Refresh token rotation
- Token revocation
- Rate limiting
- Tenant header validation
- Permission guard
- Input validation
- Output filtering
- Request ID correlation

## Webhook Security

Required:

- Signature verification
- Timestamp validation
- Replay protection
- Delivery logs
- Retry policy
- Secret rotation
- Tenant-scoped webhook configuration

## Forbidden

- Unsigned inbound webhooks
- Webhook logs leaking secrets
- Cross-tenant webhook delivery
- API keys displayed after creation
