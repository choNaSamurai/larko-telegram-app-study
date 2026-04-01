// src/constants/apiConstants.ts
// API configuration constants — staging only during development
// Source: backend/frontend_integration_guide.md §1 Environments + §3 API Keys
// CONSTRAINT: Never use Production URL during development

export const ApiConstants = {
  /** Staging base URL — always use this during development */
  BASE_URL_STAGING: 'https://dev-api-larko.driveapp.work/api/v1',
  /** Production base URL — only for production builds */
  BASE_URL_PRODUCTION: 'https://api-larko.driveapp.work/api/v1',

  /**
   * Frontend API Key (Staging) — identifies the TMA client app.
   * Required on ALL requests (even public ones).
   * Source: frontend_integration_guide.md §3
   */
  API_KEY_STAGING: 'IMuLwFzIMpJ7d7lQT9Q_9Z-uRNds3X0wUSuMHJS8bDM',

  /** Request timeouts */
  CONNECT_TIMEOUT_MS: 10_000,
  RECEIVE_TIMEOUT_MS: 15_000,
} as const;

/** Active base URL — staging in dev, production in prod */
export const ACTIVE_BASE_URL = import.meta.env.PROD
  ? ApiConstants.BASE_URL_PRODUCTION
  : ApiConstants.BASE_URL_STAGING;

/** Active API key */
export const ACTIVE_API_KEY = ApiConstants.API_KEY_STAGING;
