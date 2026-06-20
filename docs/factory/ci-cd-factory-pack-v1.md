CRM OS CI/CD Factory Pack v1


1. Amaç


Kod üretimini güvenli, testli ve otomatik şekilde
Development → Staging → UAT → Production
hattına taşımak.


Hedef:


Cursor
↓
PR
↓
CI Validation
↓
Review
↓
Staging
↓
UAT
↓
Production




2. Pipeline Mimarisi


Developer / Cursor
↓
Feature Branch
↓
Pull Request
↓
CI Pipeline
↓
Review Agent
↓
Merge
↓
CD Pipeline
↓
Staging
↓
UAT
↓
Production




3. Branch Strategy


Protected Branches


main
release/*
hotfix/*




Working Branches


feature/sprint-09-quote-core
feature/sprint-23-ticket-core
feature/sprint-35-ai-summary
bugfix/payment-calculation
refactor/activity-module




Agent Branches


agent/sprint-09-quote-core
agent/sprint-24-sla
agent/sprint-37-analytics




4. Environment Strategy


local
development
staging
uat
production




Deployment Matrix


feature branch
→ ephemeral environment
main
→ development
release/*
→ staging
uat approval
→ production




5. GitHub Actions Structure


.github/workflows/
ci.yml
security.yml
openapi.yml
migrations.yml
staging-deploy.yml
uat-deploy.yml
production-deploy.yml
rollback.yml




6. CI Pipeline


Trigger:


YAML
on:
  pull_request:
  push:


Flow:


install
↓
lint
↓
typecheck
↓
unit tests
↓
integration tests
↓
spec validation
↓
migration validation
↓
OpenAPI validation
↓
security scan
↓
build




7. CI Commands


Bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:specs
pnpm db:migrate:check
pnpm openapi:validate
pnpm build




8. Mandatory Quality Gates


PR merge edilmeden:


lint PASS
typecheck PASS
unit PASS
integration PASS
permission tests PASS
tenant isolation PASS
OpenAPI PASS
migration validation PASS




9. Security Pipeline


Workflow:


dependency scan
↓
secret scan
↓
container scan
↓
security rules
↓
report


Araçlar:


Trivy
Gitleaks
npm audit
OSV Scanner




10. OpenAPI Pipeline


Kontrol:


OpenAPI generated mı?
Spec ile endpoint eşleşiyor mu?
Breaking change var mı?


Komut:


Bash
pnpm openapi:generate
pnpm openapi:validate




11. Migration Validation


Her migration için:


up çalışıyor mu
rollback çalışıyor mu
RLS aktif mi
tenant_id mevcut mu


Komut:


Bash
pnpm db:migrate:test




12. Review Agent Stage


PR açılınca:


Reviewer Agent
↓
Security Agent
↓
Human Review


Kontroller:


tenant isolation
permissions
audit log
domain event
spec compliance




13. Staging Deployment


Trigger:


release/*


Pipeline:


build image
↓
push registry
↓
helm upgrade
↓
migration run
↓
smoke tests
↓
staging ready




14. Smoke Test Pack


Staging sonrası:


health endpoint
login
customer list
quote create
order create
permission denied
tenant isolation
webhook test
public api test




15. UAT Deployment


Trigger:


manual approval


Pipeline:


deploy UAT
↓
seed demo data
↓
run UAT scripts
↓
collect approval




16. Production Deployment


Trigger:


Release Manager approval


Flow:


backup
↓
migration
↓
deploy
↓
health checks
↓
smoke tests
↓
release complete




17. Rollback Pipeline


rollback.yml


Flow:


select release
↓
restore deployment
↓
rollback image
↓
rollback config
↓
verify health




18. Monitoring Integration


Deploy sonrası:


Prometheus
Grafana
Loki
AlertManager


Kontroller:


error rate
latency
queue depth
cpu
memory
db health




19. Release Checklist


All tests pass
All migrations verified
No critical security findings
OpenAPI updated
Docs updated
UAT approved
Rollback tested
Monitoring configured




20. Required Metrics


CI:


build success %
test success %
pipeline duration
deployment frequency


CD:


lead time
rollback count
failed deploys
MTTR




21. GitHub Environments


development
staging
uat
production


Production için:


required reviewers
manual approval
secret isolation




22. Secrets Management


Yasak:


.env repo içinde
hardcoded keys
docker image içinde secret


Kullanılacak:


GitHub Secrets
Vault
AWS Secrets Manager




23. Deployment Definition of Done


CI çalışıyor
Security scan çalışıyor
Migration validation çalışıyor
OpenAPI validation çalışıyor
Staging deploy çalışıyor
UAT deploy çalışıyor
Production deploy çalışıyor
Rollback çalışıyor
Monitoring bağlı
Alerts bağlı




24. Enterprise Release Gate


Production release engellenir eğer:


tenant isolation FAIL
permission tests FAIL
security critical FAIL
migration FAIL
OpenAPI FAIL
rollback test FAIL




25. Output


Developer / Cursor
→ PR
→ CI
→ Review
→ Staging
→ UAT
→ Production
→ Monitoring
→ Rollback


Sonraki paket:


CRM OS Git Workflow & Release Management Pack v1
