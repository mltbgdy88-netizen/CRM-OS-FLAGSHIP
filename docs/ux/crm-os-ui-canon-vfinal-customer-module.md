# CRM OS — UI Canon vFinal (Customer Module)

**Status:** LOCKED — override edici üretim kuralları  
**Scope:** `/customers`, `/customers/new`, `/customers/:id`  
**Stack:** Next.js App Router, React, TypeScript, Tailwind, dark-first  
**Viewport:** 1440 × 900 (desktop-first, bu modülde responsive collapse yok)

---

## 0. Amaç

Customer modülü **CRUD ekranı değil**; **inspection + decision workspace**'tir.

- Liste → giriş noktası (tarama)
- Detay 360 → birincil çalışma alanı
- AI panel → assistive shell (Sprint 33 mock, authoritative değil)

---

## 1. Global shell (tüm authenticated sayfalar)

```text
1440 × 900
├── Sidebar     280px × 900   (fixed, full height)
└── Main column 1160px × 900
    ├── Topbar    1160px × 64   (global: breadcrumb, search, Cmd+K, tenant, user)
    └── Content   1160px × 836  (overflow: hidden; internal scroll only)
```

**Kurallar:**

- Sayfa düzeyinde scroll yok
- Sidebar ve topbar sabit
- Sadece content bölgesi içinde, tanımlı panellerde internal scroll

**Dosya:** `apps/web/app/(app)/layout.tsx` → `AppShell`

---

## 2. Yasaklar (tüm customer modülü)

- Import / Export
- Bulk actions / checkbox kolonu
- Merge / Delete müşteri
- Çoklu CTA (FAB yok)
- Inline edit (detail — read-heavy)
- Upload UI
- Topbar'da müşteriye özel duplicate header

---

## 3. RBAC

| Aksiyon / modül | Permission |
|-----------------|------------|
| Liste görüntüleme | `customer.read` |
| Yeni müşteri | `customer.create` |
| Profil + 360 | `customer.read` |
| Timeline (full) | `customer.timeline.read` |
| AI panel shell | Gate yok (placeholder) |

Yetki yoksa: modül gizlenir veya "permission denied" — gizli disabled buton yok.

---

## 4. API sözleşmesi

**Base:** `/api/v1`  
**Wrapper:** `{ data: T, meta?: { timestamp } }`

| Endpoint | Kullanım |
|----------|----------|
| `GET /api/v1/customers?page=&pageSize=` | Liste |
| `POST /api/v1/customers` | Create (`/customers/new`) |
| `GET /api/v1/customers/:id` | Profil (supplemental) |
| `GET /api/v1/customers/:id/360` | **Primary** aggregation |
| `GET /api/v1/customers/:id/timeline?page=&pageSize=` | Paginated timeline |

**Liste `pageSize`:** **8** (locked)  
**Timeline `pageSize`:** **5** (detail iç scroll için)

---

## 5. CRM-CUST-LIST-001 — `/customers`

### Layout (content 1160 × 836)

| Katman | Yükseklik |
|--------|-----------|
| PageHeader | 56px |
| FilterBar | 48px |
| DataTable | 640px (header 40 + 8×75 veya 8×48 compact) |
| Pagination | 44px |
| Buffer | ~48px |

Sağ **360px AI panel:** bu sayfada **gizli** — liste tam genişlik **1160px**.

### PageHeader

- Sol: `Customers`
- Sağ: tek CTA `[+ New Customer]` → `customer.create` → `/customers/new`

### FilterBar (tek satır)

- Search (flex)
- Status filter (client-side veya API phase-2 — etiketle)

**Yok:** segment, owner (API v1 yok — MOCK etiketiyle sonra)

### DataTable — kolonlar (sıra locked)

1. `displayName`
2. `email`
3. `phone`
4. `status` (badge)
5. `updatedAt`

- Horizontal scroll yok
- Truncate + ellipsis
- Checkbox yok

### Row interaction (locked)

**Option A:** `navigate → /customers/:id` (default, mevcut kodla uyumlu)  
Drawer yok.

### Durumlar

- Loading: 8 skeleton row
- Empty: "No customers" + create CTA
- Error: mesaj + Retry
- Forbidden: permission mesajı

**Dosya:** `apps/web/app/(app)/customers/page.tsx`  
**Bileşenler:** `CustomerListView`, `CustomerFilterBar`, `CustomerTable`, `Pagination`

---

