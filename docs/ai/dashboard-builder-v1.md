Sprint-38 Dashboard Builder Factory Pack v1


Sprint Objective


Sprint-37:
Business Data → Metrics → Snapshots → Analytics APIs
Sprint-38:
Metrics → Dashboard Builder → Custom Widgets → Shared Dashboards


Bu sprint sonunda kullanıcılar kendi dashboardlarını oluşturabilir.




Factory Metadata


YAML
sprint: 38
name: Dashboard Builder
duration: 2 weeks
depends_on:
  - Sprint-12 Dashboard
  - Sprint-37 Analytics Core
output:
  - custom dashboard builder
  - widget library
  - dashboard permissions
  - dashboard filters
  - drag/drop layout




Business Scope


Included:
Custom dashboards
Widget library
Metric widgets
Chart widgets
Table widgets
Dashboard filters
Widget configuration
Drag/drop layout
Dashboard sharing
Dashboard permissions
Dashboard cloning
Excluded:
Report builder
Scheduled exports
External BI embedding
Natural language dashboard generation




Domain Model


YAML
dashboards:
  id: uuid
  tenant_id: uuid
  name: string
  description: text
  owner_user_id: uuid
  visibility: enum
  layout_json: jsonb
  is_default: boolean
  created_at: timestamp
  updated_at: timestamp
dashboard_widgets:
  id: uuid
  tenant_id: uuid
  dashboard_id: uuid
  widget_type: enum
  title: string
  metric_key: string
  config_json: jsonb
  position_json: jsonb
  created_at: timestamp
  updated_at: timestamp
dashboard_permissions:
  id: uuid
  tenant_id: uuid
  dashboard_id: uuid
  user_id: uuid
  role_id: uuid
  permission_level: enum
  created_at: timestamp
dashboard_filters:
  id: uuid
  tenant_id: uuid
  dashboard_id: uuid
  filter_key: string
  filter_type: string
  default_value_json: jsonb




Enum Values


dashboard_visibility:
private
team
tenant
widget_type:
metric
line_chart
bar_chart
pie_chart
table
funnel
target_progress
ai_insight
permission_level:
view
edit
owner




Events


YAML
events:
  - DashboardCreated
  - DashboardUpdated
  - DashboardDeleted
  - DashboardCloned
  - DashboardShared
  - WidgetAdded
  - WidgetUpdated
  - WidgetRemoved
  - DashboardViewed




Permissions


YAML
permissions:
  - dashboard.read
  - dashboard.create
  - dashboard.update
  - dashboard.delete
  - dashboard.share
  - dashboard.widget.manage
  - analytics.metric.read




API Contract


http
GET    /api/v1/dashboards
POST   /api/v1/dashboards
GET    /api/v1/dashboards/{id}
PATCH  /api/v1/dashboards/{id}
DELETE /api/v1/dashboards/{id}
POST   /api/v1/dashboards/{id}/clone
POST   /api/v1/dashboards/{id}/share
GET    /api/v1/dashboards/{id}/widgets
POST   /api/v1/dashboards/{id}/widgets
PATCH  /api/v1/dashboard-widgets/{id}
DELETE /api/v1/dashboard-widgets/{id}
GET    /api/v1/widget-library
POST   /api/v1/dashboards/{id}/refresh




Widget Config Example


JSON
{
  "metricKey": 
"sales.revenue_total"
,
  "visualization": 
"line_chart"
,
  "dateRange": 
"this_month"
,
  "dimensions": [
"sales_rep"
],
  "filters": {
    "branchId": 
"uuid"
  }
}




Business Rules


Dashboard sahibi owner permission alır.
Private dashboard sadece sahibi tarafından görülür.
Team dashboard ilgili team kullanıcılarına görünür.
Tenant dashboard yetkili tüm kullanıcılara görünür.
Widget metric_key analytics registry’de aktif olmalıdır.
Widget metric permission kontrolünden geçmelidir.
Finance widget finance permission olmadan gösterilmez.
Dashboard clone yeni owner ile kopya oluşturur.




PostgreSQL Migration Pack


SQL
dashboards
dashboard_widgets
dashboard_permissions
dashboard_filters


Indexes:


SQL
idx_dashboards_owner
idx_dashboards_visibility
idx_dashboard_widgets_dashboard
idx_dashboard_permissions_dashboard
idx_dashboard_permissions_user


RLS:


tenant_id enforced
dashboard permission policy enforced in service layer




NestJS Source Tree


modules/dashboard-builder/
├── dashboards/
├── widgets/
├── widget-library/
├── permissions/
├── filters/
├── refresh/
├── dto/
├── events/
└── tests/




Frontend Scope


Routes:


/dashboards
/dashboards/new
/dashboards/[id]
/dashboards/[id]/edit


Components:


DashboardBuilder
DashboardCanvas
WidgetLibraryPanel
WidgetConfigDrawer
MetricWidget
ChartWidget
TableWidget
DashboardFilterBar
DashboardShareModal
DashboardPermissionPanel




Cursor Agent Tasks


YAML
backend_agent:
  generate:
    - dashboard builder module
    - dashboard CRUD
    - widget CRUD
    - permission service
    - widget library API
    - refresh endpoint
    - tests
frontend_agent:
  generate:
    - dashboard builder UI
    - drag/drop canvas
    - widget library panel
    - widget config drawer
    - share modal
    - filter bar
qa_agent:
  generate:
    - dashboard CRUD tests
    - widget tests
    - permission tests
    - metric permission tests
    - tenant isolation tests




Test Factory


create dashboard
update dashboard
delete dashboard
clone dashboard
share dashboard
add widget
update widget config
remove widget
private dashboard access blocked
finance widget hidden without permission
cross tenant dashboard blocked




Quality Gates


lint
typecheck
unit tests
integration tests
dashboard permission tests
metric permission tests
tenant isolation tests
OpenAPI validation




Definition of Done


Custom dashboard oluşturulabiliyor
Widget eklenebiliyor
Widget düzenlenebiliyor
Dashboard layout kaydediliyor
Dashboard clone çalışıyor
Dashboard share çalışıyor
Dashboard permission çalışıyor
Metric permission kontrolü çalışıyor
Analytics API’den veri çekiliyor
Tenant izolasyonu geçiyor
Tests passing




Output Package


Analytics Metrics
→ Widget Library
→ Dashboard Builder
→ Custom Dashboard
→ Shared Visibility


Sonraki üretim paketi:


Sprint-39 Report Builder Factory Pack v1
