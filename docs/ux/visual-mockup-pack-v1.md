CRM OS Visual Mockup Pack v1 — text-only production blueprint:

# CRM OS Visual Mockup Pack v1

## 0. Production Rule

This pack is **not** for generating images yet.
It defines the visual-production system for CRM OS so future mockups, Figma files, and Cursor UI implementation can be produced consistently.

Hard rules:

* Do not render visual mockups yet.
* Do not generate images yet.
* Do not create decorative fake UI.
* Every screen must feel like a real enterprise CRM/SaaS operating system.
* Design language: premium, dense, modular, command-center style.
* UI must support future expansion to CRM, sales, finance, tasks, omnichannel inbox, automation, reporting, and AI copilot.

---

# 1. Visual Mockup Pack Structure

```txt
CRM-OS-Visual-Mockup-Pack-v1/
│
├── 00_README/
│   ├── README.md
│   ├── production_rules.md
│   ├── visual_quality_gate.md
│   └── screen_generation_order.md
│
├── 01_BRAND_AND_STYLE/
│   ├── design_direction.md
│   ├── color_system.md
│   ├── typography_system.md
│   ├── spacing_grid.md
│   ├── iconography_rules.md
│   ├── data_visualization_rules.md
│   └── dark_mode_rules.md
│
├── 02_LAYOUT_SYSTEM/
│   ├── app_shell.md
│   ├── sidebar_navigation.md
│   ├── topbar_command_center.md
│   ├── page_header_system.md
│   ├── card_grid_system.md
│   ├── table_density_system.md
│   ├── split_view_system.md
│   └── responsive_breakpoints.md
│
├── 03_COMPONENT_LIBRARY/
│   ├── buttons.md
│   ├── inputs.md
│   ├── select_combobox.md
│   ├── tabs.md
│   ├── cards.md
│   ├── tables.md
│   ├── kanban.md
│   ├── timeline.md
│   ├── command_palette.md
│   ├── ai_copilot_panel.md
│   ├── modals_drawers.md
│   ├── badges_status.md
│   ├── charts.md
│   ├── notifications.md
│   └── empty_error_loading_states.md
│
├── 04_SCREEN_BRIEFS/
│   ├── 01_login.md
│   ├── 02_workspace_select.md
│   ├── 03_command_dashboard.md
│   ├── 04_customers_list.md
│   ├── 05_customer_360.md
│   ├── 06_leads_pipeline.md
│   ├── 07_deal_detail.md
│   ├── 08_quote_builder.md
│   ├── 09_orders.md
│   ├── 10_products_inventory.md
│   ├── 11_tasks_calendar.md
│   ├── 12_omnichannel_inbox.md
│   ├── 13_conversation_detail.md
│   ├── 14_ai_copilot.md
│   ├── 15_reports_bi.md
│   ├── 16_workflow_automation.md
│   ├── 17_settings_rbac.md
│   └── 18_audit_logs.md
│
├── 05_IMAGE_PROMPTS_TEXT_ONLY/
│   ├── master_prompt.md
│   ├── negative_prompt.md
│   ├── screen_prompts.md
│   └── prompt_quality_checklist.md
│
├── 06_FIGMA_READY_BREAKDOWN/
│   ├── figma_pages.md
│   ├── component_naming.md
│   ├── variants_and_props.md
│   ├── auto_layout_rules.md
│   ├── design_tokens.md
│   └── prototype_flow.md
│
├── 07_CURSOR_IMPLEMENTATION_PROMPTS/
│   ├── master_ui_prompt.md
│   ├── component_system_prompt.md
│   ├── app_shell_prompt.md
│   ├── screen_prompts.md
│   └── implementation_quality_gate.md
│
└── 08_EXPORT_TARGETS/
    ├── figma_export_plan.md
    ├── react_next_tailwind_plan.md
    ├── storybook_plan.md
    └── qa_acceptance_checklist.md
```

---

# 2. Screen-by-Screen Design Brief

## Global Visual Direction

CRM OS should feel like a serious commercial operating system for business teams.

Visual identity:

* Enterprise SaaS command center
* Premium dark-first interface
* Dense but readable information hierarchy
* Modular cards, split views, tables, timelines, and side panels
* AI copilot embedded as an operational assistant, not a decorative chatbot
* Dashboard and detail pages must feel data-rich, not empty
* Avoid consumer-style playful UI
* Avoid generic startup landing-page visuals
* Avoid fake oversized gradients replacing real interface structure

Recommended base mood:

```txt
Dark graphite background, soft elevated panels, precise borders, subtle glow only for focus states, compact typography, high-density data layout, CRM command center, professional B2B SaaS, enterprise-grade.
```

