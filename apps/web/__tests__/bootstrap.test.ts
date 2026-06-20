import { describe, expect, it } from 'vitest';
import { CRM_OS_VERSION } from '@crm-os/shared';

describe('@crm-os/web bootstrap', () => {
  it('uses shared workspace package', () => {
    expect(CRM_OS_VERSION).toBe('0.1.0');
  });
});
