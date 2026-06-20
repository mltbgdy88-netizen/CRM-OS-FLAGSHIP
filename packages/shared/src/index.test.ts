import { describe, expect, it } from 'vitest';
import { CRM_OS_SERVICE_NAME, CRM_OS_VERSION } from './index';

describe('@crm-os/shared', () => {
  it('exports bootstrap constants', () => {
    expect(CRM_OS_VERSION).toBe('0.1.0');
    expect(CRM_OS_SERVICE_NAME).toBe('crm-os');
  });
});
