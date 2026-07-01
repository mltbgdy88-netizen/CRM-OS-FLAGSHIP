import { authenticatedFetch, parseApiResponse } from './authenticated-fetch';

export interface LeadSourceSummary {
  id: string;
  name: string;
  code: string;
}

export interface LeadSummary {
  id: string;
  fullName: string;
  companyName: string;
  email: string | null;
  phone: string | null;
  status: string;
  score: number;
  assignedUserId: string | null;
  customerId: string | null;
  source: LeadSourceSummary;
  tags: string[];
  createdAt: string;
  updatedAt: string | null;
  version: number;
}

export interface LeadListResult {
  items: LeadSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listLeads(page = 1, pageSize = 20): Promise<LeadListResult> {
  const response = await authenticatedFetch(`/api/v1/leads?page=${page}&pageSize=${pageSize}`);
  return parseApiResponse<LeadListResult>(response);
}
