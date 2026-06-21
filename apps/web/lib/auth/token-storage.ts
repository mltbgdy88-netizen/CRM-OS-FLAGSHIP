const ACCESS_TOKEN_KEY = 'crm-os.accessToken';

/**
 * LOCAL DEV SKELETON ONLY.
 * sessionStorage is readable by any script on the page (XSS risk).
 * Production must use httpOnly secure cookies — not implemented in Sprint-02 Phase 2.
 */
export function storeAccessToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken(): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}
