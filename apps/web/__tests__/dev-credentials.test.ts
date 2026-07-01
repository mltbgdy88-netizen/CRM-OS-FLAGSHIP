import { describe, expect, it } from 'vitest';
import {
  DEV_LOGIN_EMAIL,
  DEV_LOGIN_PASSWORD,
  DEV_LOGIN_TENANT,
  isDevAutoLoginEnabled,
} from '../lib/auth/dev-credentials';

describe('dev-credentials', () => {
  it('exposes default local seed credentials', () => {
    expect(DEV_LOGIN_EMAIL).toBe('admin@default.local');
    expect(DEV_LOGIN_PASSWORD).toBe('Admin123!');
    expect(DEV_LOGIN_TENANT).toBe('default');
  });

  it('disables auto login in test environment', () => {
    expect(isDevAutoLoginEnabled()).toBe(false);
  });
});
