import type { PoolClient } from 'pg';
import { SEED_IDS } from './constants';

export async function seedStockReservationData(client: PoolClient): Promise<void> {
  await client.query('BEGIN');

  try {
    await client.query(
      `INSERT INTO order_reservations (
         id, tenant_id, order_id, status, reserved_at, notes, created_by
       )
       VALUES ($1, $2, $3, 'active', NOW(), 'Seed reservation for default order', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.orderReservationDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.orderDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO order_reservations (
         id, tenant_id, order_id, status, reserved_at, notes, created_by
       )
       VALUES ($1, $2, $3, 'active', NOW(), 'Seed reservation for tenant B order', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.orderReservationTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.orderTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `UPDATE stocks
       SET quantity_reserved = 5,
           quantity_available = quantity_on_hand - 5,
           updated_by = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [SEED_IDS.stockDefault, SEED_IDS.userAdmin],
    );

    await client.query(
      `INSERT INTO stock_reservations (
         id, tenant_id, order_id, order_reservation_id, stock_id,
         warehouse_id, product_variant_id, quantity, status, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, 5, 'active', $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.stockReservationDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.orderDefault,
        SEED_IDS.orderReservationDefault,
        SEED_IDS.stockDefault,
        SEED_IDS.warehouseDefault,
        SEED_IDS.productVariantDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `UPDATE stocks
       SET quantity_reserved = 2,
           quantity_available = quantity_on_hand - 2,
           updated_by = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [SEED_IDS.stockTenantB, SEED_IDS.userMemberB],
    );

    await client.query(
      `INSERT INTO stock_reservations (
         id, tenant_id, order_id, order_reservation_id, stock_id,
         warehouse_id, product_variant_id, quantity, status, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, 2, 'active', $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.stockReservationTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.orderTenantB,
        SEED_IDS.orderReservationTenantB,
        SEED_IDS.stockTenantB,
        SEED_IDS.warehouseTenantB,
        SEED_IDS.productVariantTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
