CRM OS Agent Orchestration Pack v1


1. Amaç


10+ Cursor Agent’ın aynı monorepo içinde
çakışmadan, sırayla ve kalite kapılarıyla çalışmasını sağlamak.


Ana hedef:


Sprint Factory Pack
→ Agent Task Queue
→ Parallel Branches
→ Review
→ CI
→ Merge
→ Release




2. Agent Rolleri


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




3. Orchestration Model


Sprint Pack
↓
Architect Agent task breakdown
↓
Task Queue
↓
Backend / Frontend / DB / QA parallel work
↓
Reviewer Agent
↓
Security Agent
↓
CI Quality Gates
↓
Human Approval
↓
Merge




4. Task Queue Format


YAML
task_id: sprint-09-quote-backend
sprint: 9
module: quote
agent: backend
branch: agent/sprint-09-quote-backend
depends_on:
  - sprint-09-quote-db
scope:
  - controller
  - service
  - repository
  - dto
  - events
required_outputs:
  - code
  - tests
  - openapi
status: ready




5. Parallelization Rules


Database Agent önce migration/spec üretir.
Backend Agent DB task bittikten sonra başlar.
Frontend Agent API contract netleşince başlar.
QA Agent backend + frontend çıktılarını test eder.
Security Agent PR açılınca review eder.
Documentation Agent merge öncesi docs günceller.




6. Branch Strategy


agent/sprint-09-quote-db
agent/sprint-09-quote-backend
agent/sprint-09-quote-frontend
agent/sprint-09-quote-qa


Merge sırası:


DB
→ Backend
→ Frontend
→ QA
→ Docs




7. Locking Rules


Aynı dosyayı iki agent aynı anda değiştirmesin.


YAML
locks:
  - path: packages/database/migrations
    owner: database-agent
  - path: apps/api/src/modules/quote
    owner: backend-agent
  - path: apps/web/src/features/quote
    owner: frontend-agent
  - path: tests/e2e/quote
    owner: qa-agent




8. Agent Handoff


Her agent iş sonunda 
handoff.md
 üretir:


Markdown
# Handoff
## Completed
- Created quote service
- Added DTOs
- Added events
## Pending
- Frontend integration
- E2E test
## Risks
- Margin calculation needs finance review
## Commands Run
- pnpm test
- pnpm typecheck




9. PR Naming


[Sprint-09][Quote][Backend] Quote core API
[Sprint-09][Quote][Frontend] Quote builder UI
[Sprint-09][Quote][QA] Quote test suite




10. Review Flow


Agent PR
↓
Reviewer Agent
↓
Security Agent
↓
Human Reviewer
↓
CI PASS
↓
Merge


Blocking issues:


Tenant isolation missing
Permission guard missing
Migration unsafe
OpenAPI outdated
Tests missing
Security leakage




11. Agent Dependency Graph


Architect
↓
Database
↓
Backend
↓
Frontend
↓
QA
↓
Reviewer/Security
↓
DevOps/Release




12. Daily Orchestration Loop


1. Pick ready tasks
2. Check locks
3. Assign agent
4. Create branch
5. Generate code
6. Run local validation
7. Create PR
8. Review
9. Merge
10. Update task status




13. Status Values


backlog
ready
in_progress
blocked
review
changes_requested
approved
merged
released




14. Conflict Prevention


Small PR
One module per PR
No unrelated refactor
No shared file edits without lock
API contract first
Migration first




15. Quality Gates Per Agent


Backend:


lint
typecheck
unit
integration
permission
tenant isolation
OpenAPI


Frontend:


lint
typecheck
component tests
visual smoke
permission UI


Database:


migration up
migration rollback
RLS check
index check
tenant_id check


QA:


integration
E2E
negative tests
regression




16. Human Approval Required


DB breaking change
Permission model change
Financial calculation
Security module
AI data access
Public API contract
Production deploy




17. Orchestration Files


.ai/orchestration/
  task-queue.yaml
  locks.yaml
  agent-status.yaml
  handoffs/
  sprint-plan.yaml




18. Example Sprint Execution


Sprint-10 Quote PDF + Approval
Tasks:
1. DB Agent → quote_approvals migration
2. Backend Agent → approval APIs
3. Worker Agent → PDF processor
4. Frontend Agent → approval UI
5. QA Agent → approval/PDF tests
6. Security Agent → margin leakage check
7. Docs Agent → OpenAPI + module docs




19. Definition of Done


Task queue tanımlandı
Agent rolleri tanımlandı
Dependency graph tanımlandı
Locking rules tanımlandı
Handoff formatı tanımlandı
PR flow tanımlandı
Review flow tanımlandı
Quality gates tanımlandı




20. Output


Sprint Pack
→ Task Queue
→ Parallel Agents
→ Safe PRs
→ Review
→ CI
→ Merge
→ Release


Sonraki paket:


CRM OS Review Agent Pack v1
