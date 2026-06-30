# CRM OS — UI Sayfa ve Katman Envanteri (Master)

**Ürün:** CRM OS (multi-tenant B2B CRM)  
**Görsel referans:** NEXORA tarzı mockup = yalnızca başlangıç örneği; içerik bu envanter + API’ye bağlıdır  
**Viewport hedefi:** 1440×900 desktop-first (canon)  
**Son güncelleme:** 2026-06-30

---

## Durum kodları

| Kod | Anlam |
|-----|--------|
| **LIVE** | API + route mevcut; gerçek veri bağlanabilir |
| **PARTIAL** | Route veya API kısmen var |
| **CANON** | Kilitli UI spec; implementasyon devam ediyor |
| **MOCK** | Görsel placeholder; API yok |
| **PLAN** | Sprint planında; henüz API/UI yok |

## Yasak içerik (tüm modüller — canon)

Export, bulk/checkbox, merge/delete müşteri, upload UI, çoklu CTA/FAB, sayfa düzeyi scroll (internal scroll only).

---

# BÖLÜM A — GLOBAL KATMANLAR (tüm authenticated sayfalar)

Bu katmanlar **her uygulama sayfasının** üzerinde sabittir.

## A1. `AppShell` — kök çerçeve

| Katman | Boyut | Gösterilecek içerik | Veri kaynağı | Durum |
|--------|-------|---------------------|--------------|-------|
| **Sidebar — marka** | 280×900 | Logo/metin: **CRM OS** | Statik | PARTIAL |
| **Sidebar — birincil nav** | 280px | Menü öğeleri (aşağıdaki tablo) | Permission + feature flag | MOCK nav |
| **Sidebar — alt bölüm** | — | Ayarlar, yardım (opsiyonel) | — | PLAN |
| **Main column** | 1160×900 | İç sayfa alanı | — | PARTIAL |
| **Topbar** | 1160×64 | Breadcrumb, global arama, tenant, kullanıcı, bildirim | JWT claims + tenant | PARTIAL |
| **Content** | 1160×836 | Sayfa içeriği (`children`) | Route | PARTIAL |

### A1.1 Sidebar menü öğeleri (hedef envanter)

| Menü | Route | Permission (hedef) | Veri | Durum |
|------|-------|-------------------|------|-------|
| Dashboard | `/` veya `/dashboard` | `tenant.manage` veya genel read | KPI özetleri | MOCK |
| Customers | `/customers` | `customer.read` | — | **LIVE** |
| Leads | `/leads` | `lead.read` (gelecek) | — | PLAN |
| Deals / Pipeline | `/pipeline` | `opportunity.read` | — | PLAN |
| Quotes | `/quotes` | `quote.read` | — | PLAN |
| Orders | `/orders` | `order.read` | — | PLAN |
| Products | `/products` | `product.read` | — | PLAN |
| Tasks | `/tasks` | `task.read` | — | PLAN |
| Calendar | `/calendar` | `task.read` | — | PLAN |
| Inbox | `/inbox` | `inbox.read` | — | PLAN |
| Tickets | `/tickets` | `ticket.read` | — | PLAN |
| Reports | `/reports` | `report.read` | — | PLAN |
| AI Copilot | `/ai` | — (shell) | — | MOCK |
| Settings | `/settings` | `tenant.manage` | — | PLAN |
| Users & Roles | `/settings/users` | `user.manage`, `role.manage` | — | PARTIAL API |
| Audit | `/settings/audit` | `tenant.manage` | — | PLAN |
| Health (dev) | `/health` | — | `GET /health` | **LIVE** |

Yetkisiz menü öğesi: **gizlenir** (disabled ghost buton yok).

## A2. Topbar katmanları

