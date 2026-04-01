// src/stores/authStore.ts
// Auth state store — Zustand.
// Source: backend/frontend_integration_guide.md §Зберігання токенів
//
// RULE: access_token stored in localStorage (TMA web standard — 1 hour lifetime).
//       refresh_token NOT stored — refresh endpoint is TODO on backend.
//       On 401: clear token, emit re-auth event.

import { create } from 'zustand';

export interface AuthState {
  /** JWT access token (1 hour lifetime) */
  accessToken: string | null;
  /** Larko account UUID */
  accountId: string | null;
  /** Full name of the authenticated account */
  fullName: string | null;
  /** Active company UUID (first company after login) */
  companyId: string | null;
  /** Member UUID within the active company */
  memberId: string | null;
  /** Whether auth initialization is complete */
  isAuthReady: boolean;
}

export interface AuthActions {
  setAuthData(data: {
    accessToken: string;
    accountId: string;
    fullName: string;
    companyId: string;
    memberId: string;
  }): void;
  setAuthReady(ready: boolean): void;
  clearAuth(): void;
}

const LS_KEY = 'larko_access_token';

function loadTokenFromStorage(): string | null {
  try {
    return localStorage.getItem(LS_KEY);
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // Initial state — attempt to rehydrate token from localStorage
  accessToken: loadTokenFromStorage(),
  accountId: null,
  fullName: null,
  companyId: null,
  memberId: null,
  isAuthReady: false,

  setAuthData({ accessToken, accountId, fullName, companyId, memberId }) {
    try {
      localStorage.setItem(LS_KEY, accessToken);
    } catch {
      // localStorage blocked — in-memory only
    }
    set({ accessToken, accountId, fullName, companyId, memberId, isAuthReady: true });
  },

  setAuthReady(ready: boolean) {
    set({ isAuthReady: ready });
  },

  clearAuth() {
    try {
      localStorage.removeItem(LS_KEY);
    } catch { /* noop */ }
    set({
      accessToken: null,
      accountId: null,
      fullName: null,
      companyId: null,
      memberId: null,
      isAuthReady: true, // ready=true even after clear — UI shows auth state
    });
  },
}));

/** Read auth state without React — for use in services and API layer */
export function getAuthState(): AuthState {
  return useAuthStore.getState();
}
