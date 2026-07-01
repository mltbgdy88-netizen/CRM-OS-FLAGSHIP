-- CRM OS migration band 004_lead
-- Sprint-05 Lead core entities with PostgreSQL RLS

-- ---------------------------------------------------------------------------
-- Lead module — tenant-owned tables
-- ---------------------------------------------------------------------------

CREATE TABLE lead_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(120) NOT NULL,
  code VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_lead_sources_tenant_code ON lead_sources(tenant_id, code);
CREATE INDEX idx_lead_sources_tenant_id ON lead_sources(tenant_id);
CREATE INDEX idx_lead_sources_tenant_deleted ON lead_sources(tenant_id, deleted_at);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  full_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  source_id UUID NOT NULL REFERENCES lead_sources(id),
  status VARCHAR(30) NOT NULL DEFAULT 'new',
  score INTEGER NOT NULL DEFAULT 0,
  assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_leads_tenant_id ON leads(tenant_id);
CREATE INDEX idx_leads_tenant_deleted ON leads(tenant_id, deleted_at);
CREATE INDEX idx_leads_source_id ON leads(source_id);
CREATE INDEX idx_leads_assigned_user_id ON leads(assigned_user_id);
CREATE INDEX idx_leads_customer_id ON leads(customer_id);

CREATE TABLE lead_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  name VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_lead_tags_tenant_id ON lead_tags(tenant_id);
CREATE INDEX idx_lead_tags_tenant_deleted ON lead_tags(tenant_id, deleted_at);
CREATE INDEX idx_lead_tags_lead_id ON lead_tags(lead_id);

CREATE TABLE lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  score_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_lead_scores_tenant_id ON lead_scores(tenant_id);
CREATE INDEX idx_lead_scores_tenant_deleted ON lead_scores(tenant_id, deleted_at);
CREATE INDEX idx_lead_scores_lead_id ON lead_scores(lead_id);

CREATE TABLE lead_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_lead_assignments_tenant_id ON lead_assignments(tenant_id);
CREATE INDEX idx_lead_assignments_tenant_deleted ON lead_assignments(tenant_id, deleted_at);
CREATE INDEX idx_lead_assignments_lead_id ON lead_assignments(lead_id);
CREATE INDEX idx_lead_assignments_assigned_user_id ON lead_assignments(assigned_user_id);

CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  activity_type VARCHAR(80) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_lead_activities_tenant_id ON lead_activities(tenant_id);
CREATE INDEX idx_lead_activities_tenant_deleted ON lead_activities(tenant_id, deleted_at);
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — fail closed without app.tenant_id
-- ---------------------------------------------------------------------------

ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sources FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_lead_sources ON lead_sources
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_leads ON leads
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE lead_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_tags FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_lead_tags ON lead_tags
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scores FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_lead_scores ON lead_scores
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_assignments FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_lead_assignments ON lead_assignments
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_lead_activities ON lead_activities
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO crmos_app;

INSERT INTO schema_migrations (band) VALUES ('004_lead');
