export interface DomainEventEnvelope {
  tenantId: string;
  actorId: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: Date;
}

export const IAM_EVENT_TYPES = {
  USER_INVITED: 'UserInvited',
  USER_LOGGED_IN: 'UserLoggedIn',
  ROLE_CHANGED: 'RoleChanged',
} as const;

export type IamEventType = (typeof IAM_EVENT_TYPES)[keyof typeof IAM_EVENT_TYPES];

export function createUserLoggedInEvent(input: {
  tenantId: string;
  actorId: string;
  userId: string;
  email: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'user',
    aggregateId: input.userId,
    eventType: IAM_EVENT_TYPES.USER_LOGGED_IN,
    payload: { email: input.email },
    createdAt: new Date(),
  };
}

export function createUserInvitedEvent(input: {
  tenantId: string;
  actorId: string;
  userId: string;
  email: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'user',
    aggregateId: input.userId,
    eventType: IAM_EVENT_TYPES.USER_INVITED,
    payload: { email: input.email },
    createdAt: new Date(),
  };
}

export function createRoleChangedEvent(input: {
  tenantId: string;
  actorId: string;
  roleId: string;
  change: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'role',
    aggregateId: input.roleId,
    eventType: IAM_EVENT_TYPES.ROLE_CHANGED,
    payload: { change: input.change },
    createdAt: new Date(),
  };
}

export const CRM_EVENT_TYPES = {
  CUSTOMER_CREATED: 'CustomerCreated',
  CUSTOMER_UPDATED: 'CustomerUpdated',
} as const;

export type CrmEventType = (typeof CRM_EVENT_TYPES)[keyof typeof CRM_EVENT_TYPES];

export function createCustomerCreatedEvent(input: {
  tenantId: string;
  actorId: string;
  customerId: string;
  displayName: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'customer',
    aggregateId: input.customerId,
    eventType: CRM_EVENT_TYPES.CUSTOMER_CREATED,
    payload: { displayName: input.displayName },
    createdAt: new Date(),
  };
}

export function createCustomerUpdatedEvent(input: {
  tenantId: string;
  actorId: string;
  customerId: string;
  changes: Record<string, unknown>;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'customer',
    aggregateId: input.customerId,
    eventType: CRM_EVENT_TYPES.CUSTOMER_UPDATED,
    payload: { changes: input.changes },
    createdAt: new Date(),
  };
}

export const LEAD_EVENT_TYPES = {
  LEAD_CREATED: 'LeadCreated',
  LEAD_ASSIGNED: 'LeadAssigned',
  LEAD_QUALIFIED: 'LeadQualified',
  LEAD_LOST: 'LeadLost',
  LEAD_CONVERTED: 'LeadConverted',
} as const;

export type LeadEventType = (typeof LEAD_EVENT_TYPES)[keyof typeof LEAD_EVENT_TYPES];

export function createLeadCreatedEvent(input: {
  tenantId: string;
  actorId: string;
  leadId: string;
  fullName: string;
  companyName: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'lead',
    aggregateId: input.leadId,
    eventType: LEAD_EVENT_TYPES.LEAD_CREATED,
    payload: {
      fullName: input.fullName,
      companyName: input.companyName,
    },
    createdAt: new Date(),
  };
}

export function createLeadAssignedEvent(input: {
  tenantId: string;
  actorId: string;
  leadId: string;
  assignedUserId: string | null;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'lead',
    aggregateId: input.leadId,
    eventType: LEAD_EVENT_TYPES.LEAD_ASSIGNED,
    payload: {
      assignedUserId: input.assignedUserId,
    },
    createdAt: new Date(),
  };
}

export function createLeadQualifiedEvent(input: {
  tenantId: string;
  actorId: string;
  leadId: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'lead',
    aggregateId: input.leadId,
    eventType: LEAD_EVENT_TYPES.LEAD_QUALIFIED,
    payload: {},
    createdAt: new Date(),
  };
}

export function createLeadLostEvent(input: {
  tenantId: string;
  actorId: string;
  leadId: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'lead',
    aggregateId: input.leadId,
    eventType: LEAD_EVENT_TYPES.LEAD_LOST,
    payload: {},
    createdAt: new Date(),
  };
}

export function createLeadConvertedEvent(input: {
  tenantId: string;
  actorId: string;
  leadId: string;
  opportunityId: string;
  customerId: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'lead',
    aggregateId: input.leadId,
    eventType: LEAD_EVENT_TYPES.LEAD_CONVERTED,
    payload: {
      opportunityId: input.opportunityId,
      customerId: input.customerId,
    },
    createdAt: new Date(),
  };
}