---

## Screen 01 — Login

Purpose: Secure entry point for CRM OS.

Layout:

* Centered authentication card
* Left-side optional product value panel
* Login form with email, password, workspace hint, remember device
* Security notice
* SSO reference slot
* Forgot password
* Minimal visual noise

Key components:

* AuthCard
* InputField
* PasswordInput
* PrimaryButton
* SSOButton
* SecurityNotice
* BrandMark

Design brief:

The login screen must communicate trust, security, and enterprise readiness. It should not look like a basic template. Keep it clean, premium, and controlled.

---

## Screen 02 — Workspace Select

Purpose: Let the user choose or create a workspace after login.

Layout:

* Centered workspace selector
* Workspace cards
* Recently used badge
* Role indicator
* Create workspace CTA
* User identity block
* Logout/switch account option

Key components:

* WorkspaceCard
* AvatarStack
* RoleBadge
* SearchInput
* CreateWorkspaceButton

Design brief:

This page should feel like entering an operating system. Workspace cards must show business context: company name, role, last active date, plan/status.

---

## Screen 03 — Command Dashboard

Purpose: Main CRM OS command center.

Layout:

* Persistent left sidebar
* Top command bar
* KPI row
* Sales pipeline summary
* Revenue/collections summary
* Today’s tasks
* Recent customer activity
* AI recommendations panel
* Alerts and approvals

Key components:

* AppShell
* Sidebar
* Topbar
* KPIStatCard
* PipelineMiniChart
* TaskListCard
* ActivityFeed
* AIInsightCard
* AlertBadge

Design brief:

This is the flagship screen. It must instantly communicate “business operating system.” It should look commercially valuable and data-rich.

---

## Screen 04 — Customers List

Purpose: Manage customers, accounts, leads, and contacts.

Layout:

* Page header with actions
* Filter/search toolbar
* Segment tabs
* Dense customer table
* Right-side quick preview drawer
* Bulk action bar
* Status and risk indicators

Key components:

* DataTable
* FilterBar
* SegmentTabs
* CustomerStatusBadge
* RiskScoreBadge
* BulkActionToolbar
* PreviewDrawer

Design brief:

The table should look like a serious CRM database, not a spreadsheet clone. Include meaningful columns: customer, owner, segment, last activity, open value, balance, status.

---

## Screen 05 — Customer 360

Purpose: Unified customer profile.

Layout:

* Customer header with name, status, owner, tags
* Left customer facts panel
* Main activity timeline
* Open deals/orders/tasks tabs
* Right AI summary panel
* Financial snapshot
* Communication history

Key components:

* EntityHeader
* CustomerInfoPanel
* Timeline
* RelatedRecordsTabs
* FinancialSnapshotCard
* AIAccountSummary
* ContactMethodButtons

Design brief:

This screen must feel like the “single source of truth” for a customer. It should combine CRM, sales, finance, and communication context.

---

## Screen 06 — Leads Pipeline

Purpose: Visual sales pipeline.

Layout:

* Kanban board
* Stage columns
* Deal cards
* Pipeline value summary
* Filters by owner, source, date, status
* Forecast panel
* Drag-and-drop-ready visual structure

Key components:

* KanbanBoard
* KanbanColumn
* DealCard
* PipelineSummaryBar
* ForecastCard
* OwnerFilter
* StageBadge

Design brief:

Use a premium Kanban layout with compact cards. Cards should include company, value, probability, next step, owner, due date.

---

## Screen 07 — Deal Detail

Purpose: Manage a single opportunity/deal.

Layout:

* Deal header with stage, value, probability
* Stage progress tracker
* Deal facts panel
* Activity timeline
* Quote/order links
* Stakeholders
* AI next-best-action panel

Key components:

* DealHeader
* StageStepper
* DealMetricsCard
* StakeholderList
* ActivityComposer
* NextBestActionCard
* RelatedQuotesTable

Design brief:

This page should help a sales user decide what to do next. It must be action-oriented, not just informational.

---

## Screen 08 — Quote Builder

Purpose: Create and edit commercial offers.

Layout:

* Quote metadata header
* Customer selector
* Line-item editor
* Product picker
* Price/discount/tax summary
* Approval status
* Preview/send actions
* AI pricing/comment suggestion panel

Key components:

* QuoteHeader
* CustomerSelector
* LineItemTable
* ProductSearchModal
* PriceSummaryCard
* ApprovalBadge
* SendQuoteCTA
* AIQuoteAssistant

Design brief:

This screen must feel like a real commercial document builder. The line-item table is the heart of the UI.

---

## Screen 09 — Orders

Purpose: Track orders and fulfillment status.

