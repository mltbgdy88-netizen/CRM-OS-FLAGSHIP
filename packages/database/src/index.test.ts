import { describe, expect, it } from 'vitest';
import { getDatabaseConfigFromEnv } from './index';

describe('@crm-os/database', () => {
  it('reads DATABASE_URL from env', () => {
    const config = getDatabaseConfigFromEnv({
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/crmos',
    });

    expect(config.url).toContain('postgresql://');
  });

  it('throws when DATABASE_URL is missing', () => {
    expect(() => getDatabaseConfigFromEnv({})).toThrow('DATABASE_URL is not configured');
  });
});
