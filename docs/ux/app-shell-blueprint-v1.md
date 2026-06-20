# CRM OS App Shell Blueprint v1

## Scope

Persistent operating frame for all authenticated CRM OS screens.

## Sidebar Architecture

```text
Sidebar
├── Product Identity Area
├── Primary Navigation
│   ├── Dashboard
│   ├── Customers
│   ├── Leads
│   ├── Deals
│   ├── Quotes
│   ├── Orders
│   ├── Products
│   ├── Tasks
│   └── Inbox
├── Intelligence & Operations
│   ├── Reports
│   ├── Automation
│   └── AI Copilot
├── Administration
│   ├── Settings
│   ├── Users & Roles
│   ├── Audit Logs
│   └── Admin Console
└── Footer Area
```

## Topbar

```text
Topbar
├── Left Zone: mobile sidebar trigger, breadcrumbs, page status
├── Center Zone: global search, command hint
└── Right Zone: create, AI quick action, notifications, workspace switcher, user menu
```

## Workspace Switcher

Critical tenant boundary. Must show:
- workspace name
- avatar/initial
- current role
- plan/status badge
- switching/loading state

Switching workspace clears workspace-scoped cached data and recalculates permissions.

## Global Search

Searchable entities:
- Customers, Contacts, Leads, Deals, Quotes, Orders, Products, Tasks, Conversations, Reports, Settings

Search results must be workspace-scoped and permission-filtered.

## Command Palette

Trigger: Ctrl+K / Cmd+K.

Categories:
- Navigation, Create, Search, AI Actions, Reports, Workflow Actions, Admin, Help

Destructive commands require confirmation. AI commands open review flow.

## Right Panel

Variants:
- AI, EntityPreview, Notification, Activity, Filter, Help, Audit

Default width 360px, large detail width 560px. Becomes overlay/full-screen drawer on smaller screens.

## Permissions and Multi-Tenant Rules

Navigation item model:
- id, label, path, icon, section, requiredPermission, requiredPlan, featureFlag, badgeSource, children

UI must never mix entities from different workspaces.

## Cursor Implementation Prompt

Create components/layout/AppShell.tsx, Sidebar, Topbar, PageContainer, RightPanel, WorkspaceSwitcher, GlobalSearch, CommandPalette, NotificationCenter, AIQuickActions, navigation tree, permission filter, workspace types, mock data.

Source status: FROM_CHAT_RECONSTRUCTED.
