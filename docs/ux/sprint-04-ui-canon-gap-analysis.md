# Sprint-04 UI Canon Gap Analysis

**Date:** 2026-06-30  
**Canon:** `docs/ux/crm-os-ui-canon-vfinal-customer-module.md`  
**Codebase:** `chore/billing-wait-followups` (shell foundation started)

## Summary

| Area | Canon | Current (pre-foundation) | After foundation branch |
|------|-------|--------------------------|-------------------------|
| Shell layout | 280 sidebar + 1160 main | Top header only, 960px content | Sidebar + topbar + 836px content |
| Page scroll | Forbidden | Body scroll allowed | `overflow: hidden` on shell |
| List pageSize | 8 | 20 | **8** (fixed) |
| List columns | 5-column table | Link list (name + email) | **Gap remains** |
| Detail edit UI | Forbidden | Edit form present | **Removed** |
| AI dock (detail) | 360px fixed | Missing | **Placeholder added** |
| FilterBar | Required | Missing | **Gap remains** |
| DataTable | Required | `<ul>` list | **Gap remains** |

## Shell (`AppShell`)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Sidebar 280px | **Partial** | Width set; nav minimal (Customers, Health) |
| Topbar 64px | **Partial** | Present; breadcrumb/search/Cmd+K not implemented |
| Content 836px internal scroll | **Partial** | Height locked; list/detail inner panels need refactor |
| 1440×900 frame | **Not enforced** | CSS uses flex; no fixed viewport wrapper |

## List (`/customers`)

| Requirement | Status | File |
|-------------|--------|------|
| `pageSize=8` | **Done** | `customer-list.tsx` |
| Columns: displayName, email, phone, status, updatedAt | **Open** | Still list UI |
| Single CTA `[+ New Customer]` | **Partial** | Link text "New customer" |
| No checkbox / bulk | **OK** | — |
| FilterBar (search + status) | **Open** | — |
| Pagination 44px | **Partial** | Basic prev/next only |
| Full width 1160 (no AI dock) | **Open** | Content not table layout |

## Detail (`/customers/:id`)

| Requirement | Status | File |
|-------------|--------|------|
| Workspace 800px + AI 360px | **Partial** | Layout + dock added |
| Read-heavy (no inline edit) | **Done** | Edit form removed |
| 360 modules from API | **OK** | Functional proof exists |
| Timeline paginated pageSize=5 | **Verify** | Check `customer-timeline.tsx` |
| Breadcrumb `Customers / {name}` | **Partial** | Simple breadcrumb added |
| Module height budget | **Open** | Cards stack vertically |

## RBAC (UI)

| Permission | Expected UI | Current |
|------------|-------------|---------|
| `customer.read` | Hide list/detail | Forbidden states exist |
| `customer.create` | Hide create CTA | Link always visible |
| `customer.timeline.read` | Hide timeline | Timeline has forbidden state |

## Recommended implementation order (post-billing)

1. `CustomerTable` + `CustomerFilterBar` (list)
2. Permission-gated CTA (`customer.create`)
3. Detail module height budget + timeline pageSize=5
4. Topbar breadcrumb from route
5. Visual tokens alignment (`#0B0F14`, Inter 14px)
6. `pnpm sprint:04:verify` + browser smoke

## Out of scope (locked)

Export, upload, merge, delete, bulk, Sprint-05 Lead.
