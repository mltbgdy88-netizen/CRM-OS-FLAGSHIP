CRM OS AI Development Factory v1


1. Amaç


Cursor + AI Agent + Generator + CI/CD kullanarak
CRM OS Amiral Gemisi v1 üretimini hızlı, kontrollü ve testli şekilde yapmak.


Bu sistemin amacı:


Blueprint
→ Spec
→ Generator
→ Cursor Agent
→ Test
→ Review
→ CI/CD
→ Staging
→ UAT
→ Production


akışını standartlaştırmaktır.




2. Ana Üretim Hattı


Product Blueprint
↓
Sprint Factory Pack
↓
Module Spec
↓
Generator
↓
Cursor Agent
↓
Test Agent
↓
Review Agent
↓
CI Quality Gates
↓
Staging Deploy
↓
UAT
↓
Production Release




3. Repo AI Factory Yapısı


crm-os/
.cursor/
  rules/
  prompts/
  playbooks/
.ai/
  agents/
  specs/
  templates/
  generators/
  checklists/
  reviews/
specs/
  modules/
  sprints/
  api/
  db/
  ui/
  tests/
tools/
  generators/
  validators/
  scripts/




4. Cursor Rules


.cursor/rules/
├── architecture.md
├── backend.md
├── frontend.md
├── database.md
├── security.md
├── testing.md
├── permissions.md
├── rls.md
├── events.md
├── ui-design.md
└── devops.md


Temel kurallar:


Spec dışına çıkma.
Tenant isolation zorunlu.
Permission guard zorunlu.
RLS zorunlu.
Audit log kritik aksiyonlarda zorunlu.
Domain event kritik aksiyonlarda zorunlu.
Test yazmadan işi bitmiş sayma.
OpenAPI güncellemeden endpoint ekleme.




5. Agent Rolleri


Architect Agent
Backend Agent
Frontend Agent
Database Agent
QA Agent
Security Agent
Reviewer Agent
DevOps Agent
Documentation Agent
Release Agent


Her agent tek sorumluluk alır.




6. Module Spec Standardı


Her modül şu dosyalarla tanımlanır:


module.yaml
entities.yaml
api.yaml
permissions.yaml
events.yaml
ui.yaml
tests.yaml
acceptance.yaml


Örnek:


YAML
module: quote
sprint: 9
entities:
  - quotes
  - quote_items
permissions:
  - sales.quote.read
  - sales.quote.create
  - sales.quote.update
events:
  - QuoteCreated
  - QuoteItemAdded
ui:
  - /quotes
  - /quotes/[id]




7. Generator Sistemi


Tek komut hedefi:


Bash
pnpm generate:module quote


Üretilecekler:


NestJS module
DTO
Controller
Service
Repository
Entity
Migration
OpenAPI tags
Frontend routes
React Query hooks
Forms
Tables
Unit tests
Integration tests
Docs




8. Cursor Çalışma Modeli


Cursor’a şu verilmez:


“CRM yap”


Cursor’a şu verilir:


“specs/modules/quote/module.yaml dosyasına göre
backend quote module üret.
Kurallara uy.
Testleri yaz.
OpenAPI güncelle.”




9. PR Üretim Akışı


Agent branch açar
↓
Spec okur
↓
Kod üretir
↓
Test üretir
↓
Local validation çalıştırır
↓
PR açar
↓
Review Agent inceler
↓
CI geçer
↓
Human approval
↓
Merge


Branch standardı:


agent/sprint-09-quote-core
agent/sprint-10-quote-approval
agent/sprint-21-communication-core




10. Quality Gates


Her PR geçmeden:


lint
typecheck
unit tests
integration tests
migration check
OpenAPI validation
permission tests
tenant isolation tests
security scan


Release öncesi:


E2E tests
regression tests
performance smoke
security regression
UAT approval
rollback validation




11. Human Approval Gates


İnsan onayı zorunlu alanlar:


DB schema breaking change
Permission model change
RLS policy change
Financial calculation
Approval logic
AI data access
Public API contract
Security config
Production deploy




12. Test Factory


Her modül için otomatik test seti:


unit tests
integration tests
permission tests
tenant isolation tests
API contract tests
frontend component tests
Playwright E2E
security negative tests


Kritik kural:


Tenant isolation testi kırmızıysa merge yok.
Permission testi kırmızıysa merge yok.
Finance calculation testi kırmızıysa merge yok.




13. Review Agent Checklist


Spec’e uyuyor mu?
Tenant izolasyonu var mı?
Permission guard var mı?
RLS var mı?
Audit/event eksik mi?
Migration güvenli mi?
Testler yeterli mi?
OpenAPI güncel mi?
UI design system’e uyuyor mu?
Security leak var mı?




14. Security Agent Checklist


IDOR kontrolü
Tenant escape kontrolü
Sensitive field leakage
Secret logging
Public API scope
Webhook signature
Portal customer_self
Dealer isolation
AI context isolation




15. DevOps Factory


Docker build
Migration runner
Seed runner
Helm values
Staging deploy
Smoke tests
Rollback test
Monitoring dashboard
Alert rules




16. Documentation Factory


Her merge sonrası güncellenir:


OpenAPI
ERD
Data Dictionary
Permission Matrix
Event Catalog
Release Notes
Developer Docs
Admin Docs
UAT Scripts




17. Sprint Factory Kullanımı


Her sprint şu yapıda işlenir:


Sprint Factory Pack
↓
Module specs
↓
Agent task split
↓
Generator output
↓
Cursor implementation
↓
Tests
↓
Review
↓
Merge


Sprint sırası:


Sprint 1–12  MVP
Sprint 13–20 Commercial
Sprint 21–32 Enterprise
Sprint 33–40 AI & Analytics




18. Pilot Feedback Loop


Staging
↓
Pilot tenant
↓
UAT
↓
Bug triage
↓
Backlog update
↓
Patch release


Pilot metrikleri:


feature adoption
bug density
task completion time
user confusion points
performance complaints
missing workflow




19. Başarı Metrikleri


PR cycle time
test pass rate
automation coverage
bug escape rate
deployment frequency
rollback count
tenant isolation incidents
security findings
feature throughput




20. Final Operating Model


İnsan:
mimari karar
ürün kararı
kritik review
security approval
production approval
Cursor:
kod üretimi
test üretimi
refactor
dokümantasyon
tekrar eden işler
CI/CD:
doğrulama
quality gate
deploy
rollback
Pilot müşteri:
gerçek kullanım doğrulaması




21. Final Tanım


Cursor kod yazan editör değil,
CRM OS üretim fabrikasının kontrollü işçisidir.


Bu factory ile hedef:


Hızlı üretim
+
Mimari tutarlılık
+
Testli kod
+
Tenant güvenliği
+
Kurumsal kalite


Sonraki çıktı:


CRM OS Cursor Rules Pack v1
