Sprint-30 Webhook Platform Factory Pack v1


Sprint Objective


Sprint-29:
External App → API Key → Scoped Public API → Usage Logs
Sprint-30:
Domain Event → Webhook Subscription → Signed Delivery → Retry → DLQ → Delivery Logs


Bu sprint sonunda CRM OS dış sistemlere güvenli, izlenebilir ve tekrar denenebilir webhook gönderebilir.




Factory Metadata


YAML
sprint: 30
name: Webhook Platform
duration: 2 weeks
depends_on:
  - Sprint-29 Public API
  - Sprint-12 Notification
  - Sprint-20 Workflow
  - Domain Events / Outbox
output:
  - webhook subscriptions
  - webhook event routing
  - HMAC signed delivery
  - retry mechanism
  - dead letter queue
  - webhook delivery logs
  - webhook test tool




Business Scope


Included:
Webhook CRUD
Webhook event subscriptions
Webhook secret generation
HMAC signature
Timestamp replay protection
Webhook delivery worker
Retry policy
Dead letter queue
Delivery attempts
Webhook logs
Webhook test button
Webhook disable on repeated failure
Excluded:
Marketplace apps
OAuth app installation
Partner approval flow
Webhook transformation UI
Custom payload scripting




Domain Model


YAML
webhooks:
  id: uuid
  tenant_id: uuid
  name: string
  target_url: string
  secret_hash: string
  status: enum
  created_by_user_id: uuid
  created_at: timestamp
  updated_at: timestamp
  disabled_at: timestamp
webhook_event_subscriptions:
  id: uuid
  tenant_id: uuid
  webhook_id: uuid
  event_type: string
  is_active: boolean
  created_at: timestamp
webhook_delivery_logs:
  id: uuid
  tenant_id: uuid
  webhook_id: uuid
  event_id: uuid
  event_type: string
  status: enum
  response_status_code: integer
  response_body: text
  duration_ms: integer
  attempt_count: integer
  next_retry_at: timestamp
  created_at: timestamp
  delivered_at: timestamp
webhook_delivery_attempts:
  id: uuid
  tenant_id: uuid
  delivery_log_id: uuid
  attempt_no: integer
  status: enum
  response_status_code: integer
  response_body: text
  error_message: text
  duration_ms: integer
  attempted_at: timestamp




Status Values


webhook:
active
disabled
delivery:
pending
delivered
failed
retrying
dead_letter
attempt:
success
failed
timeout




Events Supported in v1


CustomerCreated
CustomerUpdated
LeadCreated
LeadConverted
OpportunityCreated
OpportunityStageChanged
OpportunityWon
OpportunityLost
QuoteCreated
QuoteSent
QuoteApproved
QuoteRejected
OrderCreated
OrderConfirmed
OrderCancelled
InvoiceCreated
PaymentReceived
TicketCreated
TicketResolved




Events


YAML
events:
  - WebhookCreated
  - WebhookUpdated
  - WebhookDisabled
  - WebhookDeleted
  - WebhookDeliveryRequested
  - WebhookDelivered
  - WebhookFailed
  - WebhookMovedToDeadLetter
  - WebhookTestRequested




Permissions


YAML
permissions:
  - integration.webhook.read
  - integration.webhook.create
  - integration.webhook.update
  - integration.webhook.delete
  - integration.webhook.test
  - integration.webhook.log.read




API Contract


http
GET    /api/v1/webhooks
POST   /api/v1/webhooks
GET    /api/v1/webhooks/{id}
PATCH  /api/v1/webhooks/{id}
DELETE /api/v1/webhooks/{id}
POST   /api/v1/webhooks/{id}/test
GET    /api/v1/webhook-events
GET    /api/v1/webhook-logs
GET    /api/v1/webhook-logs/{id}
POST   /api/v1/webhook-logs/{id}/retry


Create request:


JSON
{
  "name": 
"ERP Order Sync"
,
  "targetUrl": 
"https://example.com/webhooks/crmos"
,
  "events": [
    
"OrderCreated"
,
    
"PaymentReceived"
  ]
}




Webhook Headers


http
X-CRMOS-Event: OrderCreated
X-CRMOS-Delivery-Id: uuid
X-CRMOS-Timestamp: 2026-06-20T12:00:00Z
X-CRMOS-Signature: sha256=<hmac>
X-CRMOS-Tenant-Id: uuid


Signature:


HMAC_SHA256(secret, timestamp + "." + raw_body)


Replay rule:


receiver should reject timestamp older than 5 minutes




Payload Standard


JSON
{
  "id": 
"event_uuid"
,
  "type": 
"OrderCreated"
,
  "tenantId": 
"uuid"
,
  "occurredAt": 
"2026-06-20T12:00:00Z"
,
  "data": {
    "orderId": 
"uuid"
  }
}


