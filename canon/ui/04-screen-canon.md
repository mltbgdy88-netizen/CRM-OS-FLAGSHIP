# CRM OS Screen Canon

## Priority Screens

1. Executive Dashboard
2. Customer List
3. Customer 360
4. Lead List
5. Lead Detail
6. Pipeline Board
7. Opportunity Detail
8. Quote List
9. Quote Builder
10. Order Detail
11. Product List
12. Inventory Overview
13. Inbox
14. Ticket Detail
15. Analytics
16. Ask CRM
17. Approval Queue
18. Notification Center

## Required Screen Contract

Each screen must define:

- screenId
- route
- module
- purpose
- required permissions
- primary components
- mock data source
- states
- responsive behavior
- AI involvement
- quality gate

## Required States

- Default
- Loading
- Empty
- Error
- PermissionDenied
- ReadOnly where relevant
- AIReviewRequired where relevant

## Screen Assembly Rule

Screens must be assembled from reusable components. Cursor must not create one-off monolithic page components.
