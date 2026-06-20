# CRM OS Event Workflow Canon v1

## Event Publishing Workflow

```text
Business action
→ database transaction
→ domain event creation
→ outbox/domain_events write
→ async dispatcher
→ consumers
→ workflow / notification / analytics / webhook
```

## Transaction Rule

Critical business events must be written in the same transaction as the state change.

Examples:

```text
CustomerCreated
LeadConverted
QuoteApproved
OrderConfirmed
PaymentReceived
StockReserved
PermissionGranted
```

## Consumer Rules

Consumers must be:

```text
idempotent
tenant-aware
permission-safe
retryable
observable
```

## Idempotency

Every consumer must store or check:

```text
eventId
consumerName
processedAt
status
```

## Retry Strategy

```text
immediate retry for transient errors
exponential backoff for external services
dead-letter queue after max attempts
manual replay for critical events
```

## Webhook Dispatch Rule

Only integration-safe events may be exposed externally.

External webhook payloads must be filtered versions of internal events.

## Workflow Trigger Rule

Workflows may subscribe to event types, but workflow execution must not bypass permissions.

Example:

```text
QuoteApproved
→ Create Order
→ Reserve Stock
→ Notify Customer
```

## Audit Rule

Audit log is not replaced by domain events.

Both are needed:

```text
domain_events = business facts
audit_logs = who changed what
```

## Timeline Rule

Customer-facing timelines are built from filtered event projections.

Not every event is timeline-visible.
