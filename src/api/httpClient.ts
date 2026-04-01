// src/api/httpClient.ts
// Central HTTP client — fetch wrapper with auth + error handling.
// Source: backend/frontend_integration_guide.md §HTTP Client Boilerplate
//
// CONSTRAINTS:
//   - X-API-Key injected on EVERY request (except /health)
//   - Authorization: Bearer <token> injected from authStore when present
//   - 401 → clearAuth() + emit 'auth:expired' CustomEvent
//   - 429 → emit 'api:rate-limit' CustomEvent (UI shows banner)
//   - All errors thrown as ApiError instances (never raw Error)
//   - NEVER call Production URL during development

import { ACTIVE_BASE_URL, ACTIVE_API_KEY } from '@/constants/apiConstants';
import { getAuthState, useAuthStore } from '@/stores/authStore';
import { ApiError } from './apiError';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Skip auth header injection (for public endpoints like /auth/register) */
  skipAuth?: boolean;
  /** Custom headers */
  headers?: Record<string, string>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, skipAuth = false, headers: extraHeaders = {} } = options;

  const { accessToken } = getAuthState();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': ACTIVE_API_KEY,
    ...extraHeaders,
  };

  if (!skipAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(`${ACTIVE_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw ApiError.networkError(networkErr);
  }

  // ── 401: Token expired / invalid ──────────────────────────────────────────
  if (response.status === 401) {
    useAuthStore.getState().clearAuth();
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw await ApiError.fromResponse(response);
  }

  // ── 429: Rate limit ────────────────────────────────────────────────────────
  if (response.status === 429) {
    window.dispatchEvent(new CustomEvent('api:rate-limit'));
    throw await ApiError.fromResponse(response);
  }

  // ── Non-2xx ────────────────────────────────────────────────────────────────
  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }

  // ── 204 No Content ─────────────────────────────────────────────────────────
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

export const httpClient = {
  get<T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(path, { ...opts, method: 'GET' });
  },

  post<T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(path, { ...opts, method: 'POST', body });
  },

  patch<T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(path, { ...opts, method: 'PATCH', body });
  },

  put<T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(path, { ...opts, method: 'PUT', body });
  },

  delete<T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(path, { ...opts, method: 'DELETE' });
  },
};
