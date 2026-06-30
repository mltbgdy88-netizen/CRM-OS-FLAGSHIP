# CRM OS Final Flagship Workspace v1.1 — Cursor Ready

This package is the cleaned Cursor-ready workspace root for CRM OS.

## Cursor Opening Rule

Open this folder itself as the Cursor workspace root:

```text
CRM-OS-FINAL-FLAGSHIP-WORKSPACE-v1.1/
```

Do not open a parent ZIP extraction folder.

## First Cursor Task

Start only with Sprint-01 Repository Bootstrap.

The first Cursor prompt must be planning-only:

```text
Do not write code yet.

Read:
- README.md
- AGENTS.md
- MASTER-SOURCE-OF-TRUTH-v9.md
- /canon/final-readiness
- /canon/build-order
- /canon/00-canonical-index.md
- .cursor/rules
- docs/sprints/sprint-01.md
- specs/sprints/sprint-01-repository-bootstrap.yaml

Return:
1. canonical source order
2. exact Sprint-01 scope
3. files you will create/change
4. commands you will run
5. what you will explicitly not implement

Stop after the plan.
```

## Hard Rule

Sprint-01 is repository bootstrap only. It must not implement business CRM modules, auth, tenant business logic, customer, lead, quote, order, inventory, finance, or AI features.

## Sprint-01 Bootstrap Commands

From this folder:

```bash
pnpm install
docker compose up -d
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm sprint:01:verify
```

Local dev (optional):

```bash
pnpm --filter @crm-os/api dev
pnpm --filter @crm-os/web dev
```

Use **separate terminals** for dev servers vs sprint verify gates. Verify does not require dev servers running.

**Do not** run broad Node kills (`taskkill /F /IM node.exe`, `Stop-Process -Name node -Force`) before `pnpm sprint:*:verify`. Repo scripts do not kill dev servers; if they stop during verify, an agent ran incorrect cleanup. See `docs/DECISIONS.md` and `AGENTS.md`.

- API health: `http://localhost:3001/health`
- Web root: `http://localhost:3000`
- Web status placeholder: `http://localhost:3000/health`
- Set `CORS_ORIGIN=http://localhost:3000` when running the API so the browser web app can call it cross-origin during local proof.

Copy `.env.example` to `.env` before running apps against local services.

## Local proof database

Sprint-02/03 gates require CRM-OS proof Postgres on **port 5433**. `localhost:5432` often belongs to another project and causes `auth_failed`.

```bash
export DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/crmos
export DATABASE_APP_URL=postgresql://crmos_app:crmos_app@127.0.0.1:5433/crmos
export JWT_SECRET=change-me-local-only
```

Start proof Postgres if needed:

```bash
docker run --name crmos-sprint03-proof-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=crmos \
  -p 5433:5432 -d postgres:16-alpine
```

```bash
pnpm db:migrate
pnpm db:seed
pnpm sprint:03:verify
```

See `docs/api/sprint-02-environment.md` for full variable reference.

---


# CRM OS Master Workspace v8

CRM OS Master Workspace v8 is the production-ready Cursor workspace for building the Customer Operating System / Amiral Gemisi CRM Platformu.

## Status

PRODUCTION_READY_FOR_CURSOR

## What This Workspace Contains

- Cursor rules and agent operating manuals
- Sprint-01 through Sprint-40 production factory packs
- Canonical sprint YAML specs
- UX/UI architecture and component system
- Technical blueprint integration
- ERD, Data Dictionary, OpenAPI, security and DevOps documents
- Quality, release and security gates
- Monorepo folders for apps, packages, tools and infrastructure

## How to Use

Open this folder in Cursor and start with:

```text
Read AGENTS.md.
Read MASTER-SOURCE-OF-TRUTH-v8.md.
Read .cursor/rules.
Read docs/sprints/sprint-01.md.
Read specs/sprints/sprint-01-repository-bootstrap.yaml.

Implement Sprint-01 Repository Bootstrap only.
Do not implement business modules yet.
Run lint, typecheck and tests.
```

## Operating Principle

Do not ask Cursor to generate the full CRM OS at once. Build one sprint task at a time and pass quality gates before moving forward.


## v11 Update

Added Master Database Canon Layer under `/canon/database` and upgraded `/canon/04-database-canon.md` as the database source of truth.


## v11 Layer

Master API Canon Layer added under `/canon/api`.


## v12 Update

Added Event Canon Layer under `/canon/events`.

Status: `EVENT_CANON_LAYER_ADDED`.


## v13 Update

Added UI Canon Layer under `/canon/ui`. This is now the source of truth for UX, screen assembly, component generation, data display, forms, AI UI, responsive behavior, accessibility, and Cursor UI generation.


## v14 Update

Added CRM OS Build Order Canon Layer at `/canon/build-order`.
Status: BUILD_ORDER_CANON_LAYER_ADDED.


## v15 Update

Agent Orchestration Canon Layer added under `/canon/agents`.


## v16 Update

Added QA & Release Canon Layer under `/canon/qa-release`.


## v17 Update

Added `/canon/security-compliance` Security & Compliance Canon Layer.

## v18 Update

Added `/canon/devops-operations` as the DevOps and Production Operations source of truth.


## v19 Update

Added AI & Data Intelligence Canon Layer under `/canon/ai-data`.

Status: `AI_DATA_INTELLIGENCE_CANON_LAYER_ADDED`.


## v20 Update
Integration & Marketplace Canon Layer added under `/canon/integration-marketplace`.


## v21 Added Layer

- Product & SaaS Business Canon: `/canon/product-saas`


## v22 Update

Added CRM OS Mobile & Offline Canon Layer under `/canon/mobile-offline`.


## v23 Update
Added CRM OS Low-Code & Customization Canon Layer at `/canon/low-code-customization`.

Status: LOW_CODE_CUSTOMIZATION_CANON_LAYER_ADDED


## v24 Final Production Readiness Canon

This version adds `/canon/final-readiness` with final acceptance, risk, Cursor go-live, and readiness gate documents.
Status: `FINAL_PRODUCTION_READINESS_CANON_LAYER_ADDED`.