Layout:

* Order list table
* Status filters
* Fulfillment timeline
* Payment status column
* Delivery/branch indicators
* Side drawer order detail

Key components:

* OrderTable
* OrderStatusBadge
* PaymentStatusBadge
* FulfillmentTimeline
* OrderDetailDrawer
* BranchBadge

Design brief:

Orders should look operational. Prioritize clarity around status, money, delivery, and responsibility.

---

## Screen 10 — Products & Inventory

Purpose: Manage products, stock, pricing, and variants.

Layout:

* Product catalog table/grid toggle
* Product filters
* Inventory status
* Stock movement mini chart
* Variant drawer
* Price list tabs

Key components:

* ProductTable
* ProductCard
* InventoryBadge
* StockMovementChart
* VariantDrawer
* PriceListTabs
* SKUDisplay

Design brief:

The screen should support both catalog browsing and serious inventory control. Avoid e-commerce storefront styling.

---

## Screen 11 — Tasks & Calendar

Purpose: Team task planning and CRM follow-ups.

Layout:

* Calendar view
* Task list side panel
* Today focus panel
* Priority badges
* Related customer/deal links
* AI daily planning card

Key components:

* CalendarGrid
* TaskCard
* PriorityBadge
* DueDateIndicator
* RelatedEntityLink
* DailyPlanCard
* TaskComposer

Design brief:

This screen should connect daily work with CRM entities. Every task should feel tied to a customer, deal, order, or internal workflow.

---

## Screen 12 — Omnichannel Inbox

Purpose: Unified communication center.

Layout:

* Channel filter rail
* Conversation list
* Main conversation preview
* Customer context panel
* Assignment controls
* SLA and sentiment badges

Key components:

* ChannelRail
* ConversationList
* ConversationPreview
* CustomerContextPanel
* AssignmentDropdown
* SLABadge
* SentimentBadge

Design brief:

This must look like a business-grade command inbox, not a casual chat app. It should support WhatsApp, Instagram, Facebook, email, and future channels.

---

## Screen 13 — Conversation Detail

Purpose: Handle a single customer conversation.

Layout:

* Conversation thread
* Message composer
* AI reply suggestions
* Customer profile sidebar
* Related deals/orders/tasks
* Internal notes
* Assignment/status controls

Key components:

* MessageThread
* MessageBubble
* Composer
* AIReplySuggestion
* InternalNoteBlock
* RelatedEntityPanel
* ConversationStatusBar

Design brief:

The conversation page must combine support, sales, and CRM context. AI should assist but not dominate.

---

## Screen 14 — AI Copilot

Purpose: Dedicated operational AI assistant.

Layout:

* AI command interface
* Suggested actions
* Context selector
* Recent AI tasks
* Generated summaries
* Human approval controls
* Audit visibility

Key components:

* AICommandInput
* SuggestedPromptCard
* ContextPicker
* AITaskHistory
* GeneratedInsightBlock
* ApprovalControls
* AITracePanel

Design brief:

AI Copilot should feel controlled, auditable, and business-safe. Avoid fantasy AI visuals. Make it feel useful for CRM work.

---

## Screen 15 — Reports & BI

Purpose: Business intelligence dashboard.

Layout:

* Report category tabs
* KPI cards
* Chart grid
* Filter/date range toolbar
* Sales funnel analytics
* Customer health analytics
* Revenue and collection charts
* Export controls

Key components:

* ReportTabs
* DateRangePicker
* KPIGrid
* ChartCard
* FunnelChart
* RevenueChart
* ExportButton
* SavedViewDropdown

Design brief:

Reports must feel boardroom-ready. Charts must be structured, clean, and credible.

---

## Screen 16 — Workflow Automation

Purpose: Create CRM automations.

Layout:

* Automation list
* Trigger-action builder
* Workflow canvas
* Rule configuration panel
* Test/run controls
* Status and execution history

Key components:

* WorkflowCanvas
* TriggerNode
* ActionNode
* RulePanel
* ExecutionLogTable
* AutomationStatusBadge
* TestWorkflowButton

Design brief:

This screen should look powerful but controlled. The builder must be understandable for non-technical business users.

---

## Screen 17 — Settings & RBAC

Purpose: Manage workspace settings, users, roles, permissions.

Layout:

* Settings navigation
* User/member table
* Role editor
* Permission matrix
* Workspace configuration
* Billing/plan reference slot
* Security settings

Key components:

* SettingsSidebar
* MemberTable
* RoleEditor
* PermissionMatrix
* WorkspaceSettingsForm
* SecurityToggle
* PlanStatusCard

Design brief:

This page should communicate administrative control. Permission matrix must be clear and enterprise-grade.