## 6. CRM-CUST-DETAIL-001 — `/customers/:id`

### Layout (content 1160 × 836)

```text
1160px content width
├── Left workspace   800px
└── AI panel dock    360px × 836 (fixed, always visible)
```

### Dikey bütçe (sol 800px)

| Katman | Yükseklik |
|--------|-----------|
| PageHeader | 56px |
| 360 summary strip | 72px |
| Notes + files compact | 120px |
| Timeline region | ~560px (internal scroll) |
| Pagination | 44px (timeline) |

### PageHeader (content içi — topbar değil)

- `Customers / {displayName}`
- Status badge
- `updatedAt` (opsiyonel)
- CTA yok

### Identity (PageHeader altı veya strip içi)

- `displayName`, `email`, `phone`, `status`
- Kaynak: `GET /customers/:id` veya 360 payload

### 360 modülleri (read-only)

| Modül | API alanları |
|-------|----------------|
| riskScore | `riskLevel`, `riskScore`, `assessedAt` |
| lifetimeValue | `ltvValue`, `currency`, `calculatedAt` |
| scores[] | `metricCode`, `scoreValue`, `recordedAt` |
| notes[] | `id`, `title`, `body`, `createdAt` |
| files[] | `fileName`, `mimeType`, `byteSize`, `createdAt` |
| timelinePreview | max 5 event — `eventType`, `title`, `summary`, `occurredAt` |

**Yok (API v1):** segment tag, note author/source, file sourceModule

### Timeline (full)

- `GET .../timeline?page&pageSize=5`
- Internal scroll, sayfa scroll yok
- Pagination zorunlu

### AI panel (360px)

- Başlık: "AI Assist"
- Disabled input + placeholder chips
- `POST /api/v1/ai/query` — **Sprint 33 mock, çalıştırılmaz**
- Context: profile + 360 + timeline highlights (görsel only)

### Durumlar

- Loading: modül bazlı skeleton
- Empty 360: "No 360 data"
- Timeline empty: "No activity recorded"
- Error: modül izole (biri fail, diğeri çalışabilir)
- Forbidden: `customer.read` / `customer.timeline.read` ayrı

**Dosya:** `apps/web/app/(app)/customers/[id]/page.tsx`  
**API clients:** `customers-client.ts`, `customer-360-client.ts`  
**Bileşenler:** `customer-detail.tsx`, `customer-timeline.tsx` (refactor hedefi)

### Implement notu

Mevcut `customer-detail.tsx` **edit form** içerir — Canon vFinal'de **kaldırılacak** (read-heavy).

---

## 7. `/customers/new` (kısa)

- Shell: aynı global layout
- Form: `displayName`, `email`, `phone`, `status`
- Tek CTA: Save → `POST /api/v1/customers`
- Permission: `customer.create`
- Başarı: navigate `/customers/:id`

---

## 8. Design tokens (özet)

| Token | Değer |
|-------|--------|
| bg | `#0B0F14` / `#0B0F17` |
| panel | `#111827` |
| border | `#1F2937` / `#374151` |
| text | `#E5E7EB` |
| muted | `#9CA3AF` |
| primary | `#6366F1` |
| Font | Inter — body 14px, table 12–13px |
| Row height | 44–48px (compact) |
| Card radius | 8–10px |

---

## 9. ChatGPT / Figma / Cursor sırası

1. Bu canon = tek kaynak
2. ChatGPT: ekran başına wireframe + px (spec only)
3. Figma: AutoLayout, 1440×900 frame
4. Cursor Agent: `components/shell/` sonra customer refactor
5. Gate: `pnpm sprint:04:verify` + browser smoke

---

## 10. Sprint uyumu

| Özellik | Sprint-04 | Canon vFinal |
|---------|-----------|--------------|
| 360 API | Var | Uyumlu |
| Timeline API | Var | Uyumlu |
| Full AppShell | Ertelenmiş | Hedef |
| Edit customer UI | Var (proof) | Kaldırılacak |
| Export/upload/merge/delete | Yok | Uyumlu |

---

## İlgili dokümanlar

- `docs/ux/screen-catalog-v1.md`
- `docs/ux/app-shell-blueprint-v1.md`
- `docs/ux/design-system-v2.md`
- `docs/ux/component-system-v1.md`
- `docs/api/sprint-03-customer-openapi.md`
- `docs/api/sprint-04-customer-360-openapi.md` (Phase 4 docs PR)
