# CRM OS Rollback Canon

## Rollback Principle

Every production release must be reversible or safely forward-fixable.

## Required Rollback Notes

- application rollback command
- image tag to restore
- database migration rollback strategy
- feature flag disable steps
- queue drain instructions
- cache invalidation steps
- post-rollback verification

## Migration Rollback Rules

- destructive migrations are not allowed without explicit approval
- data backfills must be idempotent
- column drops require staged rollout
- enum changes require compatibility plan
- index creation must avoid long blocking locks

## Emergency Stop Conditions

Immediately stop rollout if:

- cross-tenant exposure suspected
- authentication outage
- payment or financial corruption
- irreversible migration issue
- severe error-rate increase
- queue backlog explosion
