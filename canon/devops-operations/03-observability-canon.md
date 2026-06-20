# CRM OS Observability Canon

## Required Metrics

```text
request_count
request_duration
error_rate
db_query_duration
queue_depth
worker_failures
login_failures
tenant_usage
ai_usage
storage_usage
```

## Logging Standard

```json
{
  "requestId": "uuid",
  "tenantId": "uuid",
  "userId": "uuid",
  "module": "crm",
  "action": "customer.create",
  "level": "info",
  "message": "Customer created"
}
```

## Required Tools

```text
Prometheus
Grafana
Loki
Sentry
OpenTelemetry-ready instrumentation
```

## Observability Rules

- Every request must have requestId.
- TenantId and userId must be included where available.
- Logs must not contain secrets, tokens, passwords, or sensitive payloads.
- Audit logs are not application logs; they must be persisted separately.
- AI usage must be measurable by tenant and user.
