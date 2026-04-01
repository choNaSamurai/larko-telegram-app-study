// src/api/authApi.ts
// Auth endpoints — Telegram WebApp + email/password + account management
// Source: backend/api_endpoints_reference.md §1 Auth
// Swagger operationIds:
//   telegram_auth_api_v1_auth_telegram_post
//   register_api_v1_auth_register_post
//   login_api_v1_auth_login_post
//   get_me_api_v1_auth_me_get

import { httpClient } from './httpClient';

// ─── Swagger schema types ─────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AccountResponse {
  id: string;
  email: string;
  full_name: string;
  language: string;
  telegram_id: number | null;
  trial_used: boolean;
  created_at: string;
}

export interface AuthResponse {
  tokens: TokenResponse;
  account: AccountResponse;
}

export interface TelegramAuthRequest {
  init_data: string;
  full_name?: string | null;
  language?: 'uk' | 'en';
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  language?: 'uk' | 'en';
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Authenticate via Telegram WebApp initData.
 * Primary auth flow for TMA workers.
 * operationId: telegram_auth_api_v1_auth_telegram_post
 */
export async function telegramAuth(
  initData: string,
  fullName?: string | null,
): Promise<AuthResponse> {
  return httpClient.post<AuthResponse>(
    '/auth/telegram',
    {
      init_data: initData,
      full_name: fullName ?? null,
      language: 'uk',
    } satisfies TelegramAuthRequest,
    { skipAuth: true },
  );
}

/**
 * Register a new account (email + password — for dev/testing only).
 * operationId: register_api_v1_auth_register_post
 */
export async function registerAccount(
  email: string,
  password: string,
  fullName: string,
): Promise<AuthResponse> {
  return httpClient.post<AuthResponse>(
    '/auth/register',
    { email, password, full_name: fullName, language: 'uk' } satisfies RegisterRequest,
    { skipAuth: true },
  );
}

/**
 * Login with email + password (dev/testing only).
 * operationId: login_api_v1_auth_login_post
 */
export async function loginAccount(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return httpClient.post<AuthResponse>(
    '/auth/login',
    { email, password } satisfies LoginRequest,
    { skipAuth: true },
  );
}

/**
 * Get current authenticated account.
 * operationId: get_me_api_v1_auth_me_get
 */
export async function getMe(): Promise<AccountResponse> {
  return httpClient.get<AccountResponse>('/auth/me');
}
