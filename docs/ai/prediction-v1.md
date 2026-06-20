Sprint-36 Prediction Factory Pack v1


Sprint Objective


Sprint-35:
Summary → Recommendation → Next Best Action
Sprint-36:
CRM Data → Prediction → Risk Score → Win Probability → Action Recommendation


Bu sprint sonunda CRM OS tahmin üreten akıllı satış/finans destek katmanına geçer.




Factory Metadata


YAML
sprint: 36
name: Prediction
duration: 2 weeks
depends_on:
  - Sprint-33 AI Gateway
  - Sprint-34 Ask CRM
  - Sprint-35 Summaries & Recommendations
  - Sprint-18 Finance Lite
  - Sprint-23 Ticket Core
output:
  - lead scoring
  - opportunity win probability
  - customer churn/risk score
  - payment risk score
  - prediction widgets
  - prediction audit logs




Business Scope


Included:
Lead score
Opportunity win probability
Customer risk score
Payment risk score
Prediction explanations
Prediction history
Prediction refresh
Prediction widgets
Recommendation integration
Excluded:
Custom ML training pipeline
Auto model retraining
Real-time sales copilot
Autonomous actions
External data enrichment




Domain Model


YAML
ai_predictions:
  id: uuid
  tenant_id: uuid
  entity_type: string
  entity_id: uuid
  prediction_type: string
  score: decimal(5,2)
  label: string
  explanation: text
  factors_json: jsonb
  model_id: uuid
  status: enum
  created_at: timestamp
ai_prediction_history:
  id: uuid
  tenant_id: uuid
  prediction_id: uuid
  old_score: decimal(5,2)
  new_score: decimal(5,2)
  changed_reason: text
  created_at: timestamp




Prediction Types


lead_score
opportunity_win_probability
customer_churn_risk
payment_risk
ticket_escalation_risk




Score Labels


0-30   low
31-60  medium
61-80  high
81-100 critical




Events


YAML
events:
  - AILeadScoreCalculated
  - AIOpportunityWinProbabilityCalculated
  - AICustomerRiskCalculated
  - AIPaymentRiskCalculated
  - AIPredictionRefreshed
  - AIPredictionFailed




Permissions


YAML
permissions:
  - ai.prediction.read
  - ai.prediction.generate
  - ai.prediction.refresh
  - ai.prediction.history.read




API Contract


http
POST /api/v1/ai/predict/lead-score/{leadId}
POST /api/v1/ai/predict/opportunity-win/{opportunityId}
POST /api/v1/ai/predict/customer-risk/{customerId}
POST /api/v1/ai/predict/payment-risk/{customerId}
GET  /api/v1/ai/predictions/{entityType}/{entityId}
GET  /api/v1/ai/predictions/{id}/history
POST /api/v1/ai/predictions/{id}/refresh




Prediction Inputs


Lead Score:
source
segment
activity count
response time
assigned rep
previous conversions
Opportunity Win:
stage
amount
stage age
activity count
quote status
customer history
competitor/lost reason history
Customer Risk:
inactive days
open tickets
overdue payments
declining order volume
negative interactions
Payment Risk:
overdue history
open balance
payment delay average
installment status
credit limit usage




Business Rules


Prediction sadece kullanıcının yetkili olduğu veriyle çalışır.
Prediction açıklaması faktör bazlı olmalıdır.
Score otomatik aksiyon almaz; sadece öneri üretir.
Risk yüksekse recommendation oluşturabilir.
Her prediction usage log yazar.
Her prediction audit event üretir.
Tenant izolasyonu zorunludur.




PostgreSQL Migration Pack


SQL
ai_predictions
ai_prediction_history


Indexes:


SQL
idx_ai_predictions_entity
idx_ai_predictions_type
idx_ai_predictions_score
idx_ai_prediction_history_prediction


RLS:


tenant_id enforced




NestJS Source Tree


modules/ai/
├── predictions/
├── predictors/
│   ├── lead-score.predictor.ts
│   ├── opportunity-win.predictor.ts
│   ├── customer-risk.predictor.ts
│   └── payment-risk.predictor.ts
├── prediction-history/
├── dto/
├── events/
└── tests/




Frontend Scope


Routes:


/ai/predictions
/customers/[id]/predictions
/leads/[id]/predictions
/opportunities/[id]/predictions
/finance/payment-risk


Components:


PredictionScoreCard
PredictionFactorList
RiskBadge
WinProbabilityGauge
PredictionHistoryTable
RefreshPredictionButton
PredictionRecommendationCard




Cursor Agent Tasks


Backend Agent


YAML
generate:
  - prediction module
  - lead score predictor
  - opportunity win predictor
  - customer risk predictor
  - payment risk predictor
  - prediction history
  - recommendation integration
  - tests


Frontend Agent


YAML
generate:
  - prediction score cards
  - risk widgets
  - win probability UI
  - prediction history table
  - refresh action


QA Agent


YAML
generate:
  - prediction tests
  - permission tests
  - tenant isolation tests
  - factor explanation tests
  - usage log tests




Test Factory


calculate lead score
calculate opportunity win probability
calculate customer risk
calculate payment risk
prediction history created
prediction refresh works
high risk creates recommendation
unauthorized prediction blocked
cross tenant prediction blocked
usage log created




Quality Gates


lint
typecheck
unit tests
integration tests
AI gateway tests
permission tests
tenant isolation tests
prediction explanation tests
OpenAPI validation




Definition of Done


Lead score çalışıyor
Opportunity win probability çalışıyor
Customer risk çalışıyor
Payment risk çalışıyor
Prediction factors gösteriliyor
Prediction history oluşuyor
Refresh çalışıyor
Recommendation entegrasyonu çalışıyor
Usage log oluşuyor
Permission kontrolü çalışıyor
Tenant izolasyonu geçiyor
Tests passing




Output Package


CRM Data
→ Prediction
→ Score
→ Explanation
→ Risk/Opportunity Insight
→ Recommendation


Sonraki üretim paketi:


Sprint-37 Analytics Core Factory Pack v1
