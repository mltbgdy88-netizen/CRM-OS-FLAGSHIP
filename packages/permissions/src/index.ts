/** Sprint-02 IAM + Sprint-03 Customer + Sprint-06 Sales + Sprint-08 Pipeline + Sprint-09/10 Quote + Sprint-11 Task permission registry (global codes). */
export const PERMISSIONS = {
  AUTH_LOGIN: 'auth.login',
  TENANT_MANAGE: 'tenant.manage',
  USER_MANAGE: 'user.manage',
  ROLE_MANAGE: 'role.manage',
  CUSTOMER_READ: 'customer.read',
  CUSTOMER_CREATE: 'customer.create',
  CUSTOMER_UPDATE: 'customer.update',
  CUSTOMER_DELETE: 'customer.delete',
  CUSTOMER_TIMELINE_READ: 'customer.timeline.read',
  CUSTOMER_EXPORT: 'customer.export',
  LEAD_READ: 'lead.read',
  LEAD_CREATE: 'lead.create',
  LEAD_ASSIGN: 'lead.assign',
  LEAD_UPDATE: 'lead.update',
  LEAD_CONVERT: 'lead.convert',
  OPPORTUNITY_READ: 'opportunity.read',
  OPPORTUNITY_CREATE: 'opportunity.create',
  OPPORTUNITY_UPDATE: 'opportunity.update',
  OPPORTUNITY_UPDATE_STAGE: 'opportunity.update.stage',
  PIPELINE_READ: 'pipeline.read',
  PIPELINE_MANAGE: 'pipeline.manage',
  QUOTE_READ: 'quote.read',
  QUOTE_CREATE: 'quote.create',
  QUOTE_UPDATE: 'quote.update',
  QUOTE_SEND: 'quote.send',
  QUOTE_APPROVE: 'quote.approve',
  QUOTE_PDF_GENERATE: 'quote.pdf.generate',
  TASK_READ: 'task.read',
  TASK_CREATE: 'task.create',
  ACTIVITY_CREATE: 'activity.create',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: PermissionCode[] = Object.values(PERMISSIONS);