---

## Screen 18 — Audit Logs

Purpose: Security and operational audit trail.

Layout:

* Audit event table
* Event type filters
* Actor/resource columns
* Timestamp
* Severity/status
* Detail drawer
* Export button

Key components:

* AuditTable
* EventTypeBadge
* ActorCell
* SeverityBadge
* AuditDetailDrawer
* JSONDiffBlock
* ExportAuditButton

Design brief:

Audit logs must feel trustworthy and compliance-oriented. Dense table design is acceptable here.

---

# 3. Figma-Ready Component Breakdown

## Figma Pages

```txt
00 Cover
01 Design Tokens
02 Foundations
03 App Shell
04 Navigation
05 Data Display
06 Forms
07 CRM Components
08 Sales Components
09 Communication Components
10 AI Components
11 Reporting Components
12 Admin Components
13 Screen Mockups
14 Prototype Flow
15 QA Notes
```

## Design Tokens

### Color Tokens

```txt
color.bg.base
color.bg.surface
color.bg.surfaceElevated
color.bg.overlay

color.border.subtle
color.border.strong
color.border.focus

color.text.primary
color.text.secondary
color.text.muted
color.text.inverse

color.brand.primary
color.brand.primaryHover
color.brand.soft

color.status.success
color.status.warning
color.status.danger
color.status.info
color.status.neutral

color.ai.accent
color.finance.positive
color.finance.negative
```

### Typography Tokens

```txt
font.family.sans
font.size.xs
font.size.sm
font.size.md
font.size.lg
font.size.xl
font.size.2xl

font.weight.regular
font.weight.medium
font.weight.semibold
font.weight.bold

lineHeight.tight
lineHeight.normal
lineHeight.relaxed
```

### Spacing Tokens

```txt
space.1 = 4px
space.2 = 8px
space.3 = 12px
space.4 = 16px
space.5 = 20px
space.6 = 24px
space.8 = 32px
space.10 = 40px
space.12 = 48px
```

### Radius Tokens

```txt
radius.sm
radius.md
radius.lg
radius.xl
radius.full
```

### Elevation Tokens

```txt
shadow.card
shadow.drawer
shadow.modal
shadow.focus
```

---

## Core Components

### App Shell

Variants:

```txt
AppShell / Default
AppShell / WithRightPanel
AppShell / Dense
AppShell / Admin
```

Props:

```txt
sidebarCollapsed: true | false
rightPanelVisible: true | false
theme: dark | light
```

---

### Sidebar Navigation

Items:

```txt
Dashboard
Customers
Leads
Deals
Quotes
Orders
Products
Tasks
Inbox
Reports
Automation
AI Copilot
Settings
Admin
```

Variants:

```txt
Sidebar / Expanded
Sidebar / Collapsed
SidebarItem / Default
SidebarItem / Active
SidebarItem / Hover
SidebarItem / Disabled
SidebarItem / WithBadge
```

---

### Topbar Command Center

Elements:

```txt
Global Search
Command Palette Trigger
Workspace Switcher
Create Button
Notifications
AI Quick Action
User Menu
```

Variants:

```txt
Topbar / Default
Topbar / WithBreadcrumbs
Topbar / WithSearchFocused
```

---

### Data Table

Variants:

```txt
DataTable / Standard
DataTable / Dense
DataTable / WithCheckboxes
DataTable / WithPinnedColumn
DataTable / Empty
DataTable / Loading
```

Cells:

```txt
TextCell
EntityCell
MoneyCell
DateCell
StatusCell
OwnerCell
ActionCell
RiskScoreCell
```

---

### Cards

Variants:

```txt
Card / Standard
Card / Elevated
Card / Interactive
Card / KPI
Card / AIInsight
Card / Warning
Card / Compact
```

---

### CRM Entity Header

Used on:

```txt
Customer 360
Deal Detail
Quote Detail
Order Detail
Product Detail
```

Parts:

```txt
Entity name
Status badge
Owner
Tags
Primary action
Secondary actions
Meta row
```

---

### Timeline

Variants:

```txt
Timeline / Activity
Timeline / Communication
Timeline / Fulfillment
Timeline / Audit
```

Event types:

```txt
Call
Email
WhatsApp
Note
Task
Deal update
Quote sent
Order created
Payment received
System event
AI action
```

---

### Kanban

Variants:

```txt
KanbanBoard / SalesPipeline
KanbanBoard / TaskBoard
KanbanColumn / Default
KanbanColumn / Highlighted
KanbanCard / Deal
KanbanCard / Task
```

---

### AI Copilot Panel

Variants:

```txt
AIPanel / RightDocked
AIPanel / FullPage
AIPanel / InlineSuggestion
AIPanel / ApprovalRequired
```

Parts:

```txt
Context summary
Suggested action
Confidence indicator
Source/reference area
Approve button
Edit button
Reject button
Audit trace link
```

---

### Omnichannel Components

```txt
ChannelRail
ConversationListItem
MessageBubble
MessageComposer
AIReplySuggestion
InternalNote
SLABadge
SentimentBadge
AssignmentControl
```

---

### Reporting Components

```txt
KPIGrid
ChartCard
FunnelChart
RevenueChart
SavedViewDropdown
DateRangePicker
ExportMenu
```

---

### Admin Components

```txt
MemberTable
RoleEditor
PermissionMatrix
AuditTable
SecurityToggle
PlanStatusCard
WorkspaceSettingsForm
```

---

# 4. Image Generation Prompts for Each Screen

These are **text-only prompts** to be used later. Do not execute them in this phase.

## Master Visual Prompt

```txt
Design a premium enterprise CRM operating system interface called CRM OS. 
Dark-first professional SaaS UI, dense command-center layout, graphite background, elevated cards, precise borders, compact typography, high-information hierarchy, realistic business data, modular panels, enterprise-grade navigation, subtle focus glow, no decorative fake charts, no consumer app styling, no landing page layout.
```

## Global Negative Prompt

```txt
Do not create a marketing website, do not create a mobile-only app, do not use playful cartoon visuals, do not use random fake logos, do not use oversized gradients as the main design, do not make the UI empty, do not use unreadable tiny text, do not create fantasy holograms, do not create unrealistic sci-fi controls, do not generate distorted tables, do not invent irrelevant CRM features, do not make it look like a generic admin template.
```

---

## Screen 01 Prompt — Login

```txt
Create a dark premium enterprise SaaS login screen for CRM OS. Centered secure login card with email, password, remember device, forgot password, SSO options, security notice, and subtle product identity. Add a left-side value panel showing CRM OS as a business command center. Professional B2B, graphite surfaces, clean typography, high trust, minimal noise.
```

## Screen 02 Prompt — Workspace Select

```txt
Create a CRM OS workspace selection screen. Show multiple workspace cards with company name, user role, last active date, plan/status badge, and create workspace action. Dark enterprise UI, centered layout, premium SaaS operating system feel, precise spacing, subtle borders, professional command center atmosphere.
```

## Screen 03 Prompt — Command Dashboard

```txt
Create the main CRM OS command dashboard. Include left sidebar navigation, top command bar, KPI cards, sales pipeline summary, revenue and collections card, today’s tasks, customer activity feed, AI recommendations panel, alerts and approvals. Dense enterprise SaaS dashboard, dark graphite UI, realistic CRM data, premium command-center layout.
```

## Screen 04 Prompt — Customers List

```txt
Create a CRM OS customers list screen. Include app shell, page header, search and filter toolbar, segment tabs, dense customer data table, status badges, risk score, owner column, open value, last activity, and right-side preview drawer. Professional CRM database interface, dark premium SaaS style, high data clarity.
```

## Screen 05 Prompt — Customer 360

```txt
Create a CRM OS Customer 360 profile screen. Show customer header, status, owner, tags, left customer facts panel, central activity timeline, related deals/orders/tasks tabs, financial snapshot, communication history, and right AI account summary panel. Enterprise CRM single-source-of-truth interface, dark professional UI.
```

## Screen 06 Prompt — Leads Pipeline

```txt
Create a CRM OS sales leads pipeline screen. Show Kanban columns by stage, compact deal cards with company name, value, probability, next step, owner, due date, plus pipeline summary and forecast panel. Premium dark enterprise SaaS UI, realistic CRM sales workflow, drag-and-drop-ready structure.
```

## Screen 07 Prompt — Deal Detail

```txt
Create a CRM OS deal detail screen. Include deal header with stage, value, probability, stage progress tracker, deal metrics, stakeholders, activity timeline, related quotes table, and AI next-best-action panel. Professional sales CRM interface, dense but readable, premium dark SaaS command layout.
```

## Screen 08 Prompt — Quote Builder

```txt
Create a CRM OS quote builder screen. Include quote metadata header, customer selector, editable line-item table, product picker, discount/tax fields, price summary card, approval status, preview/send actions, and AI quote assistant panel. Enterprise commercial document builder, dark premium UI, realistic business data.
```

## Screen 09 Prompt — Orders

```txt
Create a CRM OS orders management screen. Include order table, status filters, payment status badges, fulfillment timeline, branch/delivery indicators, and side drawer order detail. Operational enterprise CRM design, dark graphite interface, clear status hierarchy, professional order tracking layout.
```