| Katman | İçerik alanları | Veri kaynağı | Durum |
|--------|-----------------|--------------|-------|
| Sol | Mobil sidebar toggle (gelecek), breadcrumb (`Customers / {name}`) | Route + entity | PLAN |
| Orta | Global search input, `Cmd+K` ipucu | Arama API (customers, leads, …) | PLAN |
| Sağ | Workspace adı, plan badge, bildirim zili (sayı), kullanıcı avatarı, Sign out | JWT `tenantId`, user profil | PARTIAL |
| Primary create | Tek global `+` (context-aware) | Route’a göre create | PLAN |

**Gösterilecek tenant alanları:** `tenant.name` veya slug (`default`), kullanıcı: `user.firstName`, `user.lastName`, `user.email`.

## A3. Global overlay / panel katmanları

| Katman | Genişlik | İçerik | Veri | Durum |
|--------|----------|--------|------|-------|
| **Command Palette** | Modal | Navigasyon, create, AI komutları | Permission-filtered | PLAN |
| **Notification Center** | 360px drawer | Onaylar, atamalar, sistem uyarıları | Notification API | PLAN |
| **Right Panel — AI** | 360px | AI Assist (detay sayfalarında sabit) | Sprint 33 mock | MOCK |
| **Right Panel — Entity preview** | 360–560px | Hızlı önizleme (liste satırı) | Entity API | PLAN (canon: liste drawer yok) |
| **Global Search results** | Dropdown | Customers, contacts, leads, deals… | Search index | PLAN |

---

# BÖLÜM B — KAMU / AUTH SAYFALARI (shell dışı)

## B1. `CRM-AUTH-LOGIN-001` — `/login`

| Katman | İçerik | Veri alanları | API | Durum |
|--------|--------|---------------|-----|-------|
| Hero (opsiyonel) | Ürün değer önerisi, güven maddeleri | Statik metin | — | MOCK |
| Login kartı | Form | — | — | **LIVE** |
| ↳ Email | Input | `email` | `POST /api/v1/auth/login` | **LIVE** |
| ↳ Password | Input | `password` | aynı | **LIVE** |
| ↳ Tenant slug | Input | `tenantSlug` (default: `default`) | aynı | **LIVE** |
| ↳ Submit | Button | — | — | **LIVE** |
| Güvenlik uyarısı | Metin | sessionStorage token uyarısı | — | **LIVE** |
| Başarı durumu | Mesaj | `user.email`, token alındı | login response | **LIVE** |
| Hata durumları | Mesaj | validation / auth / network | HTTP 401/400 | **LIVE** |
| SSO / Google | Button | — | — | **MOCK** (yok) |
| Forgot password | Link | — | — | **PLAN** |

**Login response gösterilebilir alanlar:** `accessToken`, `refreshToken`, `tenantId`, `user.id`, `user.email`, `user.firstName`, `user.lastName`.

## B2. `CRM-AUTH-WORKSPACE-001` — `/workspace` (plan)

| Katman | İçerik | Veri alanları | Durum |
|--------|--------|---------------|-------|
| Workspace listesi | Kart grid | `tenant.id`, `tenant.name`, `tenant.slug`, `role.name`, `lastActiveAt` | PLAN |
| Seçili workspace | Highlight | `tenantId` JWT’ye yazılır | PLAN |
| Create workspace | CTA | — | PLAN |
| Kullanıcı bloğu | Avatar + email | `user.email` | PLAN |

*Not: Şu an login doğrudan `tenantSlug` ile tek workspace’e girer.*

## B3. `CRM-DEV-HEALTH-001` — `/health`

| Katman | İçerik | Veri | API | Durum |
|--------|--------|------|-----|-------|
| Status | Metin | `status`, `service`, `version` | `GET /health` | **LIVE** |

## B4. `CRM-ROOT-001` — `/`

| Katman | İçerik | Veri | Durum |
|--------|--------|------|-------|
| Landing / redirect | Giriş yönlendirmesi veya dashboard’a git | — | PARTIAL |

---

# BÖLÜM C — CUSTOMER MODÜLÜ (**LIVE** + **CANON**)

