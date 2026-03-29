// src/main.tsx
// Entry point — TMA init + React Query provider

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import './index.css';

// ── TMA Initialization (MANDATORY before React render) ────────────────────
// ADR-001-A: staleTime 5min, retry 2
try {
  // @ts-expect-error — Telegram global injected by telegram-web-app.js script
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();    // Signal TMA is ready
    tg.expand();   // Request fullscreen layout
  }
} catch {
  // Non-TMA environment (browser dev) — continue normally
}

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