## Screen 10 Prompt — Products & Inventory

```txt
Create a CRM OS products and inventory screen. Include product catalog table, SKU column, stock status badges, inventory levels, variant drawer, price list tabs, and stock movement chart. Serious business inventory interface, not e-commerce storefront, premium enterprise SaaS dark theme.
```

## Screen 11 Prompt — Tasks & Calendar

```txt
Create a CRM OS tasks and calendar screen. Include calendar grid, task list side panel, today focus panel, priority badges, due dates, related customer/deal links, and AI daily planning card. Enterprise productivity inside CRM, dark premium SaaS interface, structured and operational.
```

## Screen 12 Prompt — Omnichannel Inbox

```txt
Create a CRM OS omnichannel inbox screen. Include channel rail for WhatsApp, Instagram, Facebook, email, conversation list, selected conversation preview, customer context panel, assignment controls, SLA badges, sentiment indicators. Business-grade communication center, premium dark enterprise CRM UI.
```

## Screen 13 Prompt — Conversation Detail

```txt
Create a CRM OS conversation detail screen. Show message thread, composer, AI reply suggestions, customer profile sidebar, related deals/orders/tasks, internal notes, assignment and status controls. Professional omnichannel support and sales conversation interface, dark enterprise SaaS style.
```

## Screen 14 Prompt — AI Copilot

```txt
Create a CRM OS AI Copilot screen. Include AI command input, suggested business actions, context selector, recent AI tasks, generated summaries, approval controls, confidence indicator, and audit trace panel. Controlled enterprise AI assistant UI, professional, auditable, business-safe, dark premium SaaS.
```

## Screen 15 Prompt — Reports & BI

```txt
Create a CRM OS reports and BI dashboard. Include report category tabs, KPI grid, date range filters, sales funnel chart, revenue chart, customer health analytics, collection chart, saved views, and export controls. Boardroom-ready enterprise analytics UI, dark professional SaaS design.
```

## Screen 16 Prompt — Workflow Automation

```txt
Create a CRM OS workflow automation builder screen. Include automation list, trigger-action workflow canvas, rule configuration panel, test workflow button, status badges, and execution history table. Powerful but understandable business automation UI, premium dark enterprise SaaS.
```

## Screen 17 Prompt — Settings & RBAC

```txt
Create a CRM OS settings and role-based access control screen. Include settings sidebar, member table, role editor, permission matrix, workspace settings, security toggles, and plan status card. Enterprise admin interface, dark premium SaaS, clear permission control hierarchy.
```

## Screen 18 Prompt — Audit Logs

```txt
Create a CRM OS audit logs screen. Include dense audit event table, event type filters, actor/resource columns, timestamp, severity badges, detail drawer, JSON diff block, and export button. Compliance-oriented enterprise security UI, dark professional CRM OS interface.
```

---

# 5. Cursor UI Implementation Prompts

## Master Cursor UI Prompt

```txt
You are implementing CRM OS UI from the Visual Mockup Pack v1 blueprint.

Build a production-grade Next.js + React + TypeScript + Tailwind UI system.

Rules:
- Do not implement backend logic.
- Do not fake production integrations.
- Use realistic static seed data only for UI demonstration.
- Create reusable components before screen-specific code.
- Maintain enterprise SaaS density and CRM OS visual hierarchy.
- Dark-first theme.
- All screens must share one AppShell, Sidebar, Topbar, design tokens, table system, card system, badge system, drawer system, and AI panel system.
- No random design drift between pages.
- No marketing landing page style.
- No decorative reference slot dashboards.
- All data tables must have realistic business columns.
- All AI features must appear as controlled assistant panels with approval/audit affordances.
```

---

## Cursor Prompt — Component System

```txt
Create the CRM OS frontend component system.

Stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style primitives if available
- lucide-react icons if available
- No backend calls yet
- Static mock data allowed

Create:
- AppShell
- Sidebar
- Topbar
- PageHeader
- Card
- KPIStatCard
- DataTable
- Badge
- StatusBadge
- FilterBar
- Tabs
- Drawer
- Modal
- Timeline
- KanbanBoard
- AIInsightCard
- AICopilotPanel
- EmptyState
- LoadingState

Requirements:
- Dark-first enterprise CRM OS style.
- Centralize tokens in Tailwind config or a design token file.
- Every component must be reusable.
- Add variants for dense enterprise layouts.
- Keep accessibility basics: focus states, semantic buttons, labels.
```

---

## Cursor Prompt — App Shell