## C1. `CRM-CUST-LIST-001` — `/customers`

**Permission:** `customer.read`  
**API:** `GET /api/v1/customers?page=&pageSize=8`

| Katman | Boyut | Listelenecek / gösterilecek veri | Alan adları |
|--------|-------|----------------------------------|-------------|
| **PageHeader** | 56px | Başlık `Customers`; tek CTA `[+ New Customer]` | — |
| **FilterBar** | 48px | Arama (displayName/email); status filtresi | client filter veya API phase-2 |
| **DataTable header** | 40px | Kolon başlıkları (sıra locked) | — |
| **DataTable row ×8** | 48–75px | Müşteri özeti | `id`, `displayName`, `email`, `phone`, `status`, `updatedAt` |
| **Pagination** | 44px | `page`, `pageSize`, `total` | API `CustomerListData` |
| **Durum: loading** | — | 8 skeleton satır | — |
| **Durum: empty** | — | "No customers" + create CTA | — |
| **Durum: forbidden** | — | Permission mesajı | — |
| **Durum: error** | — | Hata + Retry | — |

**Satır tıklama:** `navigate → /customers/{id}`  
**Gösterilmez:** checkbox, owner, segment, revenue, export, bulk.

## C2. `CRM-CUST-CREATE-001` — `/customers/new`

**Permission:** `customer.create`  
**API:** `POST /api/v1/customers`

| Katman | İçerik | Form alanları | Zorunlu |
|--------|--------|---------------|---------|
| PageHeader | `New Customer` | — | — |
| Form | Create | `displayName` | Evet |
| Form | | `email` | Hayır |
| Form | | `phone` | Hayır |
| Form | | `status` | Hayır (default active) |
| CTA | Save | — | — |
| Başarı | Redirect | → `/customers/{id}` | `data.id` |

## C3. `CRM-CUST-DETAIL-001` — `/customers/:id`

**Permission:** `customer.read` (+ timeline için `customer.timeline.read`)  
**API:** `GET /customers/:id`, `GET /customers/:id/360`, `GET /customers/:id/timeline`

### C3.1 Layout katmanları

| Katman | Boyut | İçerik |
|--------|-------|--------|
| Sol workspace | 800px | Profil + 360 + timeline |
| Sağ AI dock | 360×836 | AI Assist placeholder |

### C3.2 Sol workspace — katman detayı

| Katman | Boyut | Gösterilecek veri | API alanları |
|--------|-------|-------------------|--------------|
| **Breadcrumb** | — | `Customers / {displayName}` | `displayName` |
| **PageHeader** | 56px | `displayName`, status badge, `updatedAt` | `displayName`, `status`, `updatedAt` |
| **Identity strip** | 72px | `email`, `phone`, `status` | CustomerSummary |
| **360 — Scores** | modül | Metrik listesi | `scores[].metricCode`, `scoreValue`, `recordedAt` |
| **360 — Risk** | modül | Risk özeti | `riskScore.riskLevel`, `riskScore`, `assessedAt` |
| **360 — LTV** | modül | Yaşam boyu değer | `lifetimeValue.ltvValue`, `currency`, `calculatedAt` |
| **360 — Notes** | modül | Not listesi | `notes[].id`, `title`, `body`, `createdAt` |
| **360 — Files** | modül | Dosya metadata | `files[].fileName`, `mimeType`, `byteSize`, `createdAt` |
| **360 — Timeline preview** | modül | Son 5 olay | `timelinePreview[].eventType`, `title`, `summary`, `occurredAt` |
| **Contacts** | kart | Kişi listesi | `contacts[].firstName`, `lastName`, `email`, `phone`, `title`, `isPrimary` |
| **Addresses** | kart | Adres listesi | `addresses[].line1`, `line2`, `city`, `region`, `postalCode`, `countryCode`, `isPrimary` |
| **Tags** | kart | Etiketler | `tags[].name` |
| **Timeline (full)** | ~560px scroll | Olay listesi + sayfalama | `items[].id`, `eventType`, `title`, `summary`, `occurredAt`; `page`, `pageSize=5`, `total` |
| **Timeline pagination** | 44px | Prev / Next | — |

