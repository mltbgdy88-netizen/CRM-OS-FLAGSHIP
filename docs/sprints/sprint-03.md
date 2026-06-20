# Sprint-03 Customer Core Factory Pack v8

## Sprint Objective

Deliver the Customer Core capability as a production-ready CRM OS slice aligned with the Customer Operating System blueprint, modular monolith architecture, PostgreSQL RLS tenancy model, event-driven boundaries, and Cursor controlled-generation rules.

## Factory Metadata

| Field | Value |
|---|---|
| Sprint | 03 |
| Domain | CRM |
| Primary Module | crm |
| Source Status | FROM_RECONSTRUCTED_CONTENT |
| Production Target | Cursor implementation pack |
| Architecture Style | Modular Monolith + Event-Driven Architecture |
| Tenancy | Shared PostgreSQL database with mandatory tenant_id and RLS |
| Runtime | NestJS, Next.js, PostgreSQL, Redis, RabbitMQ/BullMQ |

## Business Scope

This sprint provides the Customer Core business capability for CRM OS. The output must be small enough for safe Cursor execution, but complete enough to be merged behind CI gates. It must support workspace scope, role and permission checks, audit logging, domain events and typed API contracts.

## Domain Model

Primary entities:

- `customers`
- `customer_contacts`
- `customer_addresses`
- `customer_tags`
- `customer_notes`
- `customer_files`

Every tenant-owned table must include:

```sql
id uuid primary key,
tenant_id uuid not null,
created_at timestamptz not null default now(),
created_by uuid,
updated_at timestamptz,
updated_by uuid,
deleted_at timestamptz,
deleted_by uuid,
version integer not null default 1
```

Required indexes:

```sql
CREATE INDEX idx_<table>_tenant_id ON <table>(tenant_id);
CREATE INDEX idx_<table>_tenant_deleted ON <table>(tenant_id, deleted_at);
```

Required RLS pattern:

```sql
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_<table_name>
ON <table_name>
USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

## Events

Domain events:

- `CustomerCreated`
- `CustomerUpdated`

Event rules:

- Critical state changes must publish a domain event.
- Domain events must include tenantId, actorId, aggregateType, aggregateId, eventType, payload and createdAt.
- Event publishing must not bypass permission checks.
- Failed event delivery must be observable through logs and retry queue.

## Permissions

Required permissions:

- `customer.read`
- `customer.create`
- `customer.update`
- `customer.delete`

Permission rules:

- Every endpoint must use TenantContext and PermissionGuard.
- UI must hide unauthorized actions.
- Exports and bulk operations require explicit permission.
- Sensitive fields must be omitted when the user lacks access.

## API Contract

Primary endpoints:

- `GET /customers`
- `POST /customers`
- `GET /customers/{id}`
- `PATCH /customers/{id}`

API rules:

- Base path: `/api/v1`.
- Responses use the standard CRM OS data/meta envelope.
- Errors use the standard CRM OS error envelope with code, message and details.
- Pagination is mandatory for list endpoints.
- Validation errors must be explicit and stable.

## Backend / NestJS Scope

Required backend output:

- Module, controller, service and repository/provider structure.
- DTOs with validation.
- Permission metadata on every route.
- Audit log for create, update, delete and critical workflow actions.
- Domain event emission for listed events.
- Database migration with RLS policy.
- Seed data where needed for local development.
- Integration tests for RLS, permissions and API behavior.

## Frontend Scope

Required frontend output:

- Customer list
- Customer detail
- Customer 360
- Timeline and files

Frontend rules:

- Use CRM OS AppShell for authenticated screens.
- Use existing data display, form, drawer, modal, timeline and AI review components.
- All screens must support loading, empty, error, read-only and permission-denied states.
- No backend assumptions beyond documented API contracts.
- Use typed mock data before live API integration.

## Test Factory

Required checks:

- unit tests for services and domain rules
- integration tests for API and database behavior
- tenant isolation tests using RLS context
- permission guard tests
- frontend state tests for loading, empty, error and permission states
- audit and event assertion tests for critical actions

## Quality Gates

The sprint cannot be accepted unless:

- `pnpm lint` passes.
- `pnpm typecheck` passes.
- Unit tests pass.
- Integration tests pass.
- Migration check passes.
- RLS tests pass.
- Permission guard tests pass.
- OpenAPI contract is updated.
- Storybook stories are created for new UI components.
- Audit and event behavior is verified.

## Definition of Done

- Backend implementation is complete.
- Frontend implementation is complete where applicable.
- Database migration and RLS policy are complete.
- Permissions are registered.
- Events are registered.
- Tests cover happy path and failure paths.
- Documentation is updated.
- Cursor review agent reports no critical issue.
