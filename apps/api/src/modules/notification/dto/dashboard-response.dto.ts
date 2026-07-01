export interface DashboardKpisDto {
  customers: number;
  openOpportunities: number;
  pendingTasks: number;
  quoteTotal: string;
}

export interface DashboardWidgetDto {
  id: string;
  widgetType: string;
  title: string;
  configJson: Record<string, unknown>;
  sortOrder: number;
  liveValue: number | string | null;
}

export interface DashboardResponseDto {
  id: string;
  name: string;
  code: string;
  isDefault: boolean;
  layoutJson: Record<string, unknown> | null;
  kpis: DashboardKpisDto;
  widgets: DashboardWidgetDto[];
}