**Gösterilmez / yok API v1:** segment, note author, file upload, inline edit (canon read-heavy).

### C3.3 Sağ AI dock katmanları

| Katman | İçerik | Veri |
|--------|--------|------|
| Başlık | `AI Assist` | Statik |
| Alt başlık | Sprint 33 placeholder | Statik |
| Chips | Öneri kısayolları (ör. Summarize timeline) | Statik |
| Input | Disabled textarea | — |
| *Gelecek* | `POST /api/v1/ai/query` | Sprint 33 — **MOCK** |

---

# BÖLÜM D — DASHBOARD & KOMUTA MERKEZİ (NEXORA örneğindeki ana ekran)

## D1. `CRM-DASH-001` — `/dashboard`

**Durum:** MOCK (KPI API yok)  
**Hedef sprint:** UI sprint + analytics modülü

| Katman | NEXORA örneğinde | CRM OS’ta gösterilecek veri (hedef) | Veri kaynağı |
|--------|------------------|-------------------------------------|--------------|
| KPI kart 1 | Total Revenue | `revenue.total`, `revenue.changePercent`, sparkline | Finance API — PLAN |
| KPI kart 2 | Open Opportunities | `opportunities.openCount`, değişim % | Sales API — PLAN |
| KPI kart 3 | Win Rate | `pipeline.winRate` | Sales API — PLAN |
| KPI kart 4 | Pending Tasks | `tasks.pendingCount` | Task API — PLAN |
| Sales Pipeline özeti | Yatay bar / huni | Aşama bazlı `count`, `value` by stage | `pipelines`, `pipeline_stages` — PLAN |
| Revenue chart | Area chart | Zaman serisi `revenue` | PLAN |
| Recent Activities | Olay listesi | `activity.type`, `title`, `actor`, `occurredAt` | Event/audit feed — PLAN |
| AI Assistant kartı | Günlük özet | Mock metin + öneriler | MOCK → Sprint 33 |
| Upcoming Events | Toplantı kartları | `event.title`, `startAt`, katılımcılar | Calendar API — PLAN |
| Alerts | Onay / risk uyarıları | `approval.type`, `reference`, `amount` | PLAN |

*Şimdilik:* Menüde "Dashboard" → placeholder kartlar + "Coming soon" veya seed mock.

---

# BÖLÜM E — LEAD & SATIŞ (PLAN — Sprint 05–07)

## E1. `CRM-LEAD-LIST-001` — `/leads`

| Katman | Tablo kolonları | Entity alanları (Sprint-05) |
|--------|-----------------|------------------------------|
| PageHeader | Başlık + Create Lead | — |
| Filters | Source, status, owner, score | `lead_sources`, `status`, assignment |
| DataTable | Lead, Company, Source, Owner, Status, Score | `leads.*`, `lead_scores`, `lead_assignments` |

## E2. `CRM-LEAD-DETAIL-001` — `/leads/:id`

| Katman | İçerik | Alanlar |
|--------|--------|---------|
| Header | Lead adı, status, score | `displayName`, `status`, `lead_scores` |
| Info | Kaynak, atanan, etiketler | `lead_sources`, `lead_assignments`, `lead_tags` |
| Activities | Aktivite listesi | `lead_activities` |
| Timeline | Olay akışı | domain events |
| AI | Conversion probability, next action | MOCK |

## E3. `CRM-PIPELINE-001` — `/pipeline`

