Sprint-34 Ask CRM Factory Pack v1


Sprint Objective


Sprint-33:
AI Provider → AI Gateway → Safety Guard → Quota → Usage Log
Sprint-34:
User Question → Ask CRM → Permission-Aware Context → Safe Query → Answer → Citations


Bu sprint sonunda kullanıcı CRM verisine doğal dil ile soru sorabilir.




Factory Metadata


YAML
sprint: 34
name: Ask CRM
duration: 2 weeks
depends_on:
  - Sprint-33 AI Gateway
  - Sprint-12 Dashboard
  - Sprint-18 Finance Lite
  - Sprint-31 Enterprise Security
output:
  - ask crm module
  - natural language query interface
  - permission-aware context loader
  - safe query planner
  - answer generator
  - citation system




Business Scope


Included:
Ask CRM input
Natural language question parsing
Permission-aware context loading
Read-only query planner
Safe SQL policy
CRM metric question answering
Record citations
Answer history
AI usage logging
AI audit trail
Excluded:
Autonomous actions
Write/update/delete AI commands
Advanced RAG
Document search
Predictive analytics
Voice assistant




Supported Questions v1


Bu ay kaç teklif gönderildi?
Bu ay en çok satış yapan temsilci kim?
Vadesi geçen alacaklar toplamı nedir?
En yüksek tutarlı açık fırsatlar hangileri?
Son 30 günde kazanılan fırsatların toplamı nedir?
Bugün geciken görevler kimlerde?
En çok teklif verilen müşteriler hangileri?
Stokta azalan ürünler hangileri?




Domain Model


YAML
ask_crm_queries:
  id: uuid
  tenant_id: uuid
  user_id: uuid
  question: text
  normalized_intent: string
  status: enum
  answer_text: text
  sql_hash: string
  latency_ms: integer
  created_at: timestamp
ask_crm_citations:
  id: uuid
  tenant_id: uuid
  query_id: uuid
  entity_type: string
  entity_id: uuid
  label: string
  metadata_json: jsonb
  created_at: timestamp
ask_crm_allowed_metrics:
  id: uuid
  tenant_id: uuid
  metric_key: string
  description: text
  required_permission: string
  query_template_key: string
  is_active: boolean




Status Values


query_status:
pending
completed
failed
blocked




Events


YAML
events:
  - AskCrmQuestionAsked
  - AskCrmQueryPlanned
  - AskCrmQueryExecuted
  - AskCrmAnswerGenerated
  - AskCrmQueryBlocked
  - AskCrmCitationCreated




Permissions


YAML
permissions:
  - ai.ask_crm.use
  - ai.ask_crm.history.read
  - ai.ask_crm.admin
  - analytics.metric.read
  - finance.receivable.read
  - sales.opportunity.read
  - sales.quote.read
  - crm.customer.read
  - inventory.read




API Contract


http
POST /api/v1/ai/ask-crm
GET  /api/v1/ai/ask-crm/history
GET  /api/v1/ai/ask-crm/history/{id}
GET  /api/v1/ai/ask-crm/allowed-metrics
POST /api/v1/ai/ask-crm/feedback


Request:


JSON
{
  "question": 
"Bu ay en çok teklif verilen müşteriler kimler?"
}


Response:


JSON
{
  "answer": 
"Bu ay en çok teklif verilen müşteriler..."
,
  "citations": [
    {
      "entityType": 
"customer"
,
      "entityId": 
"uuid"
,
      "label": 
"ABC Mimarlık"
    }
  ],
  "confidence": 
0.86
}




Safe Query Policy


Only SELECT queries
No INSERT
No UPDATE
No DELETE
No DDL
No raw arbitrary SQL
Tenant filter mandatory
Permission filter mandatory
LIMIT mandatory
Timeout mandatory
Read replica preferred




Query Planning Strategy


v1 yaklaşımı:


