import { authenticatedFetch, parseApiResponse } from './authenticated-fetch';
import type { CustomerSummary } from './customers-client';

export interface CustomerScoreView {
  id: string;
  metricCode: string;
  scoreValue: number;
  recordedAt: string;
}

export interface CustomerRiskScoreView {
  id: string;
  riskLevel: string;
  riskScore: number;
  assessedAt: string;
}

export interface CustomerLifetimeValueView {
  id: string;
  currency: string;
  ltvValue: number;
  calculatedAt: string;
}

export interface CustomerNoteView {
  id: string;
  title: string | null;
  body: string;
  createdAt: string;
}

export interface CustomerFileView {
  id: string;
  fileName: string;
  mimeType: string | null;
  byteSize: number | null;
  createdAt: string;
}

export interface CustomerTimelineEventView {
  id: string;
  eventType: string;
  title: string;
  summary: string | null;
  occurredAt: string;
  createdAt: string;
}

export interface Customer360View extends CustomerSummary {
  scores: CustomerScoreView[];
  riskScore: CustomerRiskScoreView | null;
  lifetimeValue: CustomerLifetimeValueView | null;
  notes: CustomerNoteView[];
  files: CustomerFileView[];
  timelinePreview: CustomerTimelineEventView[];
}

export interface CustomerTimelineListResult {
  items: CustomerTimelineEventView[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getCustomer360(id: string): Promise<Customer360View> {
  const response = await authenticatedFetch(`/api/v1/customers/${id}/360`);
  return parseApiResponse<Customer360View>(response);
}

export async function getCustomerTimeline(
  id: string,
  page = 1,
  pageSize = 20,
): Promise<CustomerTimelineListResult> {
  const response = await authenticatedFetch(
    `/api/v1/customers/${id}/timeline?page=${page}&pageSize=${pageSize}`,
  );
  return parseApiResponse<CustomerTimelineListResult>(response);
}
