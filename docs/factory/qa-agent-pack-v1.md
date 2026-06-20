CRM OS QA Agent Pack v1


1. Amaç


Cursor tarafından üretilen her modülün
testli, güvenli, tenant-aware ve regression-safe
olduğunu doğrulamak.


QA Agent sadece test yazmaz; kalite kapısını yönetir.




2. QA Agent Görevi


Unit test
Integration test
API contract test
Permission test
Tenant isolation test
E2E smoke test
Regression test
Negative test




3. QA Input


Sprint Factory Pack
Module specs
api.yaml
permissions.yaml
events.yaml
tests.yaml
acceptance.yaml
PR diff
OpenAPI spec
Database migrations




4. QA Output


test files
test fixtures
test data
E2E scenarios
QA report
blocking defects




5. Test Kategorileri


unit
integration
api_contract
permission
tenant_isolation
e2e
security_negative
regression
performance_smoke




6. Zorunlu Testler


Her modül için:


create works
read works
update works
delete/soft delete works
permission denied works
cross tenant access blocked
audit log written
domain event emitted
OpenAPI matches implementation




7. Tenant Isolation Test Standardı


Tenant A kaydı oluşturur.
Tenant B aynı ID veya endpoint ile erişmeye çalışır.
Beklenen sonuç: 404 veya 403.
Tenant B hiçbir veri göremez.


Bu test kırmızıysa merge yok.




8. Permission Test Standardı


User without permission endpoint çağırır.
Beklenen sonuç: 403.
User with permission endpoint çağırır.
Beklenen sonuç: 200/201.




9. API Contract Test


OpenAPI request schema
OpenAPI response schema
HTTP status codes
Error response format


hepsi implementation ile eşleşmeli.




10. E2E Smoke Akışları


MVP:


login
customer create
lead create
lead convert
opportunity create
pipeline move
quote create
quote approve
task create
dashboard view


Commercial:


quote to order
order confirm
stock reserve
invoice create
payment register
portal quote view


Enterprise:


conversation create
message send
ticket create
SLA breach
dealer login
dealer order
approval request
public API call
webhook delivery


AI:


AI gateway request
Ask CRM question
summary generate
prediction generate
analytics view
report export
data quality scan




11. QA Agent Prompt


Role: CRM OS QA Agent
Read:
- AGENTS.md
- .cursor/rules/*
- Sprint Factory Pack
- specs/modules/{module}/*
- PR diff
Generate:
- unit tests
- integration tests
- permission tests
- tenant isolation tests
- API contract tests
- E2E smoke tests if needed
Must verify:
- authorized user succeeds
- unauthorized user gets 403
- cross-tenant access is blocked
- audit log is written
- domain event is emitted
- OpenAPI matches implementation
Do not change production code unless asked.
Return QA report with blocking defects.




12. Test File Structure


apps/api/src/modules/{module}/tests/
  {module}.service.spec.ts
  {module}.controller.spec.ts
  {module}.permissions.spec.ts
  {module}.tenant-isolation.spec.ts
tests/e2e/{module}/
  {module}.e2e.spec.ts
tests/fixtures/{module}/
  {module}.fixture.ts




13. Test Data Standard


tenantA
tenantB
adminA
userAWithPermission
userAWithoutPermission
userB
recordA
recordB




14. Negative Test Matrix


missing auth token → 401
invalid token → 401
missing permission → 403
cross tenant access → 403/404
invalid DTO → 400
not found → 404
duplicate unique field → 409
invalid state transition → 422




15. Finance Test Rules


Finance modüllerinde zorunlu:


decimal precision
partial payment
overpayment prevention
payment cancellation reverse ledger
balance recalculation
tenant isolation
audit log




16. Inventory Test Rules


Inventory modüllerinde zorunlu:


stock inbound
stock outbound
negative stock prevention
reservation
release
consume
availability calculation
ledger immutability




17. Public API Test Rules


valid API key works
revoked key rejected
expired key rejected
missing scope rejected
rate limit works
usage log written
tenant isolation




18. Webhook Test Rules


signature generated
timestamp included
retry works
DLQ works
delivery log written
disabled webhook ignored




19. AI Test Rules


permission-aware context
tenant isolation
quota exceeded blocked
usage log written
PII masking
unsafe action blocked
citation generated




20. QA Report Format


YAML
module: quote
sprint: 10
status: pass | fail
summary: 
"QA completed"
tests:
  unit: pass
  integration: pass
  permission: pass
  tenant_isolation: pass
  e2e: pass
blocking_defects:
  - file: quote.controller.ts
    issue: Missing permission negative test
    severity: high
recommendations:
  - Add edge case for expired quote approval




21. CI Commands


Bash
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm test:permissions
pnpm test:tenant
pnpm openapi:validate




22. Merge Blockers


tenant isolation fail
permission test fail
finance calculation fail
inventory negative stock fail
public API scope fail
webhook signature fail
AI context isolation fail
critical E2E fail




23. Definition of Done


QA prompt hazır
Test kategorileri tanımlı
Tenant isolation standardı tanımlı
Permission test standardı tanımlı
E2E smoke akışları tanımlı
Negative test matrix hazır
QA report formatı hazır
Merge blockers tanımlı




24. Output


PR
→ QA Agent
→ Tests
→ QA Report
→ Blocking Defects
→ Fix
→ CI Pass
→ Merge


Sonraki paket:


CRM OS Security Agent Pack v1