```txt
Implement the CRM OS AppShell.

Requirements:
- Persistent left sidebar.
- Topbar with global search, command trigger, create button, notifications, AI quick action, workspace switcher, user menu.
- Content area with consistent page padding.
- Optional right-side panel support.
- Sidebar items: Dashboard, Customers, Leads, Deals, Quotes, Orders, Products, Tasks, Inbox, Reports, Automation, AI Copilot, Settings, Admin.
- Active route styling.
- Collapsed sidebar state.
- Dark-first premium SaaS style.
- Use realistic icons.
- No backend integration.
```

---

## Cursor Prompt — Screen 01 Login

```txt
Create the CRM OS Login screen.

Requirements:
- Centered login card.
- Email input.
- Password input.
- Remember device checkbox.
- Forgot password link.
- Primary login button.
- SSO reference slot buttons.
- Security notice.
- Optional left-side product value panel.
- Premium dark enterprise visual style.
- No real authentication.
- Form can log values locally or stay static.
```

---

## Cursor Prompt — Screen 02 Workspace Select

```txt
Create the Workspace Select screen.

Requirements:
- Workspace cards with company name, role, last active date, plan/status badge.
- Search input.
- Create workspace action.
- User identity block.
- Logout/switch account option.
- Use static mock workspace data.
- Layout should feel like entering a business operating system.
```

---

## Cursor Prompt — Screen 03 Command Dashboard

```txt
Create the CRM OS Command Dashboard.

Requirements:
- Use AppShell.
- KPI cards: Revenue, Open Pipeline, Collection Due, Active Customers, Today’s Tasks.
- Sales pipeline summary card.
- Revenue/collections chart reference slot with structured UI.
- Today task list.
- Customer activity feed.
- AI recommendations panel.
- Alerts and approvals card.
- Use realistic mock CRM data.
- Must look dense, commercial, and operational.
```

---

## Cursor Prompt — Screen 04 Customers List

```txt
Create the Customers List screen.

Requirements:
- Page header with “Customers” title and Create Customer button.
- Search/filter toolbar.
- Segment tabs.
- Dense table with columns: Customer, Segment, Owner, Status, Risk, Open Value, Balance, Last Activity, Actions.
- Right preview drawer triggered by selecting a row.
- Bulk action toolbar when rows are selected.
- Static mock data only.
```

---

## Cursor Prompt — Screen 05 Customer 360

```txt
Create the Customer 360 screen.

Requirements:
- Entity header with customer name, status, owner, tags.
- Left facts panel.
- Central activity timeline.
- Tabs for Deals, Orders, Tasks, Files, Notes.
- Financial snapshot card.
- Communication history card.
- Right-side AI account summary panel.
- Use realistic customer mock data.
```

---

## Cursor Prompt — Screen 06 Leads Pipeline

```txt
Create the Leads Pipeline screen.

Requirements:
- Kanban board with columns: New, Qualified, Proposal, Negotiation, Won, Lost.
- Deal cards with company, value, probability, next step, owner, due date.
- Pipeline summary bar.
- Owner/source/date filters.
- Forecast side panel.
- Static drag-ready layout; actual drag-and-drop can be left as ACTION_ITEM.
```

---

## Cursor Prompt — Screen 07 Deal Detail

```txt
Create the Deal Detail screen.

Requirements:
- Deal header with stage, value, probability.
- Stage progress tracker.
- Deal metrics card.
- Stakeholder list.
- Activity timeline.
- Related quotes table.
- AI next-best-action panel.
- Action buttons: Add Activity, Create Quote, Mark Won.
- Static UI only.
```

---

## Cursor Prompt — Screen 08 Quote Builder

```txt
Create the Quote Builder screen.

Requirements:
- Quote metadata header.
- Customer selector.
- Editable-looking line-item table.
- Product search modal reference slot.
- Quantity, unit price, discount, tax, total columns.
- Price summary card.
- Approval status badge.
- Preview and Send Quote actions.
- AI quote assistant panel.
- Static calculations can be mocked.
```

---

## Cursor Prompt — Screen 09 Orders

```txt
Create the Orders screen.

Requirements:
- Order table with columns: Order No, Customer, Status, Payment, Branch, Delivery Date, Owner, Total, Actions.
- Status filter tabs.
- Payment status badges.
- Side drawer order detail.
- Fulfillment timeline.
- Static order data.
```

---

## Cursor Prompt — Screen 10 Products & Inventory

```txt
Create the Products & Inventory screen.

Requirements:
- Product table/grid toggle UI.
- Product table columns: SKU, Product, Category, Stock, Reserved, Available, Price List, Status, Actions.
- Inventory badges.
- Variant drawer.
- Price list tabs.
- Stock movement chart reference slot.
- Serious inventory management style, not storefront style.
```

---

