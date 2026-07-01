-- CRM OS migration band 005_sales
-- Sprint-06 Sales pipeline core entities with PostgreSQL RLS

-- ---------------------------------------------------------------------------
-- Sales module — tenant-owned tables
-- ---------------------------------------------------------------------------

CREATE TABLE pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(120) NOT NULL,
  code VARCHAR(80) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_pipelines_tenant_code ON pipelines(tenant_id, code);
CREATE INDEX idx_pipelines_tenant_id ON pipelines(tenant_id);
CREATE INDEX idx_pipelines_tenant_deleted ON pipelines(tenant_id, deleted_at);

CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(80) NOT NULL,
  sort_order INTEGER NOT NULL,
  color VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_pipeline_stages_tenant_pipeline_code ON pipeline_stages(tenant_id, pipeline_id, code);
CREATE INDEX idx_pipeline_stages_tenant_id ON pipeline_stages(tenant_id);
CREATE INDEX idx_pipeline_stages_tenant_deleted ON pipeline_stages(tenant_id, deleted_at);
CREATE INDEX idx_pipeline_stages_pipeline_id ON pipeline_stages(pipeline_id);

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  pipeline_id UUID NOT NULL REFERENCES pipelines(id),
  stage_id UUID NOT NULL REFERENCES pipeline_stages(id),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  probability INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_opportunities_tenant_id ON opportunities(tenant_id);
CREATE INDEX idx_opportunities_tenant_deleted ON opportunities(tenant_id, deleted_at);
CREATE INDEX idx_opportunities_pipeline_id ON opportunities(pipeline_id);
CREATE INDEX idx_opportunities_stage_id ON opportunities(stage_id);
CREATE INDEX idx_opportunities_lead_id ON opportunities(lead_id);
CREATE INDEX idx_opportunities_customer_id ON opportunities(customer_id);
CREATE INDEX idx_opportunities_assigned_user_id ON opportunities(assigned_user_id);

CREATE TABLE lead_conversion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  lead_id UUID NOT NULL REFERENCES leads(id),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_lead_conversion_logs_tenant_id ON lead_conversion_logs(tenant_id);
CREATE INDEX idx_lead_conversion_logs_tenant_deleted ON lead_conversion_logs(tenant_id, deleted_at);
CREATE INDEX idx_lead_conversion_logs_lead_id ON lead_conversion_logs(lead_id);
CREATE INDEX idx_lead_conversion_logs_opportunity_id ON lead_conversion_logs(opportunity_id);
CREATE INDEX idx_lead_conversion_logs_customer_id ON lead_conversion_logs(customer_id);

CREATE TABLE opportunity_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  from_stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  to_stage_id UUID NOT NULL REFERENCES pipeline_stages(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_opportunity_stage_history_tenant_id ON opportunity_stage_history(tenant_id);
CREATE INDEX idx_opportunity_stage_history_tenant_deleted ON opportunity_stage_history(tenant_id, deleted_at);
CREATE INDEX idx_opportunity_stage_history_opportunity_id ON opportunity_stage_history(opportunity_id);
CREATE INDEX idx_opportunity_stage_history_from_stage_id ON opportunity_stage_history(from_stage_id);
CREATE INDEX idx_opportunity_stage_history_to_stage_id ON opportunity_stage_history(to_stage_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — fail closed without app.tenant_id
-- ---------------------------------------------------------------------------

ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_pipelines ON pipelines
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_pipeline_stages ON pipeline_stages
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_opportunities ON opportunities
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE lead_conversion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_conversion_logs FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_lead_conversion_logs ON lead_conversion_logs
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE opportunity_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_stage_history FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_opportunity_stage_history ON opportunity_stage_history
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO crmos_app;

INSERT INTO schema_migrations (band) VALUES ('005_sales');
