# CRM OS Event Canon Layer v1

## Purpose

This canon defines the official event model for CRM OS.

It is the source of truth for:

- Domain events
- Integration events
- Audit events
- Workflow events
- Notification events
- AI events
- Event naming
- Event payload rules
- Event publishing rules
- Event consumer rules

If any document conflicts with this canon, this canon wins.

## Event Architecture

CRM OS starts as a Modular Monolith with Event-Driven Architecture.

Events are used for:

1. Decoupling bounded contexts
2. Building timelines
3. Triggering workflows
4. Sending notifications
5. Feeding analytics
6. Creating audit visibility
7. Supporting integrations and webhooks
8. Supporting AI summaries, recommendations and predictions

## Event Types

```text
DomainEvent
IntegrationEvent
AuditEvent
WorkflowEvent
NotificationEvent
AIEvent
SystemEvent
```

## Event Transport

Initial implementation:

```text
Application Event Bus
PostgreSQL domain_events table
BullMQ jobs where async execution is needed
RabbitMQ when cross-process eventing is enabled
```

Future implementation:

```text
Dedicated event bus
Outbox pattern
Event replay for analytics
Webhook dispatch pipeline
```

## Required Event Envelope

```json
{
  "eventId": "uuid",
  "eventType": "CustomerCreated",
  "tenantId": "uuid",
  "aggregateType": "customer",
  "aggregateId": "uuid",
  "actorUserId": "uuid",
  "occurredAt": "2026-06-20T12:00:00Z",
  "correlationId": "uuid",
  "causationId": "uuid",
  "source": "crm",
  "version": 1,
  "payload": {}
}
```

## Non-Negotiable Rules

- Every business event must include tenantId.
- Every event must include eventId.
- Every event must include occurredAt.
- Every event must include aggregateType and aggregateId where applicable.
- Events must not contain secrets.
- Events must not leak cross-tenant data.
- Sensitive payloads must be minimized.
- Events that trigger external webhooks must pass permission and subscription checks.
- AI-generated actions must create AI review/audit events.
- Events that mutate financial, inventory, permission, approval, or security data must be audit-linked.

## Naming Standard

```text
<Entity><PastTenseAction>
```

Examples:

```text
CustomerCreated
LeadConverted
QuoteApproved
OrderShipped
PaymentReceived
TicketResolved
AIActionCompleted
```

Do not use vague names:

```text
Updated
Changed
Done
ProcessFinished
```

## Event Catalog Groups

- Core & Tenant
- IAM & Security
- CRM & Customer
- Lead
- Sales & Opportunity
- Quote
- Order
- Product & Inventory
- Finance
- Task & Activity
- Communication & Inbox
- Support & Ticket
- Workflow & Approval
- Integration & Webhook
- AI
- Reporting & Analytics
- Data Quality
- System Operations

## Storage Canon

Canonical table:

```text
domain_events
```

Minimum fields:

```text
id uuid primary key
tenant_id uuid not null
event_type varchar(100) not null
aggregate_type varchar(80) not null
aggregate_id uuid not null
actor_user_id uuid null
correlation_id uuid null
causation_id uuid null
source varchar(80) not null
version int not null default 1
payload jsonb not null
published_at timestamptz null
created_at timestamptz not null default now()
```

## Index Canon

```sql
CREATE INDEX idx_domain_events_tenant_created_at
ON domain_events (tenant_id, created_at DESC);

CREATE INDEX idx_domain_events_aggregate
ON domain_events (tenant_id, aggregate_type, aggregate_id);

CREATE INDEX idx_domain_events_event_type
ON domain_events (tenant_id, event_type);
```

## RLS Canon

```sql
ALTER TABLE domain_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_domain_events
ON domain_events
USING (tenant_id = current_setting('app.tenant_id')::uuid);
```
