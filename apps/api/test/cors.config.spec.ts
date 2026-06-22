import { DEFAULT_CORS_ORIGIN, buildCorsOptions, resolveCorsOrigins } from '../src/cors.config';

describe('cors.config', () => {
  it('defaults to localhost web origin when env is absent', () => {
    expect(resolveCorsOrigins(undefined)).toEqual([DEFAULT_CORS_ORIGIN]);
    expect(buildCorsOptions(undefined).origin).toBe(DEFAULT_CORS_ORIGIN);
  });

  it('parses comma-separated origins', () => {
    expect(resolveCorsOrigins('http://localhost:3000,http://127.0.0.1:3000')).toEqual([
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ]);
  });

  it('allows POST and Authorization for browser clients', () => {
    const options = buildCorsOptions('http://localhost:3000');
    expect(options.methods).toEqual(expect.arrayContaining(['POST', 'OPTIONS']));
    expect(options.allowedHeaders).toEqual(
      expect.arrayContaining(['Content-Type', 'Authorization']),
    );
  });
});