Natural language question
↓
Intent classifier
↓
Allowed metric matcher
↓
Permission check
↓
Template-based SQL builder
↓
Safe query validator
↓
Execute read-only
↓
Generate answer
↓
Attach citations


Cursor/AI serbest SQL üretmeyecek. İlk sürümde sadece onaylı metric template çalışacak.




Metric Templates v1


YAML
metrics:
  - key: quotes.sent_this_month
    permission: sales.quote.read
    output: count
  - key: opportunities.open_high_value
    permission: sales.opportunity.read
    output: list
  - key: receivables.overdue_total
    permission: finance.receivable.read
    output: amount
  - key: tasks.overdue_by_user
    permission: crm.task.read
    output: grouped_count
  - key: inventory.low_stock
    permission: inventory.read
    output: list
  - key: customers.top_by_quote_count
    permission: crm.customer.read
    output: list




PostgreSQL Migration Pack


SQL
ask_crm_queries
ask_crm_citations
ask_crm_allowed_metrics


Indexes:


SQL
idx_ask_crm_queries_user
idx_ask_crm_queries_created
idx_ask_crm_citations_query
idx_ask_crm_metrics_key


RLS:


tenant_id enforced on all Ask CRM tables




NestJS Source Tree


modules/ai/ask-crm/
├── ask-crm.controller.ts
├── ask-crm.service.ts
├── intent-classifier.service.ts
├── metric-template-registry.ts
├── safe-query-builder.ts
├── safe-query-validator.ts
├── citation-builder.ts
├── answer-generator.ts
├── dto/
├── events/
└── tests/




Frontend Scope


Routes:


/ai/ask
/ai/ask/history


Components:


AskCrmInput
AskCrmAnswerPanel
AskCrmCitationList
AskCrmConfidenceBadge
AskCrmHistoryList
AskCrmSuggestedQuestions
AskCrmFeedbackButtons




UX Rules


Cevap kısa ve net olmalı.
Kullanılan kayıtlar citation olarak gösterilmeli.
Yetkisiz veri için “Bu veriye erişim izniniz yok” dönmeli.
AI emin değilse uydurmamalı.
Sorgu başarısızsa teknik hata kullanıcıya sade gösterilmeli.




Business Rules


Kullanıcı sadece yetkili olduğu metric/template’leri çalıştırabilir.
Field-level restricted data maskelenir.
Ask CRM finansal veri için finance permission ister.
Citations kullanıcı izinlerine göre filtrelenir.
Her soru usage log ve audit event üretir.
Blocked query de loglanır.




Cursor Agent Tasks


Backend Agent


YAML
generate:
  - ask crm module
  - intent classifier
  - metric template registry
  - safe query builder
  - safe query validator
  - citation builder
  - answer generator
  - tests


Frontend Agent


YAML
generate:
  - ask crm screen
  - input component
  - answer panel
  - citations list
  - history screen
  - feedback buttons


QA Agent


YAML
generate:
  - intent tests
  - metric permission tests
  - safe query tests
  - citation tests
  - tenant isolation tests
  - blocked query tests




Test Factory


ask question
match allowed metric
deny unauthorized metric
block unsafe query
execute read-only query
return answer
return citations
mask restricted field
log usage
cross tenant query blocked




Quality Gates


lint
typecheck
unit tests
integration tests
safe query tests
permission tests
tenant isolation tests
AI usage log tests
OpenAPI validation




Definition of Done


Ask CRM ekranı çalışıyor
Kullanıcı doğal dilde soru sorabiliyor
Intent allowed metric’e eşleşiyor
Permission kontrolü çalışıyor
Safe query validator çalışıyor
Read-only query çalışıyor
Answer üretiliyor
Citation gösteriliyor
Usage log oluşuyor
Audit event oluşuyor
Tenant izolasyonu geçiyor
Tests passing




Output Package


User Question
→ Ask CRM
→ Safe Query
→ Permission Check
→ Answer
→ Citations


Sonraki üretim paketi:


Sprint-35 Summaries & Recommendations Factory Pack v1
