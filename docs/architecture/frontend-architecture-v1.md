CRM OS Frontend Architecture v1


1. Mimari Karar


Frontend yaklaşımı:


Next.js App Router
+ TypeScript
+ Feature-Based Architecture
+ Server Components where useful
+ Client Components for CRM interactions
+ TanStack Query
+ Zustand
+ React Hook Form
+ Zod
+ TailwindCSS
+ Design System


Ana hedef:


Hızlı
Kurumsal
Kompakt
Çok modüllü
50 kişilik ekibin paralel çalışabileceği




2. Repository Yapısı


crm-os-frontend/
├── apps/
│   ├── web/
│   ├── dealer-portal/
│   ├── customer-portal/
│   └── admin-console/
│
├── packages/
│   ├── ui/
│   ├── design-tokens/
│   ├── api-client/
│   ├── auth/
│   ├── forms/
│   ├── tables/
│   ├── charts/
│   ├── config/
│   └── utils/
│
├── tooling/
│   ├── eslint/
│   ├── prettier/
│   └── tsconfig/
│
└── package.json


Önerilen yapı:


Turborepo monorepo




3. Web App Yapısı


apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── my-work/
│   │   ├── dashboard/
│   │   ├── customers/
│   │   ├── leads/
│   │   ├── pipeline/
│   │   ├── opportunities/
│   │   ├── quotes/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── finance/
│   │   ├── inbox/
│   │   ├── tickets/
│   │   ├── workflows/
│   │   ├── reports/
│   │   └── settings/
│   │
│   └── api/
│
├── features/
├── components/
├── layouts/
├── hooks/
├── lib/
├── stores/
└── middleware.ts




4. Feature-Based Structure


Her modül kendi içinde izole olacak.


Örnek Customer feature:


features/customers/
├── api/
│   ├── customers.api.ts
│   └── customers.keys.ts
│
├── components/
│   ├── customer-list.tsx
│   ├── customer-table.tsx
│   ├── customer-detail-header.tsx
│   ├── customer-overview.tsx
│   ├── customer-timeline.tsx
│   ├── customer-contact-list.tsx
│   └── customer-form.tsx
│
├── hooks/
│   ├── use-customers.ts
│   ├── use-customer.ts
│   └── use-create-customer.ts
│
├── schemas/
│   └── customer.schema.ts
│
├── types/
│   └── customer.types.ts
│
└── index.ts


Aynı standart:


leads
opportunities
quotes
orders
products
inventory
finance
inbox
tickets
workflow
reports
settings


modülleri için kullanılacak.




5. Route Planı


Auth


/login
/forgot-password
/reset-password


Main App


/my-work
/dashboard
/customers
/customers/new
/customers/[id]
/leads
/leads/new
/leads/[id]
/pipeline
/opportunities/[id]
/quotes
/quotes/new
/quotes/[id]
/quotes/[id]/preview
/orders
/orders/[id]
/products
/products/[id]
/inventory
/finance
/inbox
/tickets
/workflows
/reports
/settings/users
/settings/roles
/settings/permissions
/settings/tenant
/settings/integrations




6. Layout Sistemi


Ana layout:


┌─────────────────────────────────────────────┐
│ App Shell                                   │
├───────────────┬─────────────────────────────┤
│ Sidebar       │ Topbar                      │
│               ├─────────────────────────────┤
│ Navigation    │ Page Content                │
│               │                             │
└───────────────┴─────────────────────────────┘


Dosya:


layouts/app-shell/
├── app-shell.tsx
├── sidebar.tsx
├── topbar.tsx
├── command-menu.tsx
├── notification-center.tsx
└── user-menu.tsx




7. Design System


Paket


packages/ui


Bileşenler


Button
Input
Select
Textarea
Checkbox
Radio
Switch
Badge
Avatar
Card
Tabs
Dialog
Drawer
Sheet
Popover
Tooltip
Dropdown
CommandMenu
Table
DataGrid
Kanban
Timeline
FileUploader
DatePicker
Calendar
ChartCard
MetricCard
EmptyState
Skeleton
Toast




8. Tasarım Dili


