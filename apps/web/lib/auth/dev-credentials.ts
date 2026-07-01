/** Local dev seed credentials — never enable auto-login in production. */
export const DEV_LOGIN_EMAIL = 'admin@default.local';
export const DEV_LOGIN_PASSWORD = 'Admin123!';
export const DEV_LOGIN_TENANT = 'default';

export function isDevAutoLoginEnabled(): boolean {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
    return false;
  }
  return process.env.NEXT_PUBLIC_DEV_AUTO_LOGIN !== 'false';
}
