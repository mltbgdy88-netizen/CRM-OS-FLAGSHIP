# CRM OS Index and Partition Canon v1

## Mandatory Indexes

```sql
CREATE INDEX idx_<table>_tenant_id
ON <table>(tenant_id);

CREATE INDEX idx_<table>_tenant_deleted
ON <table>(tenant_id, deleted_at);
```

## Common Indexes

```sql
CREATE INDEX idx_<table>_tenant_status
ON <table>(tenant_id, status);

CREATE INDEX idx_<table>_assigned_user
ON <table>(tenant_id, assigned_user_id);

CREATE INDEX idx_<table>_tenant_created_at
ON <table>(tenant_id, created_at DESC);
```

## Search Index

Use PostgreSQL full text search first.

OpenSearch or Elasticsearch may be introduced later for large-scale search.

## Partition Candidates

```text
audit_logs
domain_events
timeline_events
messages
notifications
activity_logs
workflow_logs
ai_usage_logs
api_logs
```

## Partition Rule

Do not partition early unless measurable data volume requires it. Prepare schema and indexes so partitioning can be introduced later.