export const SALES_EVENT_TYPES = {
  OPPORTUNITY_CREATED: 'OpportunityCreated',
  OPPORTUNITY_STAGE_CHANGED: 'OpportunityStageChanged',
  OPPORTUNITY_WON: 'OpportunityWon',
  OPPORTUNITY_LOST: 'OpportunityLost',
} as const;

export type SalesEventType = (typeof SALES_EVENT_TYPES)[keyof typeof SALES_EVENT_TYPES];

export function createOpportunityCreatedEvent(input: {
  tenantId: string;
  actorId: string;
  opportunityId: string;
  pipelineId: string;
  stageId: string;
  title: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'opportunity',
    aggregateId: input.opportunityId,
    eventType: SALES_EVENT_TYPES.OPPORTUNITY_CREATED,
    payload: {
      pipelineId: input.pipelineId,
      stageId: input.stageId,
      title: input.title,
    },
    createdAt: new Date(),
  };
}

export function createOpportunityStageChangedEvent(input: {
  tenantId: string;
  actorId: string;
  opportunityId: string;
  fromStageId: string;
  toStageId: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'opportunity',
    aggregateId: input.opportunityId,
    eventType: SALES_EVENT_TYPES.OPPORTUNITY_STAGE_CHANGED,
    payload: {
      fromStageId: input.fromStageId,
      toStageId: input.toStageId,
    },
    createdAt: new Date(),
  };
}

export function createOpportunityWonEvent(input: {
  tenantId: string;
  actorId: string;
  opportunityId: string;
  pipelineId: string;
  stageId: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'opportunity',
    aggregateId: input.opportunityId,
    eventType: SALES_EVENT_TYPES.OPPORTUNITY_WON,
    payload: {
      pipelineId: input.pipelineId,
      stageId: input.stageId,
    },
    createdAt: new Date(),
  };
}

export function createOpportunityLostEvent(input: {
  tenantId: string;
  actorId: string;
  opportunityId: string;
  pipelineId: string;
  stageId: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'opportunity',
    aggregateId: input.opportunityId,
    eventType: SALES_EVENT_TYPES.OPPORTUNITY_LOST,
    payload: {
      pipelineId: input.pipelineId,
      stageId: input.stageId,
    },
    createdAt: new Date(),
  };
}

export const QUOTE_EVENT_TYPES = {
  QUOTE_CREATED: 'QuoteCreated',
  QUOTE_SENT: 'QuoteSent',
  QUOTE_VIEWED: 'QuoteViewed',
  QUOTE_APPROVED: 'QuoteApproved',
  QUOTE_REJECTED: 'QuoteRejected',
  QUOTE_EXPIRED: 'QuoteExpired',
} as const;

export type QuoteEventType = (typeof QUOTE_EVENT_TYPES)[keyof typeof QUOTE_EVENT_TYPES];

export function createQuoteCreatedEvent(input: {
  tenantId: string;
  actorId: string;
  quoteId: string;
  number: string;
  customerId: string;
  total: number;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'quote',
    aggregateId: input.quoteId,
    eventType: QUOTE_EVENT_TYPES.QUOTE_CREATED,
    payload: {
      number: input.number,
      customerId: input.customerId,
      total: input.total,
    },
    createdAt: new Date(),
  };
}

export function createQuoteSentEvent(input: {
  tenantId: string;
  actorId: string;
  quoteId: string;
  number: string;
  recipientEmail: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'quote',
    aggregateId: input.quoteId,
    eventType: QUOTE_EVENT_TYPES.QUOTE_SENT,
    payload: {
      number: input.number,
      recipientEmail: input.recipientEmail,
    },
    createdAt: new Date(),
  };
}

export function createQuoteViewedEvent(input: {
  tenantId: string;
  actorId: string;
  quoteId: string;
  viewerType: 'authenticated' | 'public';
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'quote',
    aggregateId: input.quoteId,
    eventType: QUOTE_EVENT_TYPES.QUOTE_VIEWED,
    payload: {
      viewerType: input.viewerType,
    },
    createdAt: new Date(),
  };
}

export function createQuoteApprovedEvent(input: {
  tenantId: string;
  actorId: string;
  quoteId: string;
  approvedBy: string;
  totalAmount: number;
  currency: string;
  approvalRequestId: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'quote',
    aggregateId: input.quoteId,
    eventType: QUOTE_EVENT_TYPES.QUOTE_APPROVED,
    payload: {
      approvedBy: input.approvedBy,
      totalAmount: input.totalAmount,
      currency: input.currency,
      approvalRequestId: input.approvalRequestId,
    },
    createdAt: new Date(),
  };
}