Tema:


Dark Titanium Enterprise


Renkler:


CSS
--background
: 
#
0
A0D14
;
--surface
: 
#
111827;
--surface-2
: 
#
161
F31
;
--surface-3
: 
#
1
D2638
;
--border
: 
#
273246;
--border-soft
: 
#
1
E293B
;
--text
: 
#
F9FAFB
;
--text-muted
: 
#
94
A3B8
;
--text-soft
: 
#
CBD5E1
;
--primary
: 
#
4
F8CFF
;
--primary-hover
: 
#
6
EA2FF
;
--success
: 
#
22
C55E
;
--warning
: 
#
F59E0B
;
--danger
: 
#
EF4444
;
--info
: 
#
38
BDF8
;


Spacing:


4px base
8px grid


Radius:


8px small
12px default
16px card


Typography:


Inter


Font scale:


12px caption
13px table
14px body
16px section
20px page title
24px hero title




9. Global UI Kuralları


Yasak:


Aşırı neon
Aşırı glow
Aşırı glass
40px radius
Çok büyük kartlar
Boş dashboard


Zorunlu:


Kompakt grid
Yüksek veri yoğunluğu
Net tipografi
Hızlı aksiyon butonları
Kolay filtreleme
Keyboard shortcuts
Komut paleti




10. State Management


Server State


TanStack Query


Kullanım:


list
detail
create
update
delete
cache invalidation
pagination
infinite query


Client State


Zustand


Kullanılacak alanlar:


sidebar collapsed
theme
command menu
selected tenant
filters
temporary UI state


Form State


React Hook Form
+ Zod




11. API Client


Paket:


packages/api-client


Yapı:


api-client/
├── http.ts
├── auth.ts
├── customers.ts
├── leads.ts
├── opportunities.ts
├── quotes.ts
├── tasks.ts
└── types.ts


HTTP client görevleri:


base URL
JWT attach
X-Tenant-Id attach
refresh token handling
error normalization
requestId logging




12. Auth Flow


Login
↓
accessToken + refreshToken
↓
tenant seçimi
↓
permissions yüklenir
↓
app shell açılır


Frontend’de tutulacak:


access token: memory veya secure cookie
refresh token: httpOnly cookie
tenant id: selected tenant store
permissions: query cache




13. Permission-Based UI


Bileşen:


TypeScript
<Can
 
permission
=
"quote.approve"
>
  
<ApproveQuoteButton
 
/>
</Can>


Hook:


TypeScript
const
 
canApprove
 
=
 
useCan
(
"quote.approve"
);


UI kuralları:


Permission yoksa aksiyon görünmez
Deep link açılırsa backend 403 döner
Frontend sadece UX katmanı
Asıl güvenlik backend




14. Ana Ekranlar


My Work


İlk açılan ekran.


Bileşenler:


Today Summary
My Tasks
Hot Leads
Pending Approvals
Overdue Collections
AI Suggestions
Calendar Mini View


Executive Dashboard


Revenue
Pipeline
Forecast
Collections
Profit
Cashflow
Branch Comparison
Dealer Comparison
AI Executive Insights


Customer 360


Customer Header
Customer KPIs
Smart Actions
Tabs
Timeline
Contacts
Deals
Quotes
Orders
Payments
Files
Support


Pipeline


Pipeline Toolbar
Kanban Board
Deal Card
Deal Inspector Drawer
Stage Summary
AI Risk Indicator


Quote Builder


Product Selector
Quote Items
Live Preview
Pricing Panel
Margin Panel
Approval Status
PDF Preview


Omnichannel Inbox


Conversation List
Chat Panel
Customer Context Panel
AI Reply Suggestions
SLA Indicator




15. DataGrid Standardı


Tüm liste ekranları aynı altyapı ile yapılacak.


Özellikler:


server-side pagination
server-side sorting
server-side filtering
column visibility
saved views
bulk actions
export
row selection
keyboard navigation


Kullanım:


Customers
Leads
Quotes
Orders
Products
Payments
Tickets
Users




16. Kanban Standardı


Kullanılacak yerler:


