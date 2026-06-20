# CRM OS Event Payload Canon v1

## Payload Rule

Payloads must be small, tenant-safe, versioned and stable.

Do not put full database rows into events.

## Required Envelope

Every event must use the standard event envelope defined in `event-canon-v1.md`.

## Payload Examples

### CustomerCreated

```json
{
  "customerId": "uuid",
  "customerType": "corporate",
  "displayName": "Acme Ltd",
  "assignedUserId": "uuid",
  "source": "manual"
}
```

### LeadConverted

```json
{
  "leadId": "uuid",
  "customerId": "uuid",
  "opportunityId": "uuid",
  "convertedBy": "uuid"
}
```

### OpportunityStageChanged

```json
{
  "opportunityId": "uuid",
  "fromStageId": "uuid",
  "toStageId": "uuid",
  "probability": 50
}
```

### QuoteApproved

```json
{
  "quoteId": "uuid",
  "approvedBy": "uuid",
  "totalAmount": 12000.00,
  "currency": "TRY",
  "approvalRequestId": "uuid"
}
```

### OrderDelivered

```json
{
  "orderId": "uuid",
  "deliveredAt": "2026-06-20T12:00:00Z",
  "shipmentId": "uuid"
}
```

### PaymentReceived

```json
{
  "paymentId": "uuid",
  "accountId": "uuid",
  "amount": 5000.00,
  "currency": "TRY",
  "paymentDate": "2026-06-20"
}
```

### AIActionCompleted

```json
{
  "aiRunId": "uuid",
  "agentId": "uuid",
  "actionType": "summarize",
  "targetEntityType": "customer",
  "targetEntityId": "uuid",
  "reviewedBy": "uuid"
}
```

## Forbidden Payload Data

Do not include:

```text
passwords
tokens
secret keys
raw file contents
full payment card data
cross-tenant records
large binary data
unredacted sensitive PII unless explicitly required
```

## Versioning

When payload shape changes:

```text
version: 2
```

Consumers must support backward compatibility during migrations.
