# CRM OS Visual System v4 — Premium Dark (Orange)

**Status:** ACTIVE — supersedes v3 (Bitrix Space+ / NEXORA) for all new UI work  
**Reference:** Product owner mockups (2026-06-30) — full-screen inventory + global component kit  
**Content source:** `docs/ux/crm-os-ui-screen-inventory-master.md` (API fields unchanged)  
**Date:** 2026-06-30

---

## 1. Design intent

Premium dark CRM command center: deep navy surfaces, glass panels, **orange primary accent**, data-centric layouts. Turkish copy on auth screens; English OK for dev-only warnings.

## 2. Color tokens (legend)

| Token | Hex | Usage |
|-------|-----|--------|
| Primary | `#FF6A00` | Buttons, active nav, links, gauges |
| Secondary | `#FF8C34` | Hover, gradients |
| Success | `#22C55E` | Active status, positive trends |
| Info | `#3B82F6` | Informational badges |
| Warning | `#F59E0B` | Pending, caution |
| Danger | `#EF4444` | Errors, high priority |
| Dark (bg) | `#0F172A` | Page background |
| Surface | `#1E293B` | Cards, inputs, tables |
| Border | `#334155` | Dividers, outlines |
| Text primary | `#F8FAFC` | Headings, values |
| Text secondary | `#94A3B8` | Labels, hints |

CSS variables live in `apps/web/app/globals.css` (`--crm-*`).

## 3. Layout (unchanged structure)

- Collapsible icon sidebar + expanded labels
- Topbar: CRM section nav, search, profile, orange primary CTA
- Utility rail (AI / notifications placeholders)
- Workspace card: dark glass panel, internal scroll only
- Customer detail: slide-over 360 (left facts / center timeline / right insights)

## 4. Phased rollout

| Phase | Scope |
|-------|--------|
| **v4.0** | Tokens, login split hero, shell, LIVE customer routes |
| **v4.1** | Mockup fidelity: expanded sidebar, SVG nav, TR copy, entity page layout |
| **v4.2** | Customer 360 slide-over hero/metrics/tabs, TR create form, AI dock polish |

## 5. Out of scope (unchanged)

- Export, bulk, merge, upload UI
- New API routes without domain sprint
- Sprint-05 backend until approved

## 6. Assets

Optional hero: `apps/web/public/images/crm-os-login-hero.png` — CSS gradient fallback if missing.