| Katman | İçerik | Alanlar (Sprint-06) |
|--------|--------|---------------------|
| Filters | Pipeline seçimi, owner, dönem | `pipelines`, `pipeline_stages` |
| Kanban kolonları | New, Qualified, Proposal, Negotiation, Won, Lost | `pipeline_stages.name`, `order` |
| Kart | Fırsat özeti | `opportunities.title`, `amount`, `probability`, owner, `nextActivityAt` |
| Drawer | Detay önizleme | summary, activities, notes | PLAN |

## E4. `CRM-OPP-DETAIL-001` — `/opportunities/:id`

| Katman | İçerik | Alanlar (Sprint-07) |
|--------|--------|---------------------|
| Header | Company, value, stage, probability | `opportunities.*` |
| Tabs | Activities, tasks, files, quotes, timeline | ilişkili tablolar |
| AI | Win probability, risk, recommended actions | MOCK |

---

# BÖLÜM F — TEKLİF & SİPARİŞ (PLAN)

## F1. `CRM-QUOTE-LIST-001` — `/quotes`

| Kolon | Alan |
|-------|------|
| Quote No | `quote.number` |
| Customer | `customer.displayName` |
| Amount | `quote.total` |
| Margin | `quote.marginPercent` |
| Status | `quote.status` |
| Created By | `user.displayName` |

## F2. `CRM-QUOTE-BUILDER-001` — `/quotes/new` veya `/quotes/:id/edit`

| Panel | İçerik |
|-------|--------|
| Sol | Ürün satırları, fiyat, indirim, vergi |
| Sağ | Subtotal, tax, total, margin, onay durumu |
| AI | Discount/upsell önerisi — MOCK |

## F3. `CRM-ORDER-LIST-001` — `/orders`

| Kolon | Alan |
|-------|------|
| Order No | `order.number` |
| Customer | `customer.displayName` |
| Total | `order.total` |
| Status | `order.status` |
| Created | `createdAt` |

## F4. `CRM-ORDER-DETAIL-001` — `/orders/:id`

| Bölüm | İçerik |
|-------|--------|
| Order info | numara, müşteri, tarih, status bar |
| Items | `lineItems[]`: SKU, qty, price |
| Inventory | rezervasyon durumu |
| Shipment | kargo bilgisi |
| Finance | fatura/ödeme özeti |
| Timeline | status geçmişi |

---

# BÖLÜM G — ÜRÜN & STOK (PLAN)

## G1. `CRM-PRODUCT-LIST-001` — `/products`

| Kolon | Alan |
|-------|------|
| SKU | `product.sku` |
| Name | `product.name` |
| Category | `category.name` |
| Stock | `inventory.available` |
| Price | `product.unitPrice` |
| Status | `product.status` |

## G2. `CRM-INVENTORY-001` — `/inventory`

| Katman | KPI / tab içerik |
|--------|------------------|
| KPI row | Available, Reserved, Incoming, Outgoing |
| Tabs | Ledger, Movements, Reservations, Warehouses |

---

# BÖLÜM H — DESTEK & OMNICHANNEL (PLAN)

## H1. `CRM-TICKET-LIST-001` — `/tickets`

| Kolon | Alan |
|-------|------|
| Ticket No | `ticket.number` |
| Customer | `customer.displayName` |
| Priority | `ticket.priority` |
| Status | `ticket.status` |
| SLA | `sla.dueAt`, breach risk |
| Owner | `assignee.name` |

## H2. `CRM-TICKET-DETAIL-001` — `/tickets/:id`

| Katman | İçerik |
|--------|--------|
| Conversation | Mesaj thread |
| Details | priority, status, category |
| SLA | countdown, policy |
| Customer | link to customer 360 |
| AI | summary, suggested reply — MOCK |

## H3. `CRM-INBOX-001` — `/inbox`

| Katman | İçerik |
|--------|--------|
| Channels | Email, WhatsApp, Chat, SMS (tabs) |
| Conversation list | `preview`, `channel`, `unread`, `lastAt` |
| Conversation view | mesajlar, müşteri bağlamı |
| AI Assist | yanıt önerisi — MOCK |

