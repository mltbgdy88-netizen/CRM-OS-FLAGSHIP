-- CRM OS migration band 015_finance_lite
-- Sprint-18 Finance Lite Core entities with PostgreSQL RLS

-- ---------------------------------------------------------------------------
-- Finance Lite — tenant-owned tables
-- ---------------------------------------------------------------------------

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  balance NUMERIC(18, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_accounts_tenant_code ON accounts(tenant_id, code);
CREATE INDEX idx_accounts_tenant_id ON accounts(tenant_id);
CREATE INDEX idx_accounts_tenant_deleted ON accounts(tenant_id, deleted_at);
CREATE INDEX idx_accounts_customer_id ON accounts(customer_id);

CREATE TABLE account_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  transaction_type VARCHAR(30) NOT NULL,
  amount NUMERIC(18, 2) NOT NULL,
  balance_after NUMERIC(18, 2) NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  description TEXT,
  transaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_account_transactions_tenant_id ON account_transactions(tenant_id);
CREATE INDEX idx_account_transactions_tenant_deleted ON account_transactions(tenant_id, deleted_at);
CREATE INDEX idx_account_transactions_account_id ON account_transactions(account_id);
CREATE INDEX idx_account_transactions_transaction_at ON account_transactions(transaction_at);

CREATE TABLE credit_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  limit_amount NUMERIC(18, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_credit_limits_account_id ON credit_limits(account_id);
CREATE INDEX idx_credit_limits_tenant_id ON credit_limits(tenant_id);
CREATE INDEX idx_credit_limits_tenant_deleted ON credit_limits(tenant_id, deleted_at);

CREATE TABLE risk_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  risk_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
  limit_amount NUMERIC(18, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_risk_limits_account_id ON risk_limits(account_id);
CREATE INDEX idx_risk_limits_tenant_id ON risk_limits(tenant_id);
CREATE INDEX idx_risk_limits_tenant_deleted ON risk_limits(tenant_id, deleted_at);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  subtotal NUMERIC(18, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
  due_date DATE,
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_invoices_tenant_number ON invoices(tenant_id, invoice_number);
CREATE INDEX idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX idx_invoices_tenant_deleted ON invoices(tenant_id, deleted_at);
CREATE INDEX idx_invoices_account_id ON invoices(account_id);

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(500) NOT NULL,
  quantity NUMERIC(18, 3) NOT NULL DEFAULT 1,
  unit_price NUMERIC(18, 2) NOT NULL,
  line_total NUMERIC(18, 2) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_invoice_items_tenant_id ON invoice_items(tenant_id);
CREATE INDEX idx_invoice_items_tenant_deleted ON invoice_items(tenant_id, deleted_at);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — fail closed without app.tenant_id
-- ---------------------------------------------------------------------------

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_accounts ON accounts
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE account_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_transactions FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_account_transactions ON account_transactions
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE credit_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_limits FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_credit_limits ON credit_limits
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE risk_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_limits FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_risk_limits ON risk_limits
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_invoices ON invoices
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_invoice_items ON invoice_items
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO crmos_app;

INSERT INTO schema_migrations (band) VALUES ('015_finance_lite');
