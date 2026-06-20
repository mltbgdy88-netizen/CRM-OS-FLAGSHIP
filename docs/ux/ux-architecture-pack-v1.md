CRM OS UX Architecture Pack v1


1. UX Vizyonu


CRM OS'un amacı klasik CRM ekranları yapmak değildir.


Amaç:


Salesforce kadar güçlü
+
Attio kadar modern
+
Linear kadar hızlı
+
Stripe Dashboard kadar temiz
+
Notion kadar sezgisel
+
AI Native


bir deneyim oluşturmaktır.




2. UX Tasarım Felsefesi


Ana Prensip


Information Dense
Not Information Overloaded


Kurumsal kullanıcı:


daha fazla veri görmek ister
ama
daha fazla karmaşa istemez




Kullanıcı Hissi


Kullanıcı CRM'e girdiğinde:


ERP kullanıyor gibi değil
komuta merkezi kullanıyor gibi hissetmeli




3. Tasarım Kimliği


Stil


Dark First
Enterprise Glass
High Density
Minimal Borders
Large Data Surfaces
AI Native




Görsel Referanslar


6




4. Navigation Architecture


Global Navigation


CRM OS
│
├── Dashboard
│
├── CRM
│   ├── Customers
│   ├── Contacts
│   ├── Activities
│
├── Sales
│   ├── Leads
│   ├── Opportunities
│   ├── Pipeline
│   ├── Quotes
│   └── Orders
│
├── Inventory
│   ├── Products
│   ├── Stock
│   ├── Reservations
│
├── Finance
│   ├── Receivables
│   ├── Payments
│
├── Support
│   ├── Inbox
│   ├── Tickets
│   ├── SLA
│
├── Analytics
│
├── AI
│
└── Settings




5. Layout Sistemi


Desktop


┌───────────────────────────────────────┐
│ Top Command Bar                       │
├───────────┬───────────────────────────┤
│ Sidebar   │ Content                   │
│           │                           │
│           │                           │
└───────────┴───────────────────────────┘




Sidebar


Genişlik:


72px collapsed
280px expanded




Content


max-width: none
full enterprise canvas


Salesforce gibi sıkışık değil.




6. Top Command Bar


CRM OS'un merkezi.


┌─────────────────────────────────────────────┐
│ Search      AI Ask CRM      Notifications   │
└─────────────────────────────────────────────┘


İçerik:


Global Search
Command Palette
Ask CRM
Notifications
Quick Create
Profile




7. AI Native UX


En büyük fark burada.


Her ekranda:


AI Panel


bulunur.




Customer Screen


Customer
│
├── Overview
├── Contacts
├── Activities
├── Quotes
└── Orders
AI Panel


AI panel:


Customer Summary
Risk Analysis
Next Best Action
Suggested Tasks
Suggested Opportunities




8. Dashboard UX


Dashboard widget çöplüğü olmayacak.




Bölümler


Executive
Sales
Operations
Finance
Support
AI Insights




Dashboard Yapısı


KPI Row
↓
Charts
↓
Alerts
↓
Tasks
↓
AI Insights




9. Customer 360 UX


Amiral gemisi ekran.




Layout


Header
↓
360 Overview
↓
Timeline
↓
Related Records
↓
AI Insights




Görsel Referans


6




10. Pipeline UX


Kanban merkezi ekran.




Layout


Filters
↓
Pipeline
↓
Opportunity Drawer
↓
AI Recommendations




Kart İçeriği


Company
Value
Probability
Owner
Next Activity
Risk Indicator




11. Quote Builder UX


Stripe + Notion hissi.




Sol


Customer
Products
Pricing




Sağ


Live Totals
Margin
Approval Status
AI Suggestions




12. Order UX


Amaç:


tek ekrandan sipariş yönetmek




Bölümler


Header
Items
Inventory Status
Shipment
Finance
Timeline




13. Support UX


Zendesk'ten ilham.




Ticket Detail


Conversation
↓
Ticket Info
↓
SLA
↓
Related Customer
↓
AI Summary




14. Analytics UX


Amaç:


PowerBI gibi karmaşık olmamak
ama
Excel gibi basit olmamak




Yapı


Filters
↓
Charts
↓
Table
↓
Export
↓
AI Analysis




15. Ask CRM UX


CRM OS'un vitrini.




Layout


┌─────────────────────┐
│ Ask CRM             │
├─────────────────────┤
│                     │
│ Chat                │
│                     │
├─────────────────────┤
│ Suggested Queries   │
└─────────────────────┘




Örnek


Bu ay en riskli fırsatlar hangileri?
↓
AI
5 fırsat risk altında...




16. Tasarım Tokenları


Radius


8
12
16
24




Grid


8px system




Shadow


soft




Border


1px subtle




17. Renk Sistemi


Base


#0B0F14
#111827
#1F2937
#374151




Text


#F9FAFB
#D1D5DB
#9CA3AF




Accent


Primary Blue
#3B82F6




Success


#22C55E




Warning


#F59E0B




Danger


#EF4444




18. Component Hierarchy


AppShell
Sidebar
TopBar
CommandPalette
DataTable
DetailView
Timeline
KanbanBoard
MetricCard
ChartCard
AIInsightCard
ActivityFeed
Drawer
Modal




19. Mobile Stratejisi


Mobil CRM değil.


Mobil Companion.




Mobilde:


Tasks
Approvals
Notifications
Customer Search
Quick Actions


öncelikli.




20. UX North Star


Kullanıcı hissi:


"Bu bir CRM değil.
Şirketimi yönettiğim operasyon merkezi."




Sonraki Paket


CRM OS Design System v2


Bu pakette artık:






Typography Scale






Design Tokens






Component Tokens






Data Table Standards






Chart Standards






Form Standards






AI Component Standards






seviyesine ineriz ve Cursor'un birebir kullanacağı UI kurallarını tanımlarız.
