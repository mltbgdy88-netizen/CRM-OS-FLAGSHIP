import type { PoolClient } from 'pg';
import { SEED_IDS } from './constants';

const PROOF_DB_MARKERS = ['127.0.0.1:5433', 'localhost:5433'] as const;

export function shouldCleanupProofSeedOrphans(databaseUrl: string): boolean {
  if (process.env.CRM_OS_PROOF_SEED_CLEANUP === 'false') {
    return false;
  }
  if (process.env.CRM_OS_PROOF_SEED_CLEANUP === 'true') {
    return true;
  }
  return PROOF_DB_MARKERS.some((marker) => databaseUrl.includes(marker));
}

/** Remove e2e/test orphan customers on proof Postgres (CASCADE deletes related rows). */
export async function cleanupProofSeedOrphans(client: PoolClient): Promise<number> {
  const result = await client.query(
    `DELETE FROM customers
     WHERE id NOT IN ($1::uuid, $2::uuid)`,
    [SEED_IDS.customerDefault, SEED_IDS.customerTenantB],
  );
  return result.rowCount ?? 0;
}
