import type { Dashboard, DashboardWidget } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import type {
  DashboardKpisDto,
  DashboardResponseDto,
  DashboardWidgetDto,
} from './dto/dashboard-response.dto';

export interface TenantKpiCounts {
  customers: number;
  openOpportunities: number;
  pendingTasks: number;
  quoteTotal: Prisma.Decimal;
}

type DashboardRecord = Dashboard & {
  widgets: DashboardWidget[];
};

function resolveWidgetLiveValue(
  widgetType: string,
  kpis: DashboardKpisDto,
): number | string | null {
  switch (widgetType) {
    case 'kpi_revenue':
    case 'chart_revenue':
      return kpis.quoteTotal;
    case 'kpi_pipeline':
      return kpis.openOpportunities;
    case 'kpi_tasks':
      return kpis.pendingTasks;
    case 'kpi_customers':
      return kpis.customers;
    default:
      return null;
  }
}

function mapKpis(counts: TenantKpiCounts): DashboardKpisDto {
  return {
    customers: counts.customers,
    openOpportunities: counts.openOpportunities,
    pendingTasks: counts.pendingTasks,
    quoteTotal: counts.quoteTotal.toFixed(2),
  };
}

function mapWidget(widget: DashboardWidget, kpis: DashboardKpisDto): DashboardWidgetDto {
  const configJson =
    widget.configJson && typeof widget.configJson === 'object' && !Array.isArray(widget.configJson)
      ? (widget.configJson as Record<string, unknown>)
      : {};

  return {
    id: widget.id,
    widgetType: widget.widgetType,
    title: widget.title,
    configJson,
    sortOrder: widget.sortOrder,
    liveValue: resolveWidgetLiveValue(widget.widgetType, kpis),
  };
}

export function mapDashboardView(
  dashboard: DashboardRecord,
  counts: TenantKpiCounts,
): DashboardResponseDto {
  const layoutJson =
    dashboard.layoutJson &&
    typeof dashboard.layoutJson === 'object' &&
    !Array.isArray(dashboard.layoutJson)
      ? (dashboard.layoutJson as Record<string, unknown>)
      : null;

  const kpis = mapKpis(counts);

  return {
    id: dashboard.id,
    name: dashboard.name,
    code: dashboard.code,
    isDefault: dashboard.isDefault,
    layoutJson,
    kpis,
    widgets: dashboard.widgets.map((widget) => mapWidget(widget, kpis)),
  };
}
