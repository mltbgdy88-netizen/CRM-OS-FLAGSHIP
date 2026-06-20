# CRM OS Event Catalog Canon v1

## Core & Tenant Events

```text
TenantCreated
TenantUpdated
TenantSuspended
TenantReactivated
TenantDeleted
TenantSettingsUpdated
PlanChanged
SubscriptionStarted
SubscriptionRenewed
SubscriptionCancelled
FeatureFlagEnabled
FeatureFlagDisabled
UsageQuotaExceeded
```

## IAM & Security Events

```text
UserInvited
UserInvitationAccepted
UserCreated
UserUpdated
UserDeactivated
UserDeleted
UserLoggedIn
UserLoginFailed
UserLoggedOut
PasswordChanged
PasswordResetRequested
PasswordResetCompleted
MFAEnabled
MFADisabled
RoleCreated
RoleChanged
RoleDeleted
PermissionGranted
PermissionRevoked
SessionRevoked
DeviceRegistered
SecurityAlertCreated
```

## CRM & Customer Events

```text
CustomerCreated
CustomerUpdated
CustomerDeleted
CustomerRestored
CustomerMerged
CustomerTagged
CustomerUntagged
CustomerAssigned
CustomerStatusChanged
CustomerRiskScoreUpdated
CustomerLifetimeValueUpdated
CustomerConsentUpdated
CustomerFileUploaded
CustomerNoteCreated
CustomerTimelineEventCreated
ContactCreated
ContactUpdated
ContactDeleted
AddressCreated
AddressUpdated
AddressDeleted
```

## Lead Events

```text
LeadCreated
LeadUpdated
LeadAssigned
LeadQualified
LeadDisqualified
LeadNurtureStarted
LeadScoreUpdated
LeadConverted
LeadLost
LeadDuplicateDetected
LeadSourceCreated
LeadActivityCreated
```

## Sales & Opportunity Events

```text
PipelineCreated
PipelineUpdated
PipelineStageCreated
PipelineStageUpdated
OpportunityCreated
OpportunityUpdated
OpportunityAssigned
OpportunityStageChanged
OpportunityValueChanged
OpportunityProbabilityChanged
OpportunityWon
OpportunityLost
OpportunityReopened
OpportunityProductAdded
OpportunityProductRemoved
OpportunityActivityCreated
OpportunityRiskDetected
```

## Quote Events

```text
QuoteCreated
QuoteUpdated
QuoteItemAdded
QuoteItemUpdated
QuoteItemRemoved
QuoteDiscountApplied
QuoteApprovalRequested
QuoteApproved
QuoteRejected
QuoteChangesRequested
QuoteSent
QuoteViewed
QuoteExpired
QuoteAccepted
QuoteDeclined
QuotePdfGenerated
QuoteConvertedToOrder
QuoteMarginRiskDetected
```

## Order Events

```text
OrderCreated
OrderUpdated
OrderConfirmed
OrderCancelled
OrderShipped
OrderDelivered
OrderReturned
OrderStatusChanged
OrderItemAdded
OrderItemUpdated
OrderItemRemoved
OrderReservationCreated
OrderReservationReleased
OrderPaymentPlanCreated
ShipmentCreated
ShipmentPlanned
ShipmentDispatched
DeliveryCompleted
```

## Product & Inventory Events

```text
ProductCreated
ProductUpdated
ProductDeleted
ProductVariantCreated
ProductVariantUpdated
ProductPriceChanged
ProductActivated
ProductDeactivated
StockChanged
StockReserved
StockReleased
StockMovementIn
StockMovementOut
StockAdjusted
StockTransferred
CriticalStockReached
StockCountStarted
StockCountCompleted
WarehouseCreated
WarehouseUpdated
```

## Finance Events

```text
AccountCreated
AccountUpdated
AccountTransactionCreated
InvoiceCreated
InvoiceUpdated
InvoiceCancelled
PaymentCreated
PaymentReceived
PaymentCancelled
PaymentAllocated
PaymentOverdue
InstallmentCreated
InstallmentPaid
CreditLimitChanged
RiskLimitExceeded
BalanceUpdated
```

## Task & Activity Events

```text
TaskCreated
TaskAssigned
TaskUpdated
TaskCompleted
TaskCancelled
TaskOverdue
TaskReminderTriggered
ActivityCreated
ActivityUpdated
ActivityDeleted
MeetingLogged
CallLogged
EmailActivityLogged
NoteCreated
```

## Communication & Inbox Events

```text
ChannelConnected
ChannelDisconnected
ConversationCreated
ConversationAssigned
ConversationStatusChanged
ConversationResolved
MessageReceived
MessageSent
MessageFailed
MessageRead
InternalNoteAdded
AIReplySuggested
ConversationSummarized
SentimentDetected
```

## Support & Ticket Events

```text
TicketCreated
TicketUpdated
TicketAssigned
TicketPriorityChanged
TicketStatusChanged
TicketSLAWarning
TicketSLABreached
TicketResolved
TicketClosed
TicketReopened
TicketEscalated
TicketMessageAdded
TicketSatisfactionSubmitted
KnowledgeArticleCreated
KnowledgeArticleUpdated
```

## Workflow & Approval Events

```text
WorkflowCreated
WorkflowUpdated
WorkflowActivated
WorkflowPaused
WorkflowStarted
WorkflowStepStarted
WorkflowStepCompleted
WorkflowCompleted
WorkflowFailed
WorkflowErrorRaised
ApprovalRequestCreated
ApprovalStepAssigned
ApprovalApproved
ApprovalRejected
ApprovalChangesRequested
ApprovalDelegated
ApprovalExpired
```

## Integration & Webhook Events

```text
ApiKeyCreated
ApiKeyRevoked
WebhookCreated
WebhookUpdated
WebhookDeleted
WebhookEventQueued
WebhookDeliverySucceeded
WebhookDeliveryFailed
WebhookSignatureFailed
ConnectorConnected
ConnectorDisconnected
IntegrationRunStarted
IntegrationRunCompleted
IntegrationRunFailed
```

## AI Events

```text
AIActionRequested
AIActionReviewed
AIActionApproved
AIActionRejected
AIActionCompleted
AIActionFailed
AIUsageLimitExceeded
AISummaryCreated
AIRecommendationCreated
AIPredictionCreated
AIEmbeddingCreated
AIConversationStarted
AIConversationMessageCreated
AIInsightApplied
AIInsufficientContextDetected
```

## Reporting & Analytics Events

```text
DashboardCreated
DashboardUpdated
ReportCreated
ReportUpdated
ReportExportRequested
ReportExportCompleted
MetricSnapshotCreated
KpiTargetUpdated
AnalyticsQueryExecuted
```

## Data Quality Events

```text
DataQualityRuleCreated
DataQualityIssueDetected
DuplicateRecordDetected
MergeRequestCreated
MergeRequestApproved
RecordsMerged
DataImportStarted
DataImportCompleted
DataImportFailed
DataExportStarted
DataExportCompleted
```

## System Operations Events

```text
HealthCheckFailed
BackupStarted
BackupCompleted
BackupFailed
DeploymentStarted
DeploymentCompleted
RollbackStarted
RollbackCompleted
MigrationStarted
MigrationCompleted
MigrationFailed
```
