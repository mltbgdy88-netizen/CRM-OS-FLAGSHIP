import { authenticatedFetch, parseApiResponse } from './authenticated-fetch';

export interface DashboardKpis {
  customers: number;
  openOpportunities: number;
  pendingTasks: number;
  quoteTotal: string;
}

export interface DashboardWidget {
  id: string;
  widgetType: string;
  title: string;
  configJson: Record<string, unknown>;
  sortOrder: number;
  liveValue: number | string | null;
}

export interface DashboardResponse {
  id: string;
  name: string;
  code: string;
  isDefault: boolean;
  layoutJson: Record<string, unknown> | null;
  kpis: DashboardKpis;
  widgets: DashboardWidget[];
}

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await authenticatedFetch('/api/v1/dashboard');
  return parseApiResponse<DashboardResponse>(response);
}
