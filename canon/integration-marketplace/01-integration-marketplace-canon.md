# CRM OS Integration & Marketplace Canon

## Purpose
This canon defines how CRM OS exposes, consumes, governs, monitors and commercializes integrations.

## Principles
- Public APIs are contract-first.
- Webhooks are signed, replay-safe and auditable.
- Connectors are tenant-scoped.
- Marketplace apps are permission-scoped and revocable.
- No integration may bypass RBAC, RLS, audit logging or rate limits.
- Integration failures must be visible, retryable and traceable.

## Integration Domains
- Public API
- Private API
- Webhook Platform
- OAuth Applications
- API Keys
- Connector Accounts
- Marketplace Apps
- Import/Export API
- Sandbox/Test Tenants
- Developer Portal
- SDKs
- Integration Health
