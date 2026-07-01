import type { PoolClient } from 'pg';
import { SEED_IDS, SEED_INVENTORY_PERMISSIONS } from './constants';

export async function seedInventoryData(client: PoolClient): Promise<void> {
  await client.query('BEGIN');

  try {
    for (const permission of SEED_INVENTORY_PERMISSIONS) {
      await client.query(
        `INSERT INTO permissions (id, code, module, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE
         SET module = EXCLUDED.module,
             description = EXCLUDED.description`,
        [permission.id, permission.code, permission.module, permission.description],
      );
    }

    for (const permission of SEED_INVENTORY_PERMISSIONS) {
      await client.query(
        `INSERT INTO role_permissions (tenant_id, role_id, permission_id)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [SEED_IDS.tenantDefault, SEED_IDS.roleAdmin, permission.id],
      );

      await client.query(
        `INSERT INTO role_permissions (tenant_id, role_id, permission_id)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [SEED_IDS.tenantB, SEED_IDS.roleTenantB, permission.id],
      );
    }

    await client.query(
      `INSERT INTO warehouses (id, tenant_id, name, code, status, created_by)
       VALUES ($1, $2, 'Ana Depo', 'main', 'active', $3)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.warehouseDefault, SEED_IDS.tenantDefault, SEED_IDS.userAdmin],
    );

    await client.query(
      `INSERT INTO warehouses (id, tenant_id, name, code, status, created_by)
       VALUES ($1, $2, 'Tenant B Warehouse', 'tb-main', 'active', $3)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.warehouseTenantB, SEED_IDS.tenantB, SEED_IDS.userMemberB],
    );

    await client.query(
      `INSERT INTO warehouse_locations (id, tenant_id, warehouse_id, code, name, created_by)
       VALUES ($1, $2, $3, 'A-01', 'Raf A-01', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.warehouseLocationDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.warehouseDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO warehouse_locations (id, tenant_id, warehouse_id, code, name, created_by)
       VALUES ($1, $2, $3, 'B-01', 'Shelf B-01', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.warehouseLocationTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.warehouseTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO stocks (
         id, tenant_id, warehouse_id, product_variant_id,
         quantity_on_hand, quantity_reserved, quantity_available, critical_level, created_by
       )
       VALUES ($1, $2, $3, $4, 120, 10, 110, 25, $5)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.stockDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.warehouseDefault,
        SEED_IDS.productVariantDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO stocks (
         id, tenant_id, warehouse_id, product_variant_id,
         quantity_on_hand, quantity_reserved, quantity_available, critical_level, created_by
       )
       VALUES ($1, $2, $3, $4, 45, 5, 40, 15, $5)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.stockTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.warehouseTenantB,
        SEED_IDS.productVariantTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO stock_movements (
         id, tenant_id, warehouse_id, product_variant_id, stock_id,
         movement_type, quantity, reference_type, movement_at, notes, created_by
       )
       VALUES ($1, $2, $3, $4, $5, 'in', 120, 'seed', NOW(), 'Initial stock receipt', $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.stockMovementDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.warehouseDefault,
        SEED_IDS.productVariantDefault,
        SEED_IDS.stockDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO stock_movements (
         id, tenant_id, warehouse_id, product_variant_id, stock_id,
         movement_type, quantity, reference_type, movement_at, notes, created_by
       )
       VALUES ($1, $2, $3, $4, $5, 'in', 45, 'seed', NOW(), 'Initial stock receipt', $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.stockMovementTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.warehouseTenantB,
        SEED_IDS.productVariantTenantB,
        SEED_IDS.stockTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO stock_counts (id, tenant_id, warehouse_id, status, counted_at, notes, created_by)
       VALUES ($1, $2, $3, 'completed', NOW(), 'Monthly cycle count', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.stockCountDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.warehouseDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO stock_counts (id, tenant_id, warehouse_id, status, counted_at, notes, created_by)
       VALUES ($1, $2, $3, 'completed', NOW(), 'Monthly cycle count', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.stockCountTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.warehouseTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO stock_adjustments (
         id, tenant_id, stock_id, warehouse_id, product_variant_id, stock_count_id,
         quantity_before, quantity_after, adjustment_quantity, reason, status, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, 118, 120, 2, 'Cycle count variance', 'completed', $7)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.stockAdjustmentDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.stockDefault,
        SEED_IDS.warehouseDefault,
        SEED_IDS.productVariantDefault,
        SEED_IDS.stockCountDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO stock_adjustments (
         id, tenant_id, stock_id, warehouse_id, product_variant_id, stock_count_id,
         quantity_before, quantity_after, adjustment_quantity, reason, status, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, 44, 45, 1, 'Cycle count variance', 'completed', $7)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.stockAdjustmentTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.stockTenantB,
        SEED_IDS.warehouseTenantB,
        SEED_IDS.productVariantTenantB,
        SEED_IDS.stockCountTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