export function createQuoteRejectedEvent(input: {
  tenantId: string;
  actorId: string;
  quoteId: string;
  rejectedBy: string;
  reason?: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'quote',
    aggregateId: input.quoteId,
    eventType: QUOTE_EVENT_TYPES.QUOTE_REJECTED,
    payload: {
      rejectedBy: input.rejectedBy,
      ...(input.reason !== undefined ? { reason: input.reason } : {}),
    },
    createdAt: new Date(),
  };
}

export function createQuoteExpiredEvent(input: {
  tenantId: string;
  actorId: string;
  quoteId: string;
  number: string;
  expiresAt: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'quote',
    aggregateId: input.quoteId,
    eventType: QUOTE_EVENT_TYPES.QUOTE_EXPIRED,
    payload: {
      number: input.number,
      expiresAt: input.expiresAt,
    },
    createdAt: new Date(),
  };
}

export const TASK_EVENT_TYPES = {
  TASK_CREATED: 'TaskCreated',
  TASK_COMPLETED: 'TaskCompleted',
  ACTIVITY_LOGGED: 'ActivityLogged',
} as const;

export type TaskEventType = (typeof TASK_EVENT_TYPES)[keyof typeof TASK_EVENT_TYPES];

export function createTaskCreatedEvent(input: {
  tenantId: string;
  actorId: string;
  taskId: string;
  title: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'task',
    aggregateId: input.taskId,
    eventType: TASK_EVENT_TYPES.TASK_CREATED,
    payload: { title: input.title },
    createdAt: new Date(),
  };
}

export function createTaskCompletedEvent(input: {
  tenantId: string;
  actorId: string;
  taskId: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'task',
    aggregateId: input.taskId,
    eventType: TASK_EVENT_TYPES.TASK_COMPLETED,
    payload: {},
    createdAt: new Date(),
  };
}

export function createActivityLoggedEvent(input: {
  tenantId: string;
  actorId: string;
  activityId: string;
  activityType: string;
  subjectType: string;
  subjectId: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'activity',
    aggregateId: input.activityId,
    eventType: TASK_EVENT_TYPES.ACTIVITY_LOGGED,
    payload: {
      activityType: input.activityType,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
    },
    createdAt: new Date(),
  };
}

export const NOTIFICATION_EVENT_TYPES = {
  NOTIFICATION_CREATED: 'NotificationCreated',
  DASHBOARD_VIEWED: 'DashboardViewed',
} as const;

export type NotificationEventType =
  (typeof NOTIFICATION_EVENT_TYPES)[keyof typeof NOTIFICATION_EVENT_TYPES];

export function createNotificationCreatedEvent(input: {
  tenantId: string;
  actorId: string;
  notificationId: string;
  title: string;
  notificationType: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'notification',
    aggregateId: input.notificationId,
    eventType: NOTIFICATION_EVENT_TYPES.NOTIFICATION_CREATED,
    payload: {
      title: input.title,
      notificationType: input.notificationType,
    },
    createdAt: new Date(),
  };
}

export function createDashboardViewedEvent(input: {
  tenantId: string;
  actorId: string;
  dashboardId: string;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'dashboard',
    aggregateId: input.dashboardId,
    eventType: NOTIFICATION_EVENT_TYPES.DASHBOARD_VIEWED,
    payload: {},
    createdAt: new Date(),
  };
}

export const ORDER_EVENT_TYPES = {
  ORDER_CREATED: 'OrderCreated',
  ORDER_CONFIRMED: 'OrderConfirmed',
} as const;

export type OrderEventType = (typeof ORDER_EVENT_TYPES)[keyof typeof ORDER_EVENT_TYPES];

export function createOrderCreatedEvent(input: {
  tenantId: string;
  actorId: string;
  orderId: string;
  number: string;
  customerId: string;
  total: number;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'order',
    aggregateId: input.orderId,
    eventType: ORDER_EVENT_TYPES.ORDER_CREATED,
    payload: {
      number: input.number,
      customerId: input.customerId,
      total: input.total,
    },
    createdAt: new Date(),
  };
}

export function createOrderConfirmedEvent(input: {
  tenantId: string;
  actorId: string;
  orderId: string;
  number: string;
  total: number;
}): DomainEventEnvelope {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    aggregateType: 'order',
    aggregateId: input.orderId,
    eventType: ORDER_EVENT_TYPES.ORDER_CONFIRMED,
    payload: {
      number: input.number,
      total: input.total,
    },
    createdAt: new Date(),
  };
}
