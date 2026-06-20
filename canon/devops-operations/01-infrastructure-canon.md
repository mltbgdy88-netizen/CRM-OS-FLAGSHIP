# CRM OS Infrastructure Canon

## Target Architecture

CRM OS starts as a modular monolith with event-driven internals.

Runtime services:

```text
api
web
worker
scheduler
postgresql
redis
rabbitmq
minio-or-s3
monitoring
logging
```

## Environments

```text
local
development
staging
production
demo
sandbox
```

## Production Minimum

```text
3 API pods
2 worker pods
1 scheduler pod
PostgreSQL primary + replica
Redis HA
RabbitMQ cluster
Object storage
Load balancer
WAF
```

## Infrastructure Rules

- Infrastructure must be reproducible.
- Local environment must run through Docker Compose.
- Production environment must run through Kubernetes.
- Helm charts must be used for Kubernetes packaging.
- Terraform must manage cloud infrastructure when cloud resources are used.
- Secrets must never be committed.
- Every environment must have explicit configuration boundaries.
