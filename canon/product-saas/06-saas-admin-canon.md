# CRM OS SaaS Admin Canon

## SaaS Admin Responsibilities

SaaS admin layer controls:

- Tenant management
- Plan management
- Subscription management
- License management
- Usage quotas
- Feature flags
- AI usage quotas
- API quotas
- Storage quotas
- Billing visibility
- System health
- Error monitoring
- Audit review
- Integration health

## Tenant Admin vs Platform Admin

Tenant Admin can manage only its tenant.

Platform Admin can manage SaaS-wide configuration and support operations.

## Safety Rule

Platform Admin actions must be audit logged and must not bypass tenant isolation silently.
