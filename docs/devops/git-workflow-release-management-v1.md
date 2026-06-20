CRM OS Git Workflow & Release Management Pack v1


1. Amaç


50+ kişilik ekip
+
Cursor Agents
+
CI/CD Factory
için kontrollü release yönetimi sağlamak.


Hedef:


Spec
↓
Development
↓
Review
↓
Merge
↓
Release
↓
Production
↓
Support




2. Git Operating Model


CRM OS için:


Trunk Based Development
+
Release Branches
+
Hotfix Branches


kullanılır.




3. Protected Branches


main
release/*
hotfix/*


Kurallar:


direct push forbidden
force push forbidden
PR required
CI required
review required




4. Branch Naming Standard


Feature


feature/sprint-09-quote-core
feature/sprint-23-ticket-core
feature/sprint-35-ai-summary




Agent


agent/sprint-09-quote-core
agent/sprint-30-webhooks
agent/sprint-40-data-quality




Bugfix


bugfix/payment-rounding
bugfix/tenant-isolation




Hotfix


hotfix/security-patch
hotfix/api-auth




5. Commit Convention


Standard:


feat:
fix:
refactor:
test:
docs:
chore:
security:
perf:


Örnek:


feat(quote): add approval flow
fix(order): inventory reservation bug
security(auth): add tenant validation




6. Pull Request Template


Markdown
## Sprint
Sprint-27 Approval Engine
## Scope
Implemented approval request flow.
## Changes
- backend
- frontend
- migration
- tests
## Checklist
[ ] lint
[ ] typecheck
[ ] tests
[ ] permission tests
[ ] tenant isolation tests
[ ] OpenAPI updated
## Risks
...




7. PR Review Policy


Minimum:


1 Human Reviewer
1 Reviewer Agent
1 Security Agent


Kritik modüllerde:


2 Human Reviewers


zorunlu.




8. Merge Requirements


Aşağıdakiler geçmeden merge yasak:


CI PASS
Review PASS
Security PASS
OpenAPI PASS
Migration PASS
Tenant Isolation PASS




9. Release Cadence


Önerilen model:


Development:
daily
Staging:
weekly
Production:
bi-weekly


Enterprise müşterilerde:


monthly LTS release


eklenebilir.




10. Release Branch Flow


main
↓
release/v1.5.0
↓
staging
↓
uat
↓
production


Release branch açılır:


Bash
git
 checkout main
git
 checkout 
-b
 release/v1.5.0




11. Semantic Versioning


Format:


MAJOR.MINOR.PATCH


Örnek:


1.0.0
1.1.0
1.1.1




MAJOR


breaking API
breaking schema
breaking permissions




MINOR


new module
new feature
new endpoint




PATCH


bug fix
security patch
UI fix




12. Release Notes Factory


Her release otomatik üretir:


features
fixes
security updates
migrations
breaking changes


Kaynak:


PR titles
labels
commit messages




13. Release Labels


feature
bug
security
breaking
database
frontend
backend
ai
analytics




14. Migration Policy


Kritik kural:


breaking migration
=
separate release


Örnek:


column rename
table split
primary key change


önce compatibility release gerektirir.




15. Database Release Strategy


Release-1
add new column
Release-2
migrate data
Release-3
remove old column


Never:


rename directly
drop directly




16. Hotfix Flow


production issue
↓
hotfix branch
↓
fast CI
↓
security review
↓
production deploy
↓
merge back to main




17. Incident Release Process


Severity:


SEV-1
SEV-2
SEV-3
SEV-4




SEV-1


security breach
tenant leak
data corruption
production down


hemen hotfix.




18. Rollback Strategy


Her release:


rollback plan
rollback owner
rollback validation


içermeli.




Rollback Types


application rollback
config rollback
database rollback




19. Release Gates


Release engellenir:


critical security issue
tenant isolation fail
permission fail
migration fail
OpenAPI fail
performance fail




20. Production Approval Matrix


Role
Approval
Engineering Manager
Required
Product Owner
Required
Security Lead
Required
DevOps Lead
Required




21. Change Advisory Board (Enterprise)


Enterprise sürümlerde:


Product
Architecture
Security
DevOps
Operations


onayı gerekir.




22. Release Checklist


All tests pass
Migration verified
OpenAPI updated
Docs updated
Monitoring ready
Alerts ready
Rollback tested
UAT approved




23. Post Release Validation


Deploy sonrası:


health checks
login
customer create
quote create
order create
payment flow
webhook flow
AI gateway


Smoke PASS zorunlu.




24. Release Metrics


Takip edilir:


deployment frequency
change failure rate
MTTR
lead time
rollback count
incident count




25. GitHub Configuration


Branch Protection:


Require PR
Require CI
Require Reviews
Dismiss stale reviews
Require conversation resolution




26. Cursor Agent Rules


Agent branch merge etmeden önce:


lint
typecheck
tests
spec validation
OpenAPI validation


çalıştırmak zorunda.




27. Definition of Done


Git workflow tanımlandı
Release flow tanımlandı
Versioning tanımlandı
Migration policy tanımlandı
Hotfix flow tanımlandı
Rollback flow tanımlandı
Release gates tanımlandı
Approval matrix tanımlandı




28. Output


Feature
→ PR
→ Review
→ Merge
→ Release Branch
→ UAT
→ Production
→ Monitoring
→ Support


Sonraki mantıklı paket:


CRM OS Agent Orchestration Pack v1


Bu paket, 10+ Cursor Agent'ın aynı anda çakışmadan çalışmasını ve Sprint-1 → Sprint-40 üretimini paralel hale getirir.
