CRM OS Wireframe Blueprint Pack v1


Amaç


Bu paket artık ekranların:


UX → UI geçiş katmanıdır.


Cursor, Figma, Lovable, v0, Bolt veya başka bir UI üreticisi bu dokümana göre çalışacaktır.




Wireframe Standardı


Her ekran için:


Desktop (1440+)
Tablet (1024)
Mobile Companion


tanımlanır.




CRM-DASH-001


Executive Dashboard


Desktop


┌────────────────────────────────────────────────────────────┐
│ Top Command Bar                                            │
├─────────────┬──────────────────────────────────────────────┤
│ Sidebar     │ KPI-1  KPI-2  KPI-3  KPI-4                  │
│             ├──────────────────────────────────────────────┤
│             │ Revenue Trend        Pipeline Forecast       │
│             ├──────────────────────────────────────────────┤
│             │ Orders                Tickets               │
│             ├──────────────────────────────────────────────┤
│             │ AI Insights                                   │
└─────────────┴──────────────────────────────────────────────┘


Tablet


KPI Row
Revenue
Pipeline
Orders
AI Insights


Mobile


Revenue
Tasks
Approvals
Notifications




CRM-CUST-LIST-001


Customer List


Desktop


┌─────────────────────────────────────────────────────────┐
│ Customer Header                                         │
├─────────────────────────────────────────────────────────┤
│ Filters                                                 │
├─────────────────────────────────────────────────────────┤
│ Customer Table                                          │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘


Table


Customer No
Name
Owner
Revenue
Status
Last Activity




Row Click


Customer Detail


açar.




CRM-CUST-DETAIL-001


Customer 360


CRM OS'un merkezi ekranı.


Desktop


┌────────────────────────────────────────────────────────────┐
│ Customer Header                                            │
├───────────────────────────────────────┬────────────────────┤
│ Revenue      Orders      Tickets      │ AI Panel           │
├───────────────────────────────────────┤                    │
│ Tabs                                  │ Customer Summary   │
│                                       │                    │
│ Overview                              │ Risks              │
│ Contacts                              │                    │
│ Activities                            │ Next Actions       │
│ Quotes                                │                    │
│ Orders                                │                    │
├───────────────────────────────────────┤                    │
│ Timeline                              │                    │
└───────────────────────────────────────┴────────────────────┘




Tablet


Header
Cards
Tabs
Timeline
AI Drawer




Mobile


Header
Overview
Activities
AI Summary




CRM-PIPELINE-001


Opportunity Pipeline


Desktop


┌──────────────────────────────────────────────────────────────┐
│ Filters                                                      │
├──────────────────────────────────────────────────────────────┤
│ New │ Qualified │ Proposal │ Negotiation │ Won │ Lost        │
│     │           │          │             │     │             │
│     │           │          │             │     │             │
│     │           │          │             │     │             │
├───────────────────────────────────────────┬──────────────────┤
│ Opportunity Drawer                        │ AI Suggestions   │
└───────────────────────────────────────────┴──────────────────┘




Opportunity Card


Company
Amount
Probability
Owner
Next Activity




CRM-OPP-DETAIL-001


Desktop


┌────────────────────────────────────────────────────────────┐
│ Opportunity Header                                         │
├──────────────────────────────────────┬─────────────────────┤
│ Activities                           │ AI Analysis         │
│ Tasks                                │                     │
│ Files                                │ Win Probability     │
│ Quotes                               │                     │
│ Timeline                             │ Risks               │
└──────────────────────────────────────┴─────────────────────┘




CRM-QUOTE-BUILDER-001


En kritik satış ekranı


Desktop


┌────────────────────────────────────────────────────────────┐
│ Quote Header                                               │
├────────────────────────────┬───────────────────────────────┤
│ Products                   │ Totals                       │
│                            │                               │
│ Items                      │ Subtotal                     │
│                            │ Tax                           │
│ Discount                   │ Total                         │
│                            │ Margin                        │
│                            │                               │
│                            │ Approval Status               │
│                            │                               │
│                            │ AI Suggestions                │
└────────────────────────────┴───────────────────────────────┘




