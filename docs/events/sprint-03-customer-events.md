# Sprint-03 Customer Domain Events

Source: `@crm-os/events` + `CustomersService` on integration branch `db4e9ba`.

## Event types

| Event type | Emitted on | Aggregate |
|------------|------------|-----------|
| `CustomerCreated` | POST `/api/v1/customers` | `customer` |
| `CustomerUpdated` | PATCH `/api/v1/customers/{id}` | `customer` |

Factory helpers: `createCustomerCreatedEvent`, `createCustomerUpdatedEvent` in `packages/events/src/index.ts`.

## Envelope shape

```json
{
  "tenantId": "uuid",
  "actorId": "uuid",
  "aggregateType": "customer",
  "aggregateId": "uuid",
  "eventType": "CustomerCreated",
  "payload": {},
  "createdAt": "2026-06-21T00:00:00.000Z"
}
```

### CustomerCreated payload

```json
{
  "displayName": "Acme Corp"
}
```

### CustomerUpdated payload

```json
{
  "changes": {
    "displayName": "Acme Corporation"
  }
}
```

## Transport

Sprint-03 emits in-process via existing IAM event publisher pattern (same as Sprint-02 role events). No RabbitMQ in Sprint-03.

## QA references

- Assert event type and tenantId match JWT tenant on create/update
- Cross-tenant isolation: events must not leak aggregate IDs across tenants

See [sprint-03-customer-openapi.md](../api/sprint-03-customer-openapi.md).
