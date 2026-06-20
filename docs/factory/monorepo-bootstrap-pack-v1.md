CRM OS Monorepo Bootstrap Pack v1


1. Amaç


Cursor’un kod üreteceği ana repo iskeletini kurmak.


Bu paket tamamlandığında:


NestJS API
Next.js Web
Worker
Scheduler
Shared Packages
Infra
Specs
Cursor Rules
Generators
CI/CD


tek monorepo içinde hazır olur.




2. Monorepo Stack


Package Manager: pnpm
Build System: Turborepo
Backend: NestJS
Frontend: Next.js
DB: PostgreSQL
Cache: Redis
Queue: RabbitMQ
Storage: S3/MinIO
ORM: Prisma veya Drizzle
Validation: Zod
Testing: Jest/Vitest/Playwright
CI: GitHub Actions




3. Repo Yapısı


crm-os/
apps/
  api/
  web/
  worker/
  scheduler/
  customer-portal/
  dealer-portal/
packages/
  ui/
  design-system/
  api-client/
  config/
  auth/
  permissions/
  events/
  database/
  logger/
  validation/
  shared/
specs/
  sprints/
  modules/
  api/
  db/
  ui/
  tests/
.cursor/
  rules/
  prompts/
  playbooks/
.ai/
  agents/
  templates/
  generators/
  checklists/
  reviews/
infra/
  docker/
  k8s/
  helm/
  terraform/
  monitoring/
tools/
  generators/
  validators/
  scripts/
docs/
  architecture/
  api/
  database/
  security/
  operations/
tests/
  e2e/
  integration/
  fixtures/
.github/
  workflows/




4. Root Dosyaları


package.json
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
eslint.config.js
prettier.config.js
.editorconfig
.env.example
.gitignore
README.md
AGENTS.md




5. pnpm-workspace.yaml


YAML
packages:
  - 
"apps/*"
  - 
"packages/*"
  - 
"tools/*"




6. package.json


JSON
{
  "name": 
"crm-os"
,
  "private": 
true
,
  "packageManager": 
"pnpm@9.0.0"
,
  "scripts": {
    "dev": 
"turbo dev"
,
    "build": 
"turbo build"
,
    "lint": 
"turbo lint"
,
    "typecheck": 
"turbo typecheck"
,
    "test": 
"turbo test"
,
    "test:e2e": 
"pnpm --filter @crm-os/e2e test"
,
    "db:migrate": 
"pnpm --filter @crm-os/database migrate"
,
    "db:seed": 
"pnpm --filter @crm-os/database seed"
,
    "generate:module": 
"tsx tools/generators/module-generator.ts"
,
    "validate:specs": 
"tsx tools/validators/spec-validator.ts"
  },
  "devDependencies": {
    "turbo": 
"latest"
,
    "typescript": 
"latest"
,
    "tsx": 
"latest"
,
    "eslint": 
"latest"
,
    "prettier": 
"latest"
  }
}




7. turbo.json


JSON
{
  "tasks": {
    "build": {
      "dependsOn": [
"^build"
],
      "outputs": [
"dist/**"
, 
".next/**"
]
    },
    "dev": {
      "cache": 
false
,
      "persistent": 
true
    },
    "lint": {},
    "typecheck": {},
    "test": {
      "dependsOn": [
"^build"
],
      "outputs": [
"coverage/**"
]
    }
  }
}




8. Apps


apps/api              NestJS REST API
apps/web              Main CRM Web App
apps/worker           Queue workers
apps/scheduler        Cron/scheduled jobs
apps/customer-portal  Customer portal
apps/dealer-portal    Dealer portal




9. Packages


packages/ui             shared UI components
packages/design-system  tokens/theme
packages/api-client     generated OpenAPI client
packages/config         shared config/env
packages/auth           auth utilities
packages/permissions    permission constants
packages/events         event types
packages/database       migrations/schema/seed
packages/logger         structured logger
packages/validation     zod schemas
packages/shared         common types




10. Docker Compose


infra/docker/docker-compose.yml


Servisler:


postgres
redis
rabbitmq
minio
api
web
worker
scheduler




11. Cursor İçin Kritik Dosyalar


AGENTS.md
.cursor/rules/00-global.md
.cursor/rules/01-architecture.md
.cursor/rules/02-backend.md
.cursor/rules/03-database.md
.cursor/rules/04-security.md
.cursor/rules/05-permissions.md
.cursor/rules/06-events.md
.cursor/rules/07-frontend.md
.cursor/rules/08-ui-design.md
.cursor/rules/09-testing.md
.cursor/rules/10-devops.md




12. AGENTS.md


Markdown
# CRM OS Agent Rules
## Before Coding
1. Read the related Sprint Factory Pack.
2. Read module spec files.
3. Read .cursor/rules.
4. Do not modify unrelated modules.
## Required Output
- Code
- Tests
- OpenAPI updates
- Migration updates
- Permission updates
- Event updates
- Documentation updates
## Never Skip
- Tenant isolation
- Permission guard
- Audit log
- Domain event
- Tests




13. Module Spec Seed


specs/modules/_template/
  module.yaml
  entities.yaml
  api.yaml
  permissions.yaml
  events.yaml
  ui.yaml
  tests.yaml
  acceptance.yaml




14. İlk Bootstrap Komutları


Bash
pnpm install
pnpm dev
pnpm validate:specs
pnpm db:migrate
pnpm test




15. CI Workflow


.github/workflows/ci.yml


Pipeline:


install
lint
typecheck
test
validate specs
migration check
openapi validation
security scan




16. Definition of Done


Monorepo ayağa kalkıyor
pnpm install çalışıyor
apps/api build oluyor
apps/web build oluyor
Docker Compose çalışıyor
Cursor rules mevcut
AGENTS.md mevcut
Spec template mevcut
CI workflow mevcut
Generator script reference slot mevcut
Validator script reference slot mevcut




17. Output


CRM OS monorepo hazır.
Cursor artık hangi klasöre, hangi kurala ve hangi üretim formatına göre kod yazacağını bilir.


Sonraki paket:


CRM OS Generator Pack v1
