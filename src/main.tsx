// src/main.tsx
// Entry point — TMA init + silent auth + React Query provider + DB initialization
//
// Boot sequence (Option A — silent Telegram auto-auth):
//   1. TMA ready() + expand()
//   2. initDB()
//   3. POST /auth/telegram with initData → store access_token + account
//   4. GET /companies → resolve company_id
//   5. GET /members/companies/{id}/members → resolve member_id
//   6. Mount React app (always — even if auth fails, UI shows gracefully)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import { initDB } from './db/AppDB';
import { SyncService } from './services/SyncService';
import { telegramAuth } from './api/authApi';
import { listMyCompanies, listCompanyMembers } from './api/companiesApi';
import { useAuthStore } from './stores/authStore';
import './index.css';

// ── TMA Initialization (MANDATORY before React render) ────────────────────
let _initData: string | null = null;
let _fullName: string | null = null;

try {
  // @ts-expect-error — Telegram global injected by telegram-web-app.js
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    _initData = tg.initData ?? null;
    _fullName = tg.initDataUnsafe?.user?.first_name ?? null;
  }
} catch {
  // Non-TMA environment (browser dev) — continue without Telegram globals
}

// ── DB initialization ──────────────────────────────────────────────────────
await initDB();
SyncService.registerListeners();
console.info('[App] DB initialized. SyncService listeners registered.');

// ── Silent Telegram Auto-Auth (Option A) ──────────────────────────────────
// Runs before React mounts — sets auth state globally so all services have
// tokens immediately. Failure is non-fatal: app still mounts (read-only UI).
async function bootAuth(): Promise<void> {
  const { setAuthData, setAuthReady } = useAuthStore.getState();

  if (!_initData) {
    // Dev mode without Telegram — auth not possible silently
    console.warn('[Auth] No Telegram initData — running in unauthenticated mode');
    setAuthReady(true);
    return;
  }

  try {
    // Step 1: Authenticate with backend
    const authResp = await telegramAuth(_initData, _fullName);
    const { access_token } = authResp.tokens;
    const { id: accountId, full_name } = authResp.account;

    // Step 2: Resolve company_id (first company)
    const companiesResp = await listMyCompanies();
    const firstCompany = companiesResp.items[0];
    if (!firstCompany) {
      // Worker has no company yet — partial auth (no company_id)
      console.warn('[Auth] No company found for this account');
      setAuthData({ accessToken: access_token, accountId, fullName: full_name, companyId: '', memberId: '' });
      return;
    }

    // Step 3: Resolve member_id within the company
    const membersResp = await listCompanyMembers(firstCompany.id);
    const myMember = membersResp.items.find(
      (m) => m.account_id === accountId
    );

    setAuthData({
      accessToken: access_token,
      accountId,
      fullName: full_name,
      companyId: firstCompany.id,
      memberId: myMember?.id ?? '',
    });

    // Inject token into SyncService for background sync
    // (SyncService reads from authStore directly via apiRequest)
    console.info('[Auth] Boot auth complete — companyId:', firstCompany.id, 'memberId:', myMember?.id);

    // Trigger sync flush now that we have a valid token
    void SyncService.flush();

  } catch (err) {
    console.error('[Auth] Boot auth failed:', err);
    // Non-fatal — app still mounts, API calls will get 401 errors handled gracefully
    useAuthStore.getState().setAuthReady(true);
  }
}

await bootAuth();

// ── React Query client ──────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// ── React render ────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
