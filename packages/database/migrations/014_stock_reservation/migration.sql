-- CRM OS migration band 014_stock_reservation
-- Sprint-17 Stock Reservation entities with PostgreSQL RLS

CREATE TABLE order_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_order_reservations_tenant_id ON order_reservations(tenant_id);
CREATE INDEX idx_order_reservations_tenant_deleted ON order_reservations(tenant_id, deleted_at);
CREATE INDEX idx_order_reservations_order_id ON order_reservations(order_id);

CREATE TABLE stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_reservation_id UUID NOT NULL REFERENCES order_reservations(id) ON DELETE CASCADE,
  stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity NUMERIC(18, 3) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_stock_reservations_tenant_id ON stock_reservations(tenant_id);
CREATE INDEX idx_stock_reservations_tenant_deleted ON stock_reservations(tenant_id, deleted_at);
CREATE INDEX idx_stock_reservations_order_id ON stock_reservations(order_id);
CREATE INDEX idx_stock_reservations_order_reservation_id ON stock_reservations(order_reservation_id);
CREATE INDEX idx_stock_reservations_stock_id ON stock_reservations(stock_id);
CREATE INDEX idx_stock_reservations_warehouse_id ON stock_reservations(warehouse_id);
CREATE INDEX idx_stock_reservations_product_variant_id ON stock_reservations(product_variant_id);

ALTER TABLE order_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_reservations FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_order_reservations ON order_reservations
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_reservations FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_stock_reservations ON stock_reservations
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO crmos_app;

INSERT INTO schema_migrations (band) VALUES ('014_stock_reservation');
