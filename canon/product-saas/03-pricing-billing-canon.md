# CRM OS Pricing & Billing Canon

## Billing Concepts

CRM OS must support:

- Free trial
- Monthly subscription
- Annual subscription
- Per-user pricing
- Module-based add-ons
- Usage-based AI credits
- API usage quotas
- Storage quotas
- WhatsApp/message quotas
- Enterprise custom contracts

## Billing Entities

Canonical billing entities:

- plans
- plan_features
- subscriptions
- subscription_items
- usage_quotas
- usage_records
- invoices
- payment_methods
- billing_accounts

## Upgrade / Downgrade

Plan change rules:

- Upgrades can apply immediately.
- Downgrades may apply at next billing cycle.
- Enterprise contracts require admin approval.
- Feature removal must not delete data; it should restrict access.
- Restricted features must show safe plan limitation states.

## Payment Failure

Payment failure flow:

1. Payment failure detected.
2. Tenant billing admin notified.
3. Grace period starts.
4. Non-critical features stay active.
5. After grace period, write operations may be restricted.
6. Data remains exportable according to policy.
