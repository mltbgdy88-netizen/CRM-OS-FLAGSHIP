# CRM OS Figma Structure Pack v1

## Scope

Defines Figma production structure for CRM OS.

## Workspace Structure

```text
CRM OS Design Workspace
├── 00_Admin
├── 01_Foundations
├── 02_Component Library
├── 03_Screen Blueprints
├── 04_Prototype Flows
├── 05_Developer Handoff
└── 06_Archive
```

## Files

```text
CRM OS Foundations.fig
CRM OS Component Library.fig
CRM OS App Shell.fig
CRM OS CRM Screens.fig
CRM OS Sales Screens.fig
CRM OS Operations Screens.fig
CRM OS Inbox & AI.fig
CRM OS Admin & Security.fig
CRM OS Prototype Flows.fig
CRM OS Handoff.fig
```

## Page Hierarchy

Foundations:
- Token Index
- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Elevation Tokens
- Grid System
- Icon System
- Accessibility Standards

Component Library:
- Foundation
- Layout
- Navigation
- Forms
- Data Display
- CRM
- Sales
- Order & Inventory
- Inbox & Ticket
- AI
- Admin & Security

Screen Blueprints:
- App Shell
- Auth & Workspace
- Dashboard
- Customers
- Contacts
- Leads
- Opportunities
- Pipeline
- Quotes
- Orders
- Products & Inventory
- Tasks & Activities
- Inbox
- Tickets
- Reports & Analytics
- Automation
- AI Copilot
- Settings & RBAC
- Audit Logs

## Naming

Component naming format:

```text
Category / Component / Variant / State
```

## Grid

Desktop 1440, wide 1728, tablet 1024 and 768, mobile 390.

## Handoff

Every production component maps to code path, Storybook story, props, variants, token usage, accessibility notes, permission rules, and AI rules when relevant.

Source status: FROM_CHAT_RECONSTRUCTED.
