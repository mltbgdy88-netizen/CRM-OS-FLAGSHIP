# CRM OS App Shell Canon

## Purpose

The App Shell is the operating system layer of CRM OS.

## Layout

Authenticated screens must use:

```text
AppShell
├── Sidebar
├── Topbar
├── PageContainer
└── RightPanel optional
```

## Sidebar

- Persistent on desktop.
- Collapsed or drawer on tablet.
- Drawer on mobile.
- Navigation must be permission-aware.
- Unauthorized modules must not be exposed.

## Topbar

Must include:

- Workspace switcher
- Global search
- Command palette
- Quick create
- AI quick actions
- Notifications
- Profile menu

## Right Panel

Used for:

- AI assistant
- Entity context
- Quick edit
- Activity insights
- Approval review

## Rules

- Login, forgot password, public error, and workspace select are AppShell exceptions.
- All authenticated CRM OS pages must use AppShell.
- Workspace context must always be visible or accessible.