UX Hedefi


Excel hissi vermesin
ERP hissi vermesin
Stripe Billing hissi versin




CRM-ORDER-DETAIL-001


Desktop


┌────────────────────────────────────────────────────────────┐
│ Order Header                                               │
├────────────────────────────────────────────────────────────┤
│ Status Timeline                                            │
├────────────────────────────────────────────────────────────┤
│ Items                                                      │
├────────────────────────────────────────────────────────────┤
│ Inventory                                                  │
├────────────────────────────────────────────────────────────┤
│ Shipment                                                   │
├────────────────────────────────────────────────────────────┤
│ Finance                                                    │
└────────────────────────────────────────────────────────────┘




CRM-INVENTORY-001


Desktop


┌────────────────────────────────────────────────────────────┐
│ KPI Cards                                                  │
├────────────────────────────────────────────────────────────┤
│ Stock Table                                                │
├────────────────────────────────────────────────────────────┤
│ Reservation Panel                                          │
├────────────────────────────────────────────────────────────┤
│ Movement Timeline                                          │
└────────────────────────────────────────────────────────────┘




CRM-TICKET-DETAIL-001


Desktop


┌────────────────────────────────────────────────────────────┐
│ Ticket Header                                              │
├──────────────────────────────┬─────────────────────────────┤
│ Conversation                 │ Ticket Info                │
│                              │                             │
│                              │ SLA                         │
│                              │                             │
│                              │ Customer                    │
│                              │                             │
│                              │ AI Summary                  │
└──────────────────────────────┴─────────────────────────────┘




CRM-INBOX-001


Desktop


┌────────────┬──────────────┬───────────────────────────────┐
│ Channels   │ Conversations│ Conversation View            │
│            │              │                              │
│ Email      │              │                              │
│ WhatsApp   │              │                              │
│ SMS        │              │                              │
│ Chat       │              │                              │
├────────────┴──────────────┼───────────────────────────────┤
│                           │ AI Assist                    │
└───────────────────────────┴───────────────────────────────┘




CRM-ANALYTICS-001


Desktop


┌────────────────────────────────────────────────────────────┐
│ Filters                                                    │
├────────────────────────────────────────────────────────────┤
│ Chart 1                 Chart 2                           │
├────────────────────────────────────────────────────────────┤
│ Chart 3                 Chart 4                           │
├────────────────────────────────────────────────────────────┤
│ Data Table                                                 │
├────────────────────────────────────────────────────────────┤
│ AI Analysis                                                │
└────────────────────────────────────────────────────────────┘




CRM-AI-ASK-001


CRM OS Showcase Screen


Desktop


┌────────────────────────────────────────────────────────────┐
│ Ask CRM                                                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Chat                                                       │
│                                                            │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ Sources                                                    │
├────────────────────────────────────────────────────────────┤
│ Suggested Questions                                        │
└────────────────────────────────────────────────────────────┘




Responsive Rules


Desktop


Primary Target
1440+




Tablet


1024–1439


AI panel:


Drawer Mode




Mobile


Companion Experience


Öncelikler:


Approvals
Tasks
Notifications
Customer Search
Quick Actions




Cursor UI Generation Rule


Read:
CRM OS UX Architecture Pack
CRM OS Design System v2
CRM OS Screen Catalog v1
CRM OS Wireframe Blueprint Pack v1
Generate:
Exact wireframe implementation.
Do not invent layouts.
Use predefined components.
Preserve AI panel areas.
Preserve enterprise density.




Sonraki Mantıklı Paket


CRM OS Visual Mockup Pack v1


Bu aşamada artık wireframe değil;


Gerçek ekran görselleri
Gerçek dashboard tasarımları
Gerçek Customer 360 ekranı
Gerçek Pipeline ekranı
Gerçek Quote Builder ekranı


üreteceğiz ve bunlar Cursor UI üretiminin görsel referansı olacak.