---

# BÖLÜM I — GÖREV & TAKVİM (PLAN — NEXORA örneğinde var)

## I1. `CRM-TASK-LIST-001` — `/tasks`

| Kolon / öğe | Alan |
|-------------|------|
| Title | `task.title` |
| Due | `task.dueAt` |
| Priority | `task.priority` |
| Status | `task.status` |
| Related | `customer.displayName` veya `opportunity.title` |
| Owner | `assignee.name` |

## I2. `CRM-CALENDAR-001` — `/calendar`

| Katman | İçerik |
|--------|--------|
| Gün görünümü | Zaman blokları: `event.title`, `startAt`, `endAt`, renk kodu |
| Hafta / ay | — | PLAN |
| Sidebar görevler | Checklist `task.title`, `completed` |

---

# BÖLÜM J — RAPOR & ANALİTİK (PLAN — NEXORA Reports)

## J1. `CRM-ANALYTICS-001` — `/reports` veya `/analytics`

| Katman | İçerik |
|--------|--------|
| Sub-nav | Sales, Team, Team Performance, … |
| KPI row | Revenue, pipeline, orders, tickets, collections |
| Revenue trend | Area chart — zaman serisi |
| Donut / pie | Opportunities by source |
| Tablo | Drill-down satırları |

## J2. `CRM-REPORT-BUILDER-001` — `/reports/builder`

| Katman | İçerik |
|--------|--------|
| Field picker | Rapor alanları |
| Filters | Tarih, tenant, segment |
| Preview | Tablo/grafik |
| Export | **PLAN dışı canon yasak** — sadece gelecek sprint kararı ile |

---

# BÖLÜM K — IAM & YÖNETİM

## K1. `CRM-SETTINGS-001` — `/settings`

| Bölüm | İçerik | Durum |
|-------|--------|-------|
| Workspace | tenant adı, slug, plan | PLAN |
| Profil | kullanıcı adı, email | PARTIAL (JWT) |
| Güvenlik | şifre, 2FA | PLAN |

## K2. `CRM-USERS-001` — `/settings/users`

**API LIVE:** `GET /api/v1/users` — permission: `user.manage`

| Kolon | Alan |
|-------|------|
| Name | `firstName`, `lastName` |
| Email | `email` |
| Status | `status` |
| Membership | `membershipId` |

## K3. `CRM-ROLES-001` — `/settings/roles`

**API LIVE:** `POST /api/v1/roles` — permission: `role.manage`

| Alan | İçerik |
|------|--------|
| Role list | `code`, `name`, `isSystem` |
| Permissions | `permission.code` bağları |

## K4. `CRM-AUDIT-001` — `/settings/audit`

| Kolon | Alan |
|-------|------|
| Time | `createdAt` |
| Actor | `actorUserId` |
| Action | `action` |
| Entity | `entityType`, `entityId` |
| Payload | JSON özet |

*Audit UI henüz yok; backend audit log seed var.*

---

# BÖLÜM L — AI & ONAY AKIŞLARI (PLAN / MOCK)

## L1. `CRM-AI-ASK-001` — `/ai`

| Katman | İçerik |
|--------|--------|
| Ask CRM | Soru input |
| Chat | Mesaj geçmişi |
| Sources | Referans kaynakları |
| Suggested queries | Örnek sorular (risk fırsatlar, SLA, forecast) |

## L2. `CRM-APPROVAL-QUEUE-001` — `/approvals`

| Kolon | Alan |
|-------|------|
| Type | `approval.type` |
| Reference | doc no |
| Requested By | user |
| Amount | value |
| Status | pending/approved |
| Age | `createdAt` |

## L3. `CRM-NOTIFICATION-CENTER-001` — topbar overlay

| Bölüm | İçerik |
|-------|--------|
| Approvals | bekleyen onaylar |
| Mentions | @mentions |
| Assignments | yeni atamalar |
| System | sistem uyarıları |

