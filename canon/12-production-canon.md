# CRM OS Production Canon v1

## Environments

- local
- development
- staging
- production
- demo
- sandbox

## Minimum Production Runtime

- 3 API pods
- 2 Worker pods
- 1 Scheduler pod
- PostgreSQL primary + replica
- Redis HA
- RabbitMQ cluster
- Object storage
- Load balancer
- WAF

## CI/CD Gates

Every PR:

- lint
- type-check
- unit test
- migration check
- build
- docker image build
- security scan

Release branch:

- deploy staging
- integration tests
- e2e tests
- manual approval
- production deployment

## Observability

Mandatory metrics:

- request_count
- request_duration
- error_rate
- db_query_duration
- queue_depth
- worker_failures
- login_failures
- tenant_usage
- ai_usage
- storage_usage

## Log Standard

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
