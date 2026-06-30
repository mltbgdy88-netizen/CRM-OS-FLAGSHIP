-- CRM OS migration band 003_crm_360
-- Sprint-04 Customer 360 analytics/timeline entities with PostgreSQL RLS

-- ---------------------------------------------------------------------------
-- Customer 360 — tenant-owned tables (additive; 003_crm frozen)
-- ---------------------------------------------------------------------------

CREATE TABLE customer_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  event_type VARCHAR(80) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_customer_timeline_events_tenant_id ON customer_timeline_events(tenant_id);
CREATE INDEX idx_customer_timeline_events_tenant_deleted ON customer_timeline_events(tenant_id, deleted_at);
CREATE INDEX idx_customer_timeline_events_customer_id ON customer_timeline_events(customer_id);
CREATE INDEX idx_customer_timeline_events_occurred_at ON customer_timeline_events(tenant_id, occurred_at);

CREATE TABLE customer_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  metric_code VARCHAR(80) NOT NULL,
  score_value NUMERIC(12, 4) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_customer_scores_tenant_id ON customer_scores(tenant_id);
CREATE INDEX idx_customer_scores_tenant_deleted ON customer_scores(tenant_id, deleted_at);
CREATE INDEX idx_customer_scores_customer_id ON customer_scores(customer_id);

CREATE TABLE customer_risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  risk_level VARCHAR(40) NOT NULL,
  risk_score NUMERIC(12, 4) NOT NULL,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_customer_risk_scores_tenant_id ON customer_risk_scores(tenant_id);
CREATE INDEX idx_customer_risk_scores_tenant_deleted ON customer_risk_scores(tenant_id, deleted_at);
CREATE INDEX idx_customer_risk_scores_customer_id ON customer_risk_scores(customer_id);

CREATE TABLE customer_lifetime_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
  ltv_value NUMERIC(14, 2) NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_customer_lifetime_values_tenant_id ON customer_lifetime_values(tenant_id);
CREATE INDEX idx_customer_lifetime_values_tenant_deleted ON customer_lifetime_values(tenant_id, deleted_at);
CREATE INDEX idx_customer_lifetime_values_customer_id ON customer_lifetime_values(customer_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — fail closed without app.tenant_id
-- ---------------------------------------------------------------------------

ALTER TABLE customer_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_timeline_events FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_customer_timeline_events ON customer_timeline_events
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE customer_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_scores FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_customer_scores ON customer_scores
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE customer_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_risk_scores FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_customer_risk_scores ON customer_risk_scores
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE customer_lifetime_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_lifetime_values FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_customer_lifetime_values ON customer_lifetime_values
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO crmos_app;

INSERT INTO schema_migrations (band) VALUES ('003_crm_360');
