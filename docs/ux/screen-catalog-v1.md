CRM OS Screen Catalog v1


Amaç


Bu katalog Cursor'un üreteceği tüm ekranların:


Layout
Component
Navigation
Permission
AI Panel
Responsive


standartlarını belirler.


Bundan sonra:


Customer Screen yap


yerine:


Generate screen:
CRM-CUSTOMER-DETAIL-001


denecektir.




Screen Naming Convention


CRM-DASH-001
CRM-CUST-LIST-001
CRM-CUST-DETAIL-001
CRM-LEAD-LIST-001
CRM-LEAD-DETAIL-001
CRM-OPP-LIST-001
CRM-OPP-DETAIL-001
CRM-PIPELINE-001
CRM-QUOTE-LIST-001
CRM-QUOTE-BUILDER-001
CRM-ORDER-LIST-001
CRM-ORDER-DETAIL-001
CRM-PRODUCT-LIST-001
CRM-INVENTORY-001
CRM-TICKET-LIST-001
CRM-TICKET-DETAIL-001
CRM-ANALYTICS-001
CRM-AI-ASK-001




Screen-01


CRM-DASH-001


Executive Dashboard


Platform giriş ekranı.




Layout


┌─────────────────────────────┐
│ KPI Row                     │
├─────────────────────────────┤
│ Revenue     Pipeline        │
├─────────────────────────────┤
│ Orders      Tickets         │
├─────────────────────────────┤
│ AI Insights                 │
└─────────────────────────────┘




Components


MetricCard
ChartCard
AlertCard
TaskCard
AiInsightCard




AI Panel


Revenue Risk
Pipeline Risk
Collections Warning
Ticket Escalation




Screen-02


CRM-CUST-LIST-001


Customer List




Layout


EntityHeader
Filters
DataTable




Filters


Status
Owner
Segment
Tags
Industry




Columns


Customer No
Name
Owner
Status
Revenue
Last Activity




Actions


Create Customer
Export
Bulk Update




Screen-03


CRM-CUST-DETAIL-001


Customer 360


Amiral gemisi ekran.




Layout


Header
↓
Summary Cards
↓
Tabs
↓
Timeline
↓
AI Insights




Summary Cards


Revenue
Open Quotes
Open Orders
Open Tickets




Tabs


Overview
Contacts
Activities
Quotes
Orders
Tickets
Files




Right AI Panel


Customer Summary
Risk Analysis
Next Best Action
Suggested Follow-up




Screen-04


CRM-LEAD-LIST-001




Components


EntityHeader
Filters
DataTable




Columns


Lead
Company
Source
Owner
Status
Score




Screen-05


CRM-LEAD-DETAIL-001




Sections


Lead Info
Activities
Timeline
AI Analysis




AI


Conversion Probability
Suggested Owner
Suggested Next Action




Screen-06


CRM-PIPELINE-001


Pipeline Board




Layout


Filters
↓
Kanban Board
↓
Opportunity Drawer
↓
AI Suggestions




Stages


New
Qualified
Proposal
Negotiation
Won
Lost




Card Content


Company
Value
Probability
Owner
Next Activity




Drawer


Summary
Activities
Files
Notes
AI Analysis




Screen-07


CRM-OPP-DETAIL-001


Opportunity Detail




Header


Company
Value
Stage
Probability




Sections


Activities
Tasks
Files
Quotes
Timeline




AI


Win Probability
Risk Analysis
Recommended Actions




Screen-08


CRM-QUOTE-LIST-001




Columns


Quote No
Customer
Amount
Margin
Status
Created By




Actions


Create Quote
Export PDF
Bulk Status




Screen-09


CRM-QUOTE-BUILDER-001


CRM OS'un kritik ekranlarından biri.




Layout


┌──────────────┬──────────────┐
│ Products     │ Totals       │
│              │              │
│              │ Approval     │
│              │ AI           │
└──────────────┴──────────────┘




Left Panel


Products
Pricing
Discounts
Tax




Right Panel


Subtotal
Tax
Total
Margin
Approval Status




AI


Discount Suggestion
Upsell Suggestion
Risk Warning




Screen-10


CRM-ORDER-DETAIL-001




Sections


Order Info
Items
Inventory
Shipment
Finance
Timeline




Status Bar


Created
Confirmed
Reserved
Shipped
Completed




Screen-11


CRM-PRODUCT-LIST-001




Columns


SKU
Name
Category
Stock
Price
Status




Screen-12


CRM-INVENTORY-001




KPI


Available
Reserved
Incoming
Outgoing




Tabs


Ledger
Movements
Reservations
Warehouses




Screen-13


CRM-TICKET-LIST-001




Columns


Ticket No
Customer
Priority
Status
SLA
Owner




Screen-14


CRM-TICKET-DETAIL-001




Layout


Conversation
↓
Ticket Details
↓
SLA
↓
Customer
↓
AI Summary




AI


Conversation Summary
Suggested Reply
Escalation Risk




Screen-15


CRM-INBOX-001


Omnichannel Inbox




Layout


Channels
↓
Conversation List
↓
Conversation View
↓
AI Assist




Channels


Email
WhatsApp
Chat
SMS




Screen-16


CRM-ANALYTICS-001




Sections


Filters
↓
Charts
↓
Table
↓
AI Analysis




Charts


Revenue
Pipeline
Orders
Tickets
Collections




Screen-17


CRM-REPORT-BUILDER-001




Layout


Fields
↓
Filters
↓
Preview
↓
Export




Screen-18


CRM-AI-ASK-001


CRM OS vitrini.




Layout


Ask CRM
↓
Chat
↓
Sources
↓
Suggested Queries




Suggested Questions


Which opportunities are at risk?
Show customers with no activity.
Forecast next month's revenue.
Which tickets may breach SLA?




Screen-19


CRM-APPROVAL-QUEUE-001




Columns


Type
Reference
Requested By
Amount
Status
Age




Actions


Approve
Reject
Delegate




Screen-20


CRM-NOTIFICATION-CENTER-001




Sections


Approvals
Mentions
Assignments
System Alerts




Enterprise Screens (Phase-2)


CRM-DEALER-DASH-001
CRM-DEALER-ORDER-001
CRM-CUSTOMER-PORTAL-001
CRM-WORKFLOW-BUILDER-001
CRM-PROCUREMENT-001
CRM-SUPPLIER-001
CRM-DATA-QUALITY-001
CRM-AI-RECOMMENDATION-001




Cursor Generation Rule


Bir ekran üretirken:


Read:
CRM OS UX Architecture Pack
CRM OS Design System v2
CRM OS Screen Catalog
Generate:
Exact screen blueprint.
Do not invent layouts.
Reuse component library.




Screen Catalog Coverage


Dashboard
Customer
Lead
Opportunity
Pipeline
Quote
Order
Product
Inventory
Inbox
Ticket
Analytics
Reports
Approvals
AI


Bu katalog tamamlandıktan sonra mantıklı sonraki adım:


CRM OS Wireframe Blueprint Pack v1


Çünkü artık ekran isimleri belli; sıradaki iş her ekranın piksel seviyesinde desktop/tablet/mobile wireframe'lerini çıkarmaktır.
