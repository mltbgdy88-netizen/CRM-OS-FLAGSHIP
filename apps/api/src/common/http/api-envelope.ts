export interface ApiDataEnvelope<T> {
  data: T;
  meta: {
    requestId?: string;
    timestamp: string;
  };
}

export function okEnvelope<T>(data: T): ApiDataEnvelope<T> {
  return {
    data,
    meta: { timestamp: new Date().toISOString() },
  };
}

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
