# CRM OS Architecture Decisions

## 2026-06-22 — Domain sprint frontend is functional proof only (Sprint-04+)

**Status:** Accepted  
**Applies to:** Sprint-04 and later **domain** sprints (CRM, lead, pipeline, quote, order, etc.)

### Decision

Domain sprints must not perform full UI visual design. Frontend work is **functional proof only** — minimum routes and states needed to verify API behavior, permissions, and tenant isolation.

### In scope (domain sprints)

- Minimum routes to exercise new APIs
- Loading, empty, error, and permission-denied states (testable)
- Simple styling consistent with the current minimal app
- Reuse existing AppShell as-is; do not redesign it

### Out of scope (defer to dedicated UI/UX sprint)

- Final CRM AppShell
- Sidebar / navigation system
- Dashboard layout
- Table / card / form component system
- Design tokens and visual polish
- Professional CRM visual language
- Full screen shell design
- Redesign of existing screens

### Priority order (domain sprints)

1. Database, RLS, migrations
2. Permissions and backend APIs
3. Tests and CI gates
4. Domain correctness (audit, events, contracts)
5. Functional frontend proof (last, minimal)

### Notes

- `canon/ui/*` and `.cursor/rules/08-ui-design.md` describe the **target** UX; they are not Sprint-04+ implementation requirements.
- Sprint-03 minimal customer UI on `main` is the baseline; extend, do not restyle.

## 2026-06-30 — Visual System v3 (Bitrix Space+ inspired)

**Status:** Accepted  
**Applies to:** Dedicated UI implementation track (parallel to domain sprint functional proof)

### Decision

Adopt **Bitrix24 Space+ workspace layout** (left section menu, top section toolbar, right utility rail, customizable background) for CRM OS — with a **premium dark palette** and CRM OS content from `crm-os-ui-screen-inventory-master.md`. This supersedes NEXORA/coral as the active visual direction for new UI work.

### In scope

- `docs/ux/crm-os-visual-system-v3-bitrix-inspired.md`
- CSS design tokens in `apps/web/app/globals.css`
- `AppShell`, `UtilityRail`, login split layout
- Per-module screen rollout per inventory (phased)

### Out of scope (unchanged)

- API/RBAC/data field names
- Export, bulk, merge, delete UI
- Sprint-05+ backend until respective sprints ship

### Notes

- Bitrix colors/branding are **not** copied; layout pattern only.
- Domain sprint gate policy unchanged until UI phases merge behind billing/CI.

## 2026-06-22 — Verify gates must not kill dev servers

**Status:** Accepted  
**Applies to:** Local development and agent-operated `pnpm sprint:*:verify` runs

### Decision

Sprint verify scripts (`sprint:02:verify`, `sprint:03:verify`, `sprint:04:verify`) do **not** stop API or Web dev servers. Dev servers are **not required** for verify gates.

### Prohibited during verify (agents and operators)

- `taskkill /F /IM node.exe`
- `Stop-Process -Name node -Force` (broad kill)
- `pkill node` / `killall node`
- Any "kill all Node before Prisma" workaround

### Correct practice

- Run API/Web dev servers in **separate terminals** from verify commands.
- If Windows `prisma generate` fails with EPERM (DLL locked by a running dev server), **retry** or **manually stop** the dev server in its terminal — do not kill all Node processes.
- Dev server exit during verify is **not** a product or gate failure unless build/tests fail.

### Root cause note

No repo script performs broad Node kills. Repeated dev server termination during verify was caused by **agent/operator** `Stop-Process node` before Prisma, not by `package.json` gate semantics.

## 2026-06-22 — Sprint-04 migration band `003_crm_360`

**Status:** Accepted  
**Applies to:** Sprint-04 Customer 360

### Decision

- `002_iam` and `003_crm` migration SQL remain **frozen**.
- `004_lead` remains **reserved** for Sprint-05 Lead per `canon/database/migration-canon-v1.md`.
- Sprint-04 CRM 360 tables use band **`003_crm_360`** (CRM bounded-context sub-band).

### New tables (003_crm_360)

`customer_timeline_events`, `customer_scores`, `customer_risk_scores`, `customer_lifetime_values`

### Entity clarifications

- **`customer_notes`** is canonical for notes; do not add a parallel `comments` table.
- **`customer_files`** remains metadata-only; no upload/storage/CDN.
- **`CustomerMerged`** event deferred until a merge API exists (future sprint).
