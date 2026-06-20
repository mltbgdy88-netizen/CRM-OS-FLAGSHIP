# CRM OS Architecture Canon v1

## Architecture Decision

CRM OS starts as a Modular Monolith with Event-Driven Architecture.

Microservices are not used in the first phase. Modules are independently owned, but deployed as one backend.

## Future Service Extraction Candidates

- notification-service
- file-service
- integration-service
- ai-service
- reporting-service
- workflow-service

## Technology Stack

### Backend

- NestJS
- TypeScript
- PostgreSQL
- Prisma preferred unless explicitly changed
- Redis
- RabbitMQ
- BullMQ

### Frontend

- Next.js App Router
- React
- TypeScript
- TanStack Query
- Zustand or Redux Toolkit
- Tailwind CSS

### Storage and Search

- MinIO / S3
- PostgreSQL Full Text Search first
- OpenSearch / Elasticsearch later
- pgvector for initial vector search

### DevOps

- Docker
- Kubernetes
- Helm
- GitHub Actions or GitLab CI
- Terraform
- Prometheus
- Grafana
- Loki
- Sentry

## System Layers

```text
Client Layer
├── Web App
├── Mobile App
├── Customer Portal
├── Dealer Portal
└── Admin Panel

API Layer
├── REST API
├── Webhook API
├── Public API
└── Internal API

Application Layer
├── IAM
├── CRM
├── Lead
├── Sales
├── Quote
├── Order
├── Inventory
├── Finance
├── Support
├── Marketing
├── Workflow
├── Communication
├── AI
└── Reporting

Data Layer
├── PostgreSQL
├── Redis
├── Object Storage
├── Search Index
└── Event Store

Infrastructure Layer
├── Kubernetes
├── CI/CD
├── Monitoring
├── Logging
└── Backup / DR
```