Payload kuralı:


Secret yok
Token yok
Internal cost/margin yok
Gereksiz PII yok
schemaVersion zorunlu




Business Rules


Webhook target_url HTTPS olmalıdır.
Secret sadece create sırasında bir kez gösterilir.
DB’de secret hash tutulur.
Her domain event için aktif subscription aranır.
Her delivery log yazılır.
Başarılı response: HTTP 2xx.
Timeout: 10 saniye.
Retry exponential backoff ile yapılır.
5 başarısız denemeden sonra dead_letter olur.
Disabled webhook delivery almaz.
Webhook test gerçek event üretmez; test payload gönderir.




Retry Policy


Attempt 1: immediate
Attempt 2: +1 minute
Attempt 3: +5 minutes
Attempt 4: +30 minutes
Attempt 5: +2 hours
After 5 failed attempts: dead_letter




PostgreSQL Migration Pack


SQL
webhooks
webhook_event_subscriptions
webhook_delivery_logs
webhook_delivery_attempts


Indexes:


SQL
idx_webhooks_tenant
idx_webhooks_status
idx_webhook_subscriptions_event
idx_webhook_delivery_logs_webhook
idx_webhook_delivery_logs_status
idx_webhook_delivery_logs_event
idx_webhook_attempts_delivery


RLS:


tenant_id enforced on all webhook tables




Queue / Worker Pack


Queues:


YAML
queues:
  - webhook.queue
  - webhook.dlq


Processors:


YAML
processors:
  - WebhookDispatchProcessor
  - WebhookRetryProcessor
  - WebhookDeadLetterProcessor


Worker flow:


Domain event published
↓
Webhook subscription matcher
↓
Delivery log created
↓
webhook.queue job
↓
HTTP POST target_url
↓
2xx = delivered
↓
non-2xx/timeout = retry
↓
max retry = DLQ




NestJS Source Tree


modules/integration/
├── webhooks/
│   ├── webhooks.controller.ts
│   ├── webhooks.service.ts
│   ├── webhooks.repository.ts
│   └── dto/
├── webhook-events/
├── webhook-delivery/
│   ├── webhook-dispatch.processor.ts
│   ├── webhook-signature.service.ts
│   ├── webhook-retry.service.ts
│   └── webhook-payload.service.ts
├── webhook-logs/
├── events/
└── tests/




Frontend Scope


Routes:


/settings/webhooks
/settings/webhooks/[id]
/settings/webhooks/logs


Components:


WebhookList
WebhookCreateModal
WebhookEventSelector
WebhookSecretRevealBox
WebhookDetail
WebhookStatusBadge
WebhookDeliveryLogTable
WebhookDeliveryAttemptTimeline
WebhookTestButton
WebhookRetryButton




Cursor Agent Tasks


Backend Agent


YAML
generate:
  - webhook CRUD
  - event subscription matcher
  - HMAC signature service
  - delivery worker
  - retry service
  - DLQ logic
  - delivery logs API
  - tests


Frontend Agent


YAML
generate:
  - webhook settings screen
  - create webhook modal
  - event selector
  - secret reveal UI
  - delivery logs table
  - attempt timeline
  - test/retry buttons


QA Agent


YAML
generate:
  - webhook CRUD tests
  - signature tests
  - delivery tests
  - retry tests
  - DLQ tests
  - permission tests
  - tenant isolation tests




Test Factory


create webhook
secret shown once
secret hash stored
subscribe to event
domain event creates delivery log
webhook sends signed request
2xx marks delivered
500 triggers retry
timeout triggers retry
5 failures move to DLQ
disabled webhook ignored
invalid target URL rejected
cross tenant webhook access blocked
missing permission denied




Quality Gates


lint
typecheck
unit tests
integration tests
worker tests
signature tests
retry tests
DLQ tests
permission tests
tenant isolation tests
OpenAPI validation




Definition of Done


Webhook oluşturulabiliyor
Event subscription seçilebiliyor
Secret sadece bir kez gösteriliyor
HMAC signature çalışıyor
Domain event webhook delivery oluşturuyor
Delivery worker HTTP POST gönderiyor
Retry policy çalışıyor
DLQ çalışıyor
Delivery logs görüntüleniyor
Manual retry çalışıyor
Webhook test çalışıyor
Permission kontrolü çalışıyor
Tenant izolasyonu geçiyor
Tests passing




Output Package


Domain Event
→ Webhook Subscription
→ Signed Delivery
→ Retry
→ DLQ
→ Delivery Logs


Sonraki üretim paketi:


Sprint-31 Enterprise Security Factory Pack v1
