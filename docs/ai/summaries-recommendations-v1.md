Sprint-35 Summaries & Recommendations Factory Pack v1


Sprint Objective


Sprint-34:
Ask CRM → Safe Query → Answer → Citations
Sprint-35:
CRM Records → AI Summary → AI Recommendation → Next Best Action


Bu sprint sonunda CRM OS, müşteri, fırsat, konuşma ve ticket kayıtlarını özetleyip kullanıcıya aksiyon önerileri sunabilir.




Factory Metadata


YAML
sprint: 35
name: Summaries & Recommendations
duration: 2 weeks
depends_on:
  - Sprint-33 AI Gateway
  - Sprint-34 Ask CRM
  - Sprint-21 Communication Core
  - Sprint-23 Ticket Core
  - Sprint-24 SLA
output:
  - AI summaries
  - AI recommendation engine v1
  - next best action cards
  - customer/opportunity/ticket summaries
  - recommendation feedback




Business Scope


Included:
Customer summary
Opportunity summary
Conversation summary
Ticket summary
Quote summary
Next best action
Recommendation cards
Recommendation accept/dismiss
AI summary cache
AI feedback logging
Excluded:
Predictive scoring
Lead score model
Win probability model
Autonomous AI actions
Real-time sales copilot




Domain Model


YAML
ai_summaries:
  id: uuid
  tenant_id: uuid
  entity_type: string
  entity_id: uuid
  summary_text: text
  model_id: uuid
  generated_by_user_id: uuid
  status: enum
  created_at: timestamp
ai_recommendations:
  id: uuid
  tenant_id: uuid
  entity_type: string
  entity_id: uuid
  recommendation_type: string
  title: string
  description: text
  priority: enum
  status: enum
  confidence_score: decimal(5,2)
  created_at: timestamp
ai_recommendation_feedback:
  id: uuid
  tenant_id: uuid
  recommendation_id: uuid
  user_id: uuid
  feedback_type: enum
  note: text
  created_at: timestamp




Status Values


summary:
pending
completed
failed
recommendation:
new
accepted
dismissed
expired
priority:
low
medium
high
critical
feedback:
accepted
dismissed
useful
not_useful




Events


YAML
events:
  - AISummaryRequested
  - AISummaryGenerated
  - AISummaryFailed
  - AIRecommendationCreated
  - AIRecommendationAccepted
  - AIRecommendationDismissed
  - AIFeedbackSubmitted




Permissions


YAML
permissions:
  - ai.summary.generate
  - ai.summary.read
  - ai.recommendation.read
  - ai.recommendation.accept
  - ai.recommendation.dismiss
  - ai.feedback.create




API Contract


http
POST /api/v1/ai/summaries/customer/{customerId}
POST /api/v1/ai/summaries/opportunity/{opportunityId}
POST /api/v1/ai/summaries/conversation/{conversationId}
POST /api/v1/ai/summaries/ticket/{ticketId}
POST /api/v1/ai/summaries/quote/{quoteId}
GET  /api/v1/ai/summaries/{entityType}/{entityId}
GET  /api/v1/ai/recommendations
GET  /api/v1/ai/recommendations/{entityType}/{entityId}
POST /api/v1/ai/recommendations/{id}/accept
POST /api/v1/ai/recommendations/{id}/dismiss
POST /api/v1/ai/recommendations/{id}/feedback




Summary Sources


Customer:
customer profile
contacts
timeline
quotes
orders
payments
tickets
activities
Opportunity:
opportunity data
stage history
activities
quote data
customer context
Conversation:
messages
customer context
assigned user
status history
Ticket:
ticket messages
SLA
resolution notes
customer context
Quote:
items
pricing
status history
approval history




Recommendation Types


follow_up_customer
create_task
contact_inactive_customer
review_high_value_opportunity
send_quote_reminder
collect_overdue_payment
escalate_ticket
update_missing_customer_data




Business Rules


AI sadece kullanıcının görebildiği veriden özet üretir.
Restricted field’lar maskelenir.
Summary cache kullanılabilir.
Eski summary manuel yenilenebilir.
Recommendation aksiyon değildir; öneridir.
Kritik işlemler insan onayı olmadan yapılmaz.
Her AI çağrısı usage log yazar.
Tenant izolasyonu zorunludur.




PostgreSQL Migration Pack


SQL
ai_summaries
ai_recommendations
ai_recommendation_feedback


Indexes:


SQL
idx_ai_summaries_entity
idx_ai_recommendations_entity
idx_ai_recommendations_status
idx_ai_recommendations_priority
idx_ai_feedback_recommendation


RLS:


tenant_id enforced on all AI summary/recommendation tables




NestJS Source Tree


modules/ai/
├── summaries/
├── recommendations/
├── context-loaders/
├── feedback/
├── dto/
├── events/
└── tests/




Frontend Scope


Routes:


/ai/recommendations
/customers/[id]/ai
/opportunities/[id]/ai
/tickets/[id]/ai
/conversations/[id]/ai


Components:


AiSummaryBox
AiSummaryRefreshButton
AiRecommendationCard
NextBestActionPanel
AiConfidenceBadge
AiFeedbackButtons
RecommendationPriorityBadge




Cursor Agent Tasks


Backend Agent


YAML
generate:
  - summary service
  - entity context loaders
  - recommendation service
  - feedback service
  - AI Gateway integration
  - tests


Frontend Agent


YAML
generate:
  - summary panels
  - recommendation cards
  - next best action panel
  - feedback buttons
  - AI tabs on customer/opportunity/ticket pages


QA Agent


YAML
generate:
  - summary tests
  - recommendation tests
  - permission tests
  - masking tests
  - tenant isolation tests
  - AI usage log tests




Test Factory


generate customer summary
generate opportunity summary
generate conversation summary
generate ticket summary
create recommendation
accept recommendation
dismiss recommendation
submit feedback
masked restricted fields
cross tenant summary blocked
unauthorized entity blocked
usage log created




Quality Gates


lint
typecheck
unit tests
integration tests
AI gateway tests
permission tests
tenant isolation tests
PII masking tests
OpenAPI validation




Definition of Done


Customer summary çalışıyor
Opportunity summary çalışıyor
Conversation summary çalışıyor
Ticket summary çalışıyor
Recommendation card oluşuyor
Accept/dismiss çalışıyor
Feedback kaydı oluşuyor
Permission kontrolü çalışıyor
PII masking çalışıyor
Usage log oluşuyor
Tenant izolasyonu geçiyor
Tests passing




Output Package


CRM Record
→ AI Context
→ Summary
→ Recommendation
→ Next Best Action
→ Feedback


Sonraki üretim paketi:


Sprint-36 Prediction Factory Pack v1
