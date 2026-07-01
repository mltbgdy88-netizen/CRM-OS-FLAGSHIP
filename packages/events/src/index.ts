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
