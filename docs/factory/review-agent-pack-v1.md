CRM OS Review Agent Pack v1


1. Amaç


Cursor tarafından üretilen PR’ları otomatik incelemek,
mimari dışına çıkan, güvenlik açığı oluşturan veya test eksikliği olan işleri merge’den önce yakalamak.




2. Review Agent Görevi


Spec compliance
Architecture compliance
Security compliance
Permission control
Tenant isolation
Test coverage
OpenAPI consistency
Migration safety
Code quality




3. Review Input


Pull Request diff
Sprint Factory Pack
Module specs
.cursor/rules/*
AGENTS.md
CI output
Test reports
OpenAPI diff
Migration diff




4. Review Output


YAML
status: approve | request_changes | block
summary: 
"Short review summary"
blocking_issues:
  - severity: critical
    file: apps/api/src/modules/quote/quote.controller.ts
    issue: 
"Missing PermissionGuard on approve endpoint"
    required_fix: 
"Add @RequirePermission('sales.quote.approve')"
non_blocking_suggestions:
  - file: apps/web/src/features/quote/quote-form.tsx
    suggestion: 
"Extract pricing panel into separate component"
checklist:
  tenant_isolation: pass
  permission_guards: fail
  tests: pass
  openapi: pass




5. Review Checklist


Spec dışına çıkılmış mı?
İlgisiz dosya değiştirilmiş mi?
Endpoint permission içeriyor mu?
TenantGuard var mı?
RLS etkilenmiş mi?
Audit log eksik mi?
Domain event eksik mi?
DTO validation var mı?
OpenAPI güncel mi?
Testler yeterli mi?
Secret/token loglanıyor mu?
Cost/margin gibi alanlar izinsiz dönüyor mu?




6. Blocking Issues


Bunlar varsa PR merge edilmez:


Tenant isolation eksik
PermissionGuard eksik
RLS policy eksik
Secret/token sızıntısı
Public API scope bypass
Dealer isolation bypass
Portal customer_self bypass
AI context isolation bypass
Finance calculation testi yok
Migration destructive
OpenAPI breaking change onaysız




7. Severity Levels


critical = merge block
high     = merge block unless approved
medium   = fix recommended
low      = suggestion




8. Review Prompt


Role: CRM OS Review Agent
Review this PR.
Read:
- AGENTS.md
- .cursor/rules/*
- related Sprint Factory Pack
- specs/modules/{module}/*
- PR diff
- CI output
Check:
- spec compliance
- architecture compliance
- tenant isolation
- permission guards
- RLS impact
- audit logs
- domain events
- tests
- OpenAPI
- security leakage
- unrelated changes
Return:
approve, request_changes, or block.
Do not rewrite code unless explicitly asked.
Provide exact files and required fixes.




9. Review Categories


Architecture Review
Backend Review
Database Review
Security Review
Frontend Review
Testing Review
OpenAPI Review
DevOps Review




10. Architecture Review


Bounded context doğru mu?
Cross-module bağımlılık ihlali var mı?
Controller içine business logic yazılmış mı?
Repository sadece data access mi?
Event/outbox standardına uyulmuş mu?




11. Backend Review


DTO validation var mı?
Service transaction boundary doğru mu?
Repository pattern korunmuş mu?
Error handling güvenli mi?
Idempotency gereken yerde var mı?




12. Database Review


tenant_id var mı?
RLS aktif mi?
Indexler doğru mu?
FK ilişkileri doğru mu?
Money alanları numeric mi?
Destructive migration var mı?
Ledger/audit tabloları immutable mı?




13. Security Review


IDOR var mı?
Permission bypass var mı?
Secret logging var mı?
Sensitive field leakage var mı?
Portal/dealer scope doğru mu?
Public API key scope doğru mu?
Webhook signature korunmuş mu?




14. Frontend Review


Permission-aware UI var mı?
Loading/empty/error state var mı?
API client kullanılmış mı?
Direct fetch var mı?
Design system dışına çıkılmış mı?
Optimistic update rollback içeriyor mu?




15. Testing Review


Unit test var mı?
Integration test var mı?
Permission test var mı?
Tenant isolation test var mı?
Critical flow E2E var mı?
Negative test var mı?




16. OpenAPI Review


Yeni endpoint OpenAPI’da var mı?
Request/response DTO eşleşiyor mu?
Breaking change var mı?
Public API contract değişmiş mi?




17. PR Comment Template


Markdown
## Review Result: REQUEST CHANGES
### Blocking Issues
1. `apps/api/src/modules/order/order.controller.ts`
   - Missing permission guard on `POST /orders/{id}/cancel`
   - Required: `@RequirePermission('order.cancel')`
2. `packages/database/migrations/xxx.sql`
   - New table missing RLS policy
   - Required: enable RLS + tenant isolation policy
### Suggestions
- Split large service method into smaller private methods.
### Checklist
- Tenant isolation: FAIL
- Permission guards: FAIL
- Tests: PASS
- OpenAPI: PASS




18. CI Integration


Review Agent çalışır:


PR opened
PR updated
Before merge
Before release branch cut




19. Definition of Done


Review checklist tanımlandı
Blocking issue listesi tanımlandı
Severity modeli tanımlandı
Review prompt hazır
PR comment template hazır
CI entegrasyonu tanımlandı




20. Output


PR
→ Review Agent
→ Blocking Issue Detection
→ Fix Request
→ CI Pass
→ Human Approval
→ Merge


Sonraki paket:


CRM OS QA Agent Pack v1
