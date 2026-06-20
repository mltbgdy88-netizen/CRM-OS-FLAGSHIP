# CRM OS API Canon v1

## API Standard

Base path:

```text
/api/v1
```

## Response Format

```json
{
  "data": {},
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-06-19T12:00:00Z"
  }
}
```

## Error Format

```json
{
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Customer not found",
    "details": {}
  }
}
```

## Endpoint Pattern

```text
GET    /customers
POST   /customers
GET    /customers/{id}
PATCH  /customers/{id}
DELETE /customers/{id}

POST /leads/{id}/convert
POST /quotes/{id}/send
POST /quotes/{id}/approve
POST /quotes/{id}/convert-to-order
POST /orders/{id}/reserve-stock
POST /payments
```

## API Rules

- Every endpoint must be tenant scoped unless public by design.
- Every protected endpoint must use PermissionGuard.
- Every mutation must validate request body.
- Every mutation must write audit log where business-critical.
- Every business-critical mutation must emit domain event.
- OpenAPI must be updated with every endpoint.
- Public API and Webhook API must have rate limits.
- Webhooks must use signature verification.
