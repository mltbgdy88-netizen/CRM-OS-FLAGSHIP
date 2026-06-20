Sprint-39 Report Builder Factory Pack v1


Sprint Objective


Sprint-38:
Metrics → Dashboard Builder → Custom Widgets
Sprint-39:
Data Sources → Report Builder → Filters → Export → Scheduled Reports


Bu sprint sonunda kullanıcılar özel rapor oluşturup dışa aktarabilir.




Factory Metadata


YAML
sprint: 39
name: Report Builder
duration: 2 weeks
depends_on:
  - Sprint-37 Analytics Core
  - Sprint-38 Dashboard Builder
output:
  - report builder
  - report datasets
  - filters
  - columns
  - aggregations
  - export jobs
  - scheduled reports foundation




Business Scope


Included:
Report CRUD
Dataset registry
Column selector
Filter builder
Sorting
Grouping
Aggregations
Report preview
CSV export
XLSX export
PDF export shell
Report permissions
Report history
Excluded:
Advanced BI cube
Custom SQL editor
External BI connector
AI report generation




Domain Model


YAML
reports:
  id: uuid
  tenant_id: uuid
  name: string
  description: text
  dataset_key: string
  owner_user_id: uuid
  visibility: enum
  config_json: jsonb
  created_at: timestamp
  updated_at: timestamp
report_columns:
  id: uuid
  tenant_id: uuid
  report_id: uuid
  field_key: string
  label: string
  sort_order: integer
  aggregation: string
report_filters:
  id: uuid
  tenant_id: uuid
  report_id: uuid
  field_key: string
  operator: string
  value_json: jsonb
report_runs:
  id: uuid
  tenant_id: uuid
  report_id: uuid
  user_id: uuid
  status: enum
  row_count: integer
  duration_ms: integer
  created_at: timestamp
report_exports:
  id: uuid
  tenant_id: uuid
  report_id: uuid
  run_id: uuid
  file_id: uuid
  export_type: enum
  status: enum
  created_at: timestamp




Dataset Registry v1


customers
leads
opportunities
quotes
orders
invoices
payments
products
inventory
tickets
activities
ai_usage




Permissions


YAML
permissions:
  - reporting.report.read
  - reporting.report.create
  - reporting.report.update
  - reporting.report.delete
  - reporting.report.run
  - reporting.report.export
  - reporting.dataset.read




API Contract


http
GET    /api/v1/reports
POST   /api/v1/reports
GET    /api/v1/reports/{id}
PATCH  /api/v1/reports/{id}
DELETE /api/v1/reports/{id}
GET    /api/v1/report-datasets
GET    /api/v1/report-datasets/{key}/fields
POST   /api/v1/reports/{id}/preview
POST   /api/v1/reports/{id}/run
POST   /api/v1/reports/{id}/export
GET    /api/v1/report-runs
GET    /api/v1/report-exports




Business Rules


Report sadece izinli dataset üzerinde çalışır.
Finance dataset finance permission ister.
Cost/margin alanları field-level permission ister.
Export async job olarak çalışır.
Büyük raporlar sayfalanır.
Export dosyaları süreli signed URL ile indirilir.
Her export audit log yazar.
Tenant izolasyonu zorunludur.




PostgreSQL Migration Pack


SQL
reports
report_columns
report_filters
report_runs
report_exports


Indexes:


SQL
idx_reports_owner
idx_reports_dataset
idx_report_runs_report
idx_report_exports_report
idx_report_exports_status


RLS:


tenant_id enforced
report permission policy service layer




NestJS Source Tree


modules/reporting/
├── reports/
├── datasets/
├── fields/
├── filters/
├── query-builder/
├── preview/
├── runs/
├── exports/
├── dto/
├── events/
└── tests/




Frontend Scope


Routes:


/reports
/reports/new
/reports/[id]
/reports/[id]/edit
/reports/exports


Components:


ReportBuilder
DatasetSelector
ReportColumnSelector
ReportFilterBuilder
ReportSortBuilder
ReportPreviewTable
ReportExportDrawer
ReportRunHistory
ReportVisibilitySelector




Cursor Agent Tasks


YAML
backend_agent:
  generate:
    - report CRUD
    - dataset registry
    - field registry
    - safe query builder
    - preview endpoint
    - export worker
    - tests
frontend_agent:
  generate:
    - report builder screen
    - dataset selector
    - column selector
    - filter builder
    - preview table
    - export drawer
qa_agent:
  generate:
    - report CRUD tests
    - filter tests
    - export tests
    - permission tests
    - tenant isolation tests




Test Factory


create report
select dataset
add columns
add filters
preview report
run report
export CSV
export XLSX
finance dataset permission denied
restricted field hidden
cross tenant report blocked
export audit created




Quality Gates


lint
typecheck
unit tests
integration tests
safe query tests
export tests
permission tests
tenant isolation tests
OpenAPI validation




Definition of Done


Report oluşturulabiliyor
Dataset seçilebiliyor
Kolon seçilebiliyor
Filter uygulanabiliyor
Preview çalışıyor
Run history oluşuyor
CSV/XLSX export çalışıyor
Permission kontrolü çalışıyor
Field-level security çalışıyor
Audit log oluşuyor
Tenant izolasyonu geçiyor
Tests passing




Output Package


Dataset
→ Report Builder
→ Filters
→ Preview
→ Export
→ Audit


Sonraki üretim paketi:


Sprint-40 Data Quality Factory Pack v1