Pipeline
Tasks
Tickets
Projects
Approvals


Özellikler:


drag-drop
stage summary
card quick actions
lazy loading
column virtualization
permission-aware drop zones




17. Timeline Standardı


Kullanılacak yerler:


Customer 360
Lead Detail
Opportunity Detail
Quote Detail
Ticket Detail
Order Detail


Event tipleri:


note
call
email
whatsapp
quote
order
payment
ticket
task
system
ai




18. Form Standardı


Her form:


Zod validation
dirty state warning
autosave opsiyonel
field-level error
submit loading
success toast
server error mapping


Form tipleri:


Create Customer
Create Lead
Create Quote
Create Order
Create Task
Create Ticket




19. Empty / Loading / Error States


Her ekran için zorunlu:


Skeleton loading
Empty state
Error state
Retry button
Permission denied state


Örnek:


Henüz müşteri yok
İlk müşterinizi ekleyerek başlayın
[+ Müşteri Ekle]




20. Command Menu


Kısayol:


Cmd/Ctrl + K


Aksiyonlar:


Customer ara
Lead oluştur
Teklif oluştur
Görev ekle
Sayfaya git
AI'a sor




21. Keyboard Shortcuts


g d  → dashboard
g c  → customers
g l  → leads
g p  → pipeline
g q  → quotes
n c  → new customer
n l  → new lead
n q  → new quote
Cmd+K → command menu
Esc   → close drawer/modal




22. Performance Rules


Zorunlu:


Route-level code splitting
Table virtualization
Lazy loaded drawers
Image optimization
API caching
Debounced search
Optimistic updates


Hedef:


Dashboard first load < 2.5s
List interaction < 200ms
Detail screen transition < 300ms
Search response < 500ms




23. Accessibility


Zorunlu:


keyboard navigation
focus states
ARIA labels
contrast AA
modal focus trap
screen reader labels




24. Frontend Testing


unit: Vitest
component: Testing Library
e2e: Playwright
visual regression: Storybook + Chromatic


Test kapsamı:


auth
permissions
customer CRUD
lead conversion
pipeline drag-drop
quote builder
forms
tables
navigation




25. Storybook


Paket:


packages/ui/storybook


Story zorunlu bileşenler:


Button
Input
Table
DataGrid
Kanban
Timeline
Dialog
Drawer
MetricCard
QuotePreview
CustomerHeader




26. Module Ownership


50 kişilik ekip için frontend sahipliği:


App Shell / Design System    Frontend Platform Squad
Customers / Leads            CRM Squad
Pipeline / Quotes            Sales Squad
Orders / Inventory           Ops Squad
Finance                      Finance Squad
Inbox / Tickets              Communication Squad
Workflow                     Automation Squad
Reports / AI                 AI/Data Squad
Admin / Settings             Core Squad




27. İlk Frontend Sprintleri


Sprint 1


Next.js setup
Tailwind setup
Design tokens
App shell
Sidebar
Topbar
Login screen
API client base
Auth store


Sprint 2


DataGrid component
Customer list
Customer detail shell
Customer create form
Customer timeline shell


Sprint 3


Lead list
Lead detail
Lead create
Lead convert modal


Sprint 4


Pipeline board
Opportunity drawer
Stage move interaction


Sprint 5


Quote builder shell
Quote item table
Pricing panel
PDF preview shell


Sprint 6


My Work
Dashboard widgets
Notifications
Command menu




28. İlk Vertical Slice


İlk çalışan frontend akışı:


Login
↓
App Shell
↓
Customer List
↓
Create Customer
↓
Customer Detail
↓
Timeline Event
↓
Create Lead
↓
Convert Lead
↓
Pipeline
↓
Create Quote


Bu kesit tamamlanınca MVP frontend omurgası doğrulanır.




29. Frontend Kalite Standardı


Her feature PR için zorunlu:


TypeScript strict
No any
Zod schema
Loading state
Empty state
Error state
Permission guard
Responsive layout
Storybook story
Unit test
E2E happy path




30. Sonraki Çıktı


Bundan sonra sıradaki doküman:


CRM OS Design System v1


olmalı.