## Cursor Prompt — Screen 11 Tasks & Calendar

```txt
Create the Tasks & Calendar screen.

Requirements:
- Calendar grid.
- Task list side panel.
- Today focus panel.
- Priority badges.
- Related customer/deal links.
- Task composer button.
- AI daily planning card.
- Static task data.
```

---

## Cursor Prompt — Screen 12 Omnichannel Inbox

```txt
Create the Omnichannel Inbox screen.

Requirements:
- Channel rail for WhatsApp, Instagram, Facebook, Email, SMS.
- Conversation list.
- Selected conversation preview.
- Customer context panel.
- Assignment dropdown.
- SLA badge.
- Sentiment badge.
- Unread counters.
- Static conversation data.
```

---

## Cursor Prompt — Screen 13 Conversation Detail

```txt
Create the Conversation Detail screen.

Requirements:
- Message thread.
- Customer and agent message bubbles.
- Message composer.
- AI reply suggestions.
- Internal note block.
- Customer profile sidebar.
- Related deals/orders/tasks panel.
- Assignment and status controls.
- Static conversation data.
```

---

## Cursor Prompt — Screen 14 AI Copilot

```txt
Create the AI Copilot screen.

Requirements:
- AI command input.
- Suggested prompt/action cards.
- Context picker: Customer, Deal, Order, Inbox, Report.
- Recent AI task history.
- Generated insight block.
- Approval controls: Approve, Edit, Reject.
- Confidence indicator.
- Audit trace panel.
- UI must look controlled and enterprise-safe.
```

---

## Cursor Prompt — Screen 15 Reports & BI

```txt
Create the Reports & BI screen.

Requirements:
- Report category tabs.
- Date range picker.
- KPI grid.
- Sales funnel chart reference slot.
- Revenue chart reference slot.
- Customer health analytics.
- Collections chart.
- Saved views dropdown.
- Export menu.
- Static analytics data.
```

---

## Cursor Prompt — Screen 16 Workflow Automation

```txt
Create the Workflow Automation screen.

Requirements:
- Automation list.
- Workflow canvas.
- Trigger node.
- Action nodes.
- Rule configuration panel.
- Test workflow button.
- Automation status badges.
- Execution history table.
- Static automation data.
```

---

## Cursor Prompt — Screen 17 Settings & RBAC

```txt
Create the Settings & RBAC screen.

Requirements:
- Settings sidebar.
- Member table.
- Role editor.
- Permission matrix.
- Workspace settings form.
- Security toggles.
- Plan status card.
- Static member, role, and permission data.
- UI must feel enterprise-admin-grade.
```

---

## Cursor Prompt — Screen 18 Audit Logs

```txt
Create the Audit Logs screen.

Requirements:
- Dense audit event table.
- Filters for event type, actor, severity, date.
- Columns: Time, Actor, Event, Resource, Workspace, IP, Severity, Status.
- Detail drawer.
- JSON diff block.
- Export button.
- Static audit events.
- Compliance/security visual tone.
```

---

# 6. Production Quality Gate

Before any image or UI implementation is approved, each screen must pass these gates:

```txt
[ ] Uses CRM OS app shell consistently.
[ ] Looks like enterprise SaaS, not a generic admin template.
[ ] Contains realistic business data.
[ ] Has clear page purpose.
[ ] Uses correct CRM terminology.
[ ] Has dense but readable layout.
[ ] Supports future real implementation in React.
[ ] Avoids fake decorative elements.
[ ] AI is controlled, auditable, and action-oriented.
[ ] No screen drifts into unrelated product scope.
[ ] Tables, cards, drawers, and panels are reusable.
[ ] Dark-first theme remains consistent.
```

---

# 7. Recommended Production Order

```txt
1. Component system
2. App shell
3. Command Dashboard
4. Customers List
5. Customer 360
6. Leads Pipeline
7. Deal Detail
8. Quote Builder
9. Orders
10. Products & Inventory
11. Tasks & Calendar
12. Omnichannel Inbox
13. Conversation Detail
14. AI Copilot
15. Reports & BI
16. Workflow Automation
17. Settings & RBAC
18. Audit Logs
19. Login
20. Workspace Select
```

Reason:

Build the core operating interface first, then supporting entry/admin screens.

---

# 8. Next Execution Instruction

The next production step should be:

```txt
Create CRM OS Component System v1 as text only.

Include:
1. Design tokens
2. Component list
3. Component variants
4. Component states
5. Figma naming convention
6. Cursor implementation prompt
7. Quality gate

Do not generate images.
Do not render mockups.
```

Prepared as **CRM OS Visual Mockup Pack v1** with image generation explicitly deferred.
