import { authenticatedFetch, parseApiResponse } from './authenticated-fetch';

export interface PipelineRef {
  id: string;
  name: string;
  code: string;
}

export interface StageRef {
  id: string;
  name: string;
  code: string;
}

export interface OpportunitySummary {
  id: string;
  pipelineId: string;
  stageId: string;
  leadId: string | null;
  customerId: string | null;
  title: string;
  companyName: string;
  amount: number;
  probability: number;
  status: string;
  assignedUserId: string | null;
  pipeline: PipelineRef;
  stage: StageRef;
  createdAt: string;
  updatedAt: string | null;
  version: number;
}

export interface OpportunityListResult {
  items: OpportunitySummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OpportunityProduct {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
}

export interface OpportunityContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  title: string | null;
  isPrimary: boolean;
}

export interface OpportunityActivity {
  id: string;
  activityType: string;
  title: string;
  body: string | null;
  dueAt: string | null;
  createdAt: string;
}

export interface OpportunityNote {
  id: string;
  title: string | null;
  body: string;
  createdAt: string;
}

export interface OpportunityDetail extends OpportunitySummary {
  products: OpportunityProduct[];
  contacts: OpportunityContact[];
  activities: OpportunityActivity[];
  notes: OpportunityNote[];
}

export async function listOpportunities(
  page = 1,
  pageSize = 20,
): Promise<OpportunityListResult> {
  const response = await authenticatedFetch(
    `/api/v1/opportunities?page=${page}&pageSize=${pageSize}`,
  );
  return parseApiResponse<OpportunityListResult>(response);
}

export async function getOpportunity(id: string): Promise<OpportunityDetail> {
  const response = await authenticatedFetch(`/api/v1/opportunities/${id}`);
  return parseApiResponse<OpportunityDetail>(response);
}

export interface PatchOpportunityStageInput {
  stageId: string;
}

export async function patchOpportunityStage(
  id: string,
  input: PatchOpportunityStageInput,
): Promise<OpportunitySummary> {
  const response = await authenticatedFetch(`/api/v1/opportunities/${id}/stage`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseApiResponse<OpportunitySummary>(response);
}
