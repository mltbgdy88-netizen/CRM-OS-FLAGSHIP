import type { Lead, LeadSource, LeadTag } from '@prisma/client';

type LeadRecord = Lead & {
  source: LeadSource;
  tags: LeadTag[];
};

export function mapLeadSummary(lead: LeadRecord) {
  return {
    id: lead.id,
    fullName: lead.fullName,
    companyName: lead.companyName,
    email: lead.email,
    phone: lead.phone,
    status: lead.status,
    score: lead.score,
    assignedUserId: lead.assignedUserId,
    customerId: lead.customerId,
    source: {
      id: lead.source.id,
      name: lead.source.name,
      code: lead.source.code,
    },
    tags: lead.tags.map((tag) => tag.name),
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt?.toISOString() ?? null,
    version: lead.version,
  };
}
