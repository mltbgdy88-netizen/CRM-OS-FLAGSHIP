-- CRM OS migration band 007_quote_pdf_approval
-- Sprint-10 Quote PDF + Approval entities with PostgreSQL RLS

-- ---------------------------------------------------------------------------
-- Quote PDF + Approval — tenant-owned tables
-- ---------------------------------------------------------------------------

CREATE TABLE quote_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  approver_user_id UUID,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  notes TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_quote_approvals_tenant_id ON quote_approvals(tenant_id);
CREATE INDEX idx_quote_approvals_tenant_deleted ON quote_approvals(tenant_id, deleted_at);
CREATE INDEX idx_quote_approvals_quote_id ON quote_approvals(quote_id);

CREATE TABLE quote_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
  storage_key VARCHAR(500) NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  checksum VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_quote_files_tenant_id ON quote_files(tenant_id);
CREATE INDEX idx_quote_files_tenant_deleted ON quote_files(tenant_id, deleted_at);
CREATE INDEX idx_quote_files_quote_id ON quote_files(quote_id);

CREATE TABLE quote_view_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  viewer_user_id UUID,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source VARCHAR(40) NOT NULL DEFAULT 'pdf',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_quote_view_logs_tenant_id ON quote_view_logs(tenant_id);
CREATE INDEX idx_quote_view_logs_tenant_deleted ON quote_view_logs(tenant_id, deleted_at);
CREATE INDEX idx_quote_view_logs_quote_id ON quote_view_logs(quote_id);

CREATE TABLE quote_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  signer_name VARCHAR(255) NOT NULL,
  signer_email VARCHAR(255),
  signed_at TIMESTAMPTZ NOT NULL,
  signature_data TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_quote_signatures_tenant_id ON quote_signatures(tenant_id);
CREATE INDEX idx_quote_signatures_tenant_deleted ON quote_signatures(tenant_id, deleted_at);
CREATE INDEX idx_quote_signatures_quote_id ON quote_signatures(quote_id);

CREATE TABLE quote_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  from_status VARCHAR(40) NOT NULL,
  to_status VARCHAR(40) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_quote_status_history_tenant_id ON quote_status_history(tenant_id);
CREATE INDEX idx_quote_status_history_tenant_deleted ON quote_status_history(tenant_id, deleted_at);
CREATE INDEX idx_quote_status_history_quote_id ON quote_status_history(quote_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — fail closed without app.tenant_id
-- ---------------------------------------------------------------------------

ALTER TABLE quote_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_approvals FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_quote_approvals ON quote_approvals
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE quote_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_files FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_quote_files ON quote_files
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE quote_view_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_view_logs FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_quote_view_logs ON quote_view_logs
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE quote_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_signatures FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_quote_signatures ON quote_signatures
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE quote_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_status_history FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_quote_status_history ON quote_status_history
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO crmos_app;

INSERT INTO schema_migrations (band) VALUES ('007_quote_pdf_approval');
