# CRM OS Webhook Canon v1

## 1. Webhook Mission

CRM OS, domain eventleri tenant bazlı webhook aboneliklerine güvenli şekilde yayınlar.

## 2. Webhook Entity

```txt
webhooks
webhook_events
webhook_logs
```

## 3. Event Subscription

Webhook şu eventlere abone olabilir:

```txt
CustomerCreated
CustomerUpdated
LeadCreated
LeadConverted
OpportunityWon
QuoteCreated
QuoteSent
QuoteApproved
OrderCreated
OrderDelivered
PaymentReceived
TicketCreated
TicketResolved
MessageReceived
WorkflowCompleted
AIActionCompleted
```

## 4. Delivery Payload

```json
{
  "id": "event_uuid",
  "tenantId": "tenant_uuid",
  "eventType": "CustomerCreated",
  "occurredAt": "2026-06-20T12:00:00Z",
  "aggregateType": "customer",
  "aggregateId": "uuid",
  "data": {},
  "meta": {
    "requestId": "uuid",
    "source": "crm-os"
  }
}
```

## 5. Security

Her webhook request imzalanır:

```txt
X-CRMOS-Signature
X-CRMOS-Timestamp
X-CRMOS-Event-Id
```

Signature:

```txt
HMAC-SHA256(secret, timestamp + "." + rawBody)
```

## 6. Retry Policy

```txt
attempt 1: immediate
attempt 2: +1 minute
attempt 3: +5 minutes
attempt 4: +30 minutes
attempt 5: +2 hours
```

Başarısız teslimatlar loglanır.

## 7. Idempotency

Alıcı sistem `X-CRMOS-Event-Id` ile idempotency sağlamalıdır.

## 8. Webhook Quality Gate

```txt
[ ] Tenant scoped.
[ ] Signature required.
[ ] Retry policy implemented.
[ ] Delivery logs visible.
[ ] Event payload stable.
[ ] Failed delivery does not block core transaction.
```
