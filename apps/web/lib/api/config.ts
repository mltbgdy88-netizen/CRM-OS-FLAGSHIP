/** API base URL for browser calls. Override with NEXT_PUBLIC_API_URL in local dev. */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
}
