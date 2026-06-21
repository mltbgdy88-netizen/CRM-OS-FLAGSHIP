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