---

# BÖLÜM M — ENTERPRISE PHASE-2 (screen-catalog)

| Screen ID | Route (hedef) | Özet içerik |
|-----------|-----------------|-------------|
| CRM-DEALER-DASH-001 | `/dealer` | Bayi KPI |
| CRM-DEALER-ORDER-001 | `/dealer/orders` | Bayi siparişleri |
| CRM-CUSTOMER-PORTAL-001 | `/portal` | Müşteri self-servis |
| CRM-WORKFLOW-BUILDER-001 | `/automation` | İş akışı editörü |
| CRM-PROCUREMENT-001 | `/procurement` | Satın alma |
| CRM-SUPPLIER-001 | `/suppliers` | Tedarikçi |
| CRM-DATA-QUALITY-001 | `/data-quality` | Veri kalitesi |
| CRM-AI-RECOMMENDATION-001 | `/ai/recommendations` | ML önerileri |

---

# BÖLÜM N — NEXORA MOCK → CRM OS EŞLEME

| NEXORA ekranı | CRM OS karşılığı | Veri durumu |
|---------------|------------------|-------------|
| Login (cam kart) | `CRM-AUTH-LOGIN-001` | **LIVE** |
| Ana Dashboard | `CRM-DASH-001` | MOCK |
| Müşteri listesi | `CRM-CUST-LIST-001` | **LIVE** (kolonlar canon’a göre) |
| Müşteri detay | `CRM-CUST-DETAIL-001` | **LIVE** + AI dock MOCK |
| Satış Pipeline Kanban | `CRM-PIPELINE-001` | PLAN (Sprint-06) |
| Görev & Takvim | `CRM-TASK` + `CRM-CALENDAR` | PLAN |
| Raporlama | `CRM-ANALYTICS-001` | PLAN |

**Görsel stil (NEXORA):** coral primary, kartlar, grafikler → **tasarım sistemi v2**  
**İçerik:** Bu envanterdeki alan adları ve API’ler → **değişmez**

---

# BÖLÜM O — ÖZET SAYIM

| Kategori | Sayfa sayısı | LIVE | PLAN/MOCK |
|----------|--------------|------|-----------|
| Auth / public | 4 | 2 | 2 |
| Global shell katmanları | 1 (çok katmanlı) | PARTIAL | — |
| Customer | 3 | 3 | — |
| Dashboard | 1 | 0 | 1 |
| Lead & Sales | 4 | 0 | 4 |
| Quote & Order | 4 | 0 | 4 |
| Product & Inventory | 2 | 0 | 2 |
| Ticket & Inbox | 3 | 0 | 3 |
| Tasks & Calendar | 2 | 0 | 2 |
| Analytics & Reports | 2 | 0 | 2 |
| IAM & Settings | 4 | 1 partial | 3 |
| AI & Approvals | 3 | 0 | 3 |
| Enterprise phase-2 | 8 | 0 | 8 |
| **Toplam ekran kimliği** | **~41** | **~6 route LIVE** | **geri kalan plan** |

---

## İlgili dokümanlar

- `docs/ux/crm-os-ui-canon-vfinal-customer-module.md` — Customer CANON
- `docs/ux/screen-catalog-v1.md` — Ekran kimlikleri
- `docs/ux/app-shell-blueprint-v1.md` — Shell hedef
- `docs/api/sprint-02-iam-openapi.md` — IAM API
- `docs/api/sprint-03-customer-openapi.md` — Customer API
- `docs/ux/sprint-04-ui-canon-gap-analysis.md` — Mevcut kod vs canon

## GPT / tasarım brief kuralı

Her ekran üretiminde bu dosyadan **Screen ID** seçin; tabloda **PLAN/MOCK** olan alanları gerçek API gibi göstermeyin — `Coming soon` veya seed mock etiketleyin.
