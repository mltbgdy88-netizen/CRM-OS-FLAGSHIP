# CRM OS Backup & Disaster Recovery Canon

## Backup Targets

```text
PostgreSQL
object storage
configuration
secrets metadata
audit logs
domain events
```

## Backup Rules

- Production database backups must be encrypted.
- Backup restore must be tested.
- Migration deploys require pre-migration backup.
- Object storage retention must match tenant policy.
- Audit logs must not be silently deleted.

## Disaster Recovery

Minimum DR plan:

```text
RPO target defined per environment
RTO target defined per environment
restore runbook
database restore test
object storage restore test
incident owner
communication plan
```
