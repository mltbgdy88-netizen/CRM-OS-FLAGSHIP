# CRM OS Visual System v3 — Bitrix Space+ Inspired (Premium)

**Status:** ACTIVE — overrides NEXORA/coral and v2 token defaults for new UI work  
**Reference:** [Bitrix24 Space+](https://helpdesk.bitrix24.com/open/25409295/) (layout only; not colors or branding)  
**Content source:** `docs/ux/crm-os-ui-screen-inventory-master.md` (API fields unchanged)  
**Date:** 2026-06-30

---

## 1. Amaç

Bitrix24 Space+ **çalışma alanı mimarisini** (sol menü, üst araç çubuğu, sağ hızlı panel, bölüm sayaçları, CRM entity timeline) CRM OS veri modeline uyarlamak — ancak:

- Bitrix’in açık mavi/yeşil “kurumsal şablon” hissinden **daha koyu, premium, komuta merkezi**
- Özelleştirilebilir **zemin mesh / hero görseli** (tenant tema)
- İçerik ve RBAC **değişmez** (export/bulk/merge yok)

---

## 2. Bitrix24’ten alınan yapı (layout DNA)

| Bitrix Space+ | CRM OS v3 karşılığı |
|---------------|---------------------|
| Sol ana menü (bölümler, sayaçlar) | `AppShell` sidebar 260px — `MAIN_MENU` grupları |
| Üst toolbar (filtre, aksiyon, profil) | `app-shell__topbar` 56px |
| Sağ sidebar (bildirim, chat, CoPilot) | `UtilityRail` 56px (AI + notifications placeholder) |
| Özelleştirilebilir arka plan | CSS `--crm-bg-mesh`, `--crm-login-hero-image` |
| CRM item form + tek timeline | Customer detail: workspace + timeline + AI dock |
| Hafif, düşük gürültü | Dark glass surfaces, sıkı tipografi |

## 3. Bilinçli farklar (Bitrix’ten daha “havalı”)

| Konu | Bitrix24 | CRM OS v3 |
|------|----------|-----------|
| Tema | Açık, genel SaaS | **Dark-first**, glass, glow accent |
| Renk | Mavi/yeşil kurumsal | **Violet accent** `#6C5CE7` + teal success |
| Yoğunluk | Orta | **Enterprise density** (canon pageSize 8) |
| Sağ panel | Tam messenger | **Utility rail** + sayfa içi AI dock |
| Menü | Her şey açık | **Soon** etiketi — API yoksa gizle/disable |
| Scroll | Sayfa scroll | **Internal scroll only** (canon) |

---

## 4. Renk sistemi (Bitrix’ten farklı palet)

```css
--crm-bg-base: #080c18;
--crm-bg-elevated: #0f1528;
--crm-surface: #141c32;
--crm-accent: #6c5ce7;      /* primary — NOT Bitrix blue */
--crm-accent-hover: #7e71eb;
--crm-success: #2dd4a8;
--crm-warning: #fbbf24;
--crm-danger: #f87171;
--crm-text: #eef2ff;
--crm-text-muted: #94a3b8;
```

### Zemin görselleri

| Alan | Değişken | Kullanım |
|------|----------|----------|
| Workspace içerik | `--crm-bg-mesh` | Radial gradient mesh (performanslı) |
| Login hero | `--crm-login-hero-image` | Gradient + opsiyonel `url(...)` tenant görseli |
| Kartlar | `--crm-surface-glass` | `backdrop-filter: blur(16px)` |

Tenant özelleştirmesi (gelecek): `settings` → upload background → CSS variable override.

---

## 5. Shell ölçüleri

```text
┌──────────┬────────────────────────────────────┬────┐
│ Sidebar  │ Topbar (section toolbar)           │ U  │
│ 260px    ├────────────────────────────────────┤ t  │
│ sections │ Content (mesh bg, internal scroll) │ i  │
│ + badges │                                    │ l  │
│          │                                    │56px│
└──────────┴────────────────────────────────────┴────┘
```

| Token | Değer |
|-------|-------|
| `--crm-sidebar-width` | 260px |
| `--crm-topbar-height` | 56px |
| `--crm-utility-rail-width` | 56px |

---

## 6. Menü grupları (Bitrix bölüm mantığı)

Kaynak: `apps/web/lib/navigation/main-menu.ts`

| Grup | Öğeler | LIVE |
|------|--------|------|
| Workspace | Dashboard | Soon |
| CRM | Customers, Leads, Deals, Quotes, Orders | **Customers** |
| Operations | Tasks, Calendar, Inbox, Tickets | Soon |
| Intelligence | Reports, AI Copilot | Soon |
| Administration | Settings | Soon |

Aktif olmayan route: **Soon** badge — tıklanamaz (Bitrix’te gizleme yerine şeffaf roadmap).

---

## 7. Sayfa şablonları (41 ekran — inventory ile uyumlu)

### Auth (shell dışı)

| Ekran | v3 layout |
|-------|-----------|
| Login | Split hero (custom bg) + glass card |
| Workspace select | Kart grid (plan) |

### CRM entity (Bitrix CRM item form pattern)

| Ekran | Layout |
|-------|--------|
| List | Topbar filters + dense table (toolbar altında) |
| Detail | Sol: alanlar + 360 modüller; alt: timeline; sağ iç: AI dock |
| Create | Tek kolon form kartı |

### Dashboard / Reports

Bitrix KPI + chart kartları — **MOCK veri** until analytics API; aynı kart dili (`card` + mesh bg).

---

## 8. Bileşen kuralları

| Bileşen | v3 stil |
|---------|---------|
| Button primary | `--crm-accent`, hover glow |
| Button ghost | Border `--crm-border` |
| Table | Compact 44px row, sticky header |
| Badge status | Pill, semantic colors |
| Nav active | Sol accent bar 3px + violet tint |
| Counter | Kırmızı badge (Bitrix sayaç mantığı) |

---

## 9. Uygulama fazları

| Faz | Kapsam | Durum |
|-----|--------|-------|
| **0** | Bu doc + CSS tokens + shell + login | **Done** (branch) |
| **1** | Customer list → DataTable v3 | Next |
| **2** | Customer detail → Bitrix timeline layout | Next |
| **3** | Dashboard mock kartları | PLAN |
| **4** | Modül sprint’leri geldikçe menü LIVE | PLAN |

---

## 10. İlgili dosyalar

| Dosya | Rol |
|-------|-----|
| `apps/web/app/globals.css` | v3 tokens |
| `apps/web/components/app-shell.tsx` | Tri-pane shell |
| `apps/web/components/utility-rail.tsx` | Sağ rail |
| `apps/web/lib/navigation/main-menu.ts` | Menü envanteri |
| `docs/ux/crm-os-ui-screen-inventory-master.md` | Veri alanları |
| `docs/ux/crm-os-ui-canon-vfinal-customer-module.md` | Customer davranış canon |

## 11. GPT / tasarım brief

```text
Layout: Bitrix24 Space+ (sol menü, üst toolbar, sağ utility rail).
Görsel: CRM OS v3 — dark premium, violet accent, mesh background.
İçerik: inventory master alan adları; PLAN ekranlarda Soon.
Yasak: export, bulk, merge, delete, page scroll.
```
