// src/constants/balanceIcons.ts
// Traces to: Tech Stack §Icon Configuration, ADR-002-C (Iconify solar:* mapping)
// CONSTRAINT: All icon IDs, colors, and backgrounds defined HERE — never hardcoded in components

import type { HistoryItemType } from '@/types/balance.types';

// ── Iconify icon IDs (solar:* set — ADR-002-C) ───────────────────────────────

export const HISTORY_ICON: Record<HistoryItemType, string> = {
  earned:   'solar:arrow-up-bold',
  advance:  'solar:arrow-down-bold',
  overtime: 'solar:clock-circle-bold',
};

// ── Icon foreground colors ────────────────────────────────────────────────────

export const HISTORY_ICON_COLOR: Record<HistoryItemType, string> = {
  earned:   '#34d399',  // --status-success
  advance:  '#60a5fa',  // --advances
  overtime: '#fbbf24',  // --status-warning
};

// ── Icon badge background colors ─────────────────────────────────────────────

export const HISTORY_ICON_BG: Record<HistoryItemType, string> = {
  earned:   'rgba(52,211,153,0.15)',  // green tint
  advance:  'rgba(96,165,250,0.15)',  // blue tint
  overtime: 'rgba(251,191,36,0.15)',  // amber tint
};

// ── History amount text colors ────────────────────────────────────────────────

export const HISTORY_AMOUNT_COLOR: Record<HistoryItemType, string> = {
  earned:   '#34d399',
  advance:  '#60a5fa',
  overtime: '#fbbf24',
};

// ── Stat card icon config ─────────────────────────────────────────────────────

export type StatCardType = 'earned' | 'advances' | 'remaining';

export const STAT_ICON: Record<StatCardType, string | null> = {
  earned:    'solar:arrow-up-bold',
  advances:  'solar:arrow-down-bold',
  remaining: null,  // emoji 💰 — not an icon
};

export const STAT_ICON_COLOR: Record<StatCardType, string> = {
  earned:    '#34d399',
  advances:  '#60a5fa',
  remaining: '#ededed',
};

export const STAT_ICON_BG: Record<StatCardType, string> = {
  earned:    'rgba(52,211,153,0.15)',
  advances:  'rgba(96,165,250,0.15)',
  remaining: 'rgba(255,255,255,0.1)',
};

export const STAT_AMOUNT_COLOR: Record<StatCardType, string> = {
  earned:    '#34d399',
  advances:  '#60a5fa',
  remaining: '#ededed',  // overridden to #ef4444 when isNegative
};

// ── Badge dimensions (px) ─────────────────────────────────────────────────────
// Scenario §12.1 Spacing Table

export const STAT_BADGE_PX  = 24;  // stat card icon badge diameter
export const HIST_BADGE_PX  = 36;  // history item icon badge diameter
export const STAT_ICON_SIZE = 12;  // icon inside stat badge
export const HIST_ICON_SIZE = 14;  // icon inside history badge
