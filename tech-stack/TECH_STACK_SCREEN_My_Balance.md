# TECH STACK — SCREEN_My_Balance (W3)

**Traces to:** `scenario/SCREEN_My_Balance.md` §12.1 | `adr/ADR_SCREEN_My_Balance.md`
**BRD:** `ba/04_BRD_Larko_MVP.md` §2 Worker — My Balance
**Figma:** https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=83-6570

---

## Framework & Runtime

| Item | Value |
|------|-------|
| Framework | **React** (Vite + TypeScript) — same project as W1 |
| Language | TypeScript (strict mode) |
| TMA SDK | `@twa-dev/sdk` — `Telegram.WebApp` API |
| Styling | **Tailwind CSS v3** with custom tokens (extend existing `tailwind.config.js`) |
| Icons | `@iconify/react` — `solar:*` set for all icons (see ADR-002-C icon mapping) |
| Data fetching | `@tanstack/react-query` v5 — `queryKey: ['balance', period]` |
| State (UI) | `zustand` — `useBalancePeriodStore` for active period tab |

---

## File Structure

```
src/
├── styles/
│   └── tokens.css                              # (existing — add W3 tokens if missing)
├── types/
│   └── balance.types.ts                        # TypeScript interfaces for Balance domain
├── mocks/
│   └── MockData.ts                             # (existing — add MOCK_BALANCE_DATA)
├── services/
│   └── balanceService.ts                       # Data access layer (mock → real API)
├── stores/
│   └── useBalancePeriodStore.ts                # Zustand: active period filter (week/month/all)
├── utils/
│   └── formatters.ts                           # (existing — add formatSignedMoney())
├── components/
│   └── screens/
│       └── MyBalance/
│           ├── MyBalanceScreen.tsx             # Root screen component
│           ├── StatCards.tsx                   # 3-card row (Earned / Advances / Remaining)
│           ├── StatCard.tsx                    # Single stat card (shared by all 3 types)
│           ├── PeriodFilter.tsx                # Period tab bar (This Week / Month / All Time)
│           ├── HistoryList.tsx                 # Scrollable history list
│           ├── HistoryItem.tsx                 # Single history row (earned / advance / overtime)
│           ├── NegativeBanner.tsx              # Warning banner (Remaining < 0)
│           ├── InfoPopup.tsx                   # ⓘ info overlay (ReactDOM.createPortal)
│           ├── BalanceSkeleton.tsx             # Loading skeleton
│           ├── BalanceEmpty.tsx                # Empty state (no earnings yet)
│           └── BalanceError.tsx                # Error state (API failed)
```

---

## TypeScript Interfaces

```typescript
// src/types/balance.types.ts

export type BalancePeriod = 'week' | 'month' | 'all';

export type HistoryItemType = 'earned' | 'advance' | 'overtime';

export interface BalanceHistoryItem {
  id: string;
  type: HistoryItemType;
  name: string;           // Order name or "Аванс"
  date: string;           // "23 бер"
  hours?: string;         // "9.0 год" — only for earned/overtime; absent for advances
  amount: number;         // Signed: positive for earned/overtime, negative for advance
  currency: string;       // "₴"
}

export interface BalanceData {
  earned: number;         // Total earned in period (always ≥ 0)
  advances: number;       // Total advances issued (always ≥ 0)
  remaining: number;      // earned - advances (may be negative)
  periodLabel: string;    // "Березень 2026" | "Поточний тиждень" | "Весь час"
  history: BalanceHistoryItem[];
}
```

---

## MockData.ts

```typescript
// Add to src/mocks/MockData.ts
import type { BalanceData } from '@/types/balance.types';

export const MOCK_BALANCE_DEFAULT: BalanceData = {
  earned: 18450,
  advances: 5000,
  remaining: 13450,
  periodLabel: 'Березень 2026',
  history: [
    {
      id: 'h1',
      type: 'earned',
      name: 'Сонячна Станція №4',
      date: '23 бер',
      hours: '9.0 год',
      amount: 4050,
      currency: '₴',
    },
    {
      id: 'h2',
      type: 'advance',
      name: 'Аванс',
      date: '22 бер',
      amount: -5000,
      currency: '₴',
    },
    {
      id: 'h3',
      type: 'earned',
      name: 'Ремонт електропроводки',
      date: '21 бер',
      hours: '8.0 год',
      amount: 3200,
      currency: '₴',
    },
    {
      id: 'h4',
      type: 'overtime',
      name: 'Овертайм · Станція №3',
      date: '20 бер',
      hours: '2.5 год × 1.5',
      amount: 1688,
      currency: '₴',
    },
    {
      id: 'h5',
      type: 'earned',
      name: 'Аудит лічильників',
      date: '19 бер',
      hours: '8.0 год',
      amount: 3600,
      currency: '₴',
    },
  ],
};

// Negative balance scenario (for testing S3 state)
export const MOCK_BALANCE_NEGATIVE: BalanceData = {
  earned: 3200,
  advances: 8000,
  remaining: -4800,
  periodLabel: 'Березень 2026',
  history: [
    { id: 'n1', type: 'advance', name: 'Аванс', date: '22 бер', amount: -5000, currency: '₴' },
    { id: 'n2', type: 'advance', name: 'Аванс', date: '18 бер', amount: -3000, currency: '₴' },
    { id: 'n3', type: 'earned', name: 'Ремонт електропроводки', date: '17 бер', hours: '8.0 год', amount: 3200, currency: '₴' },
  ],
};

// Empty state scenario (for testing S4 state)
export const MOCK_BALANCE_EMPTY: BalanceData = {
  earned: 0,
  advances: 0,
  remaining: 0,
  periodLabel: 'Березень 2026',
  history: [],
};
```

---

## balanceService.ts

```typescript
// src/services/balanceService.ts
import { MOCK_BALANCE_DEFAULT } from '@/mocks/MockData';
import type { BalanceData, BalancePeriod } from '@/types/balance.types';

const SIMULATED_DELAY_MS = 600;

/**
 * Fetches balance data for the authenticated worker for a given period.
 * TODO: Replace mock with:
 *   fetch(`/api/v1/worker/balance?period=${period}`, {
 *     headers: { Authorization: `Bearer ${token}` }
 *   })
 */
export async function fetchWorkerBalance(period: BalancePeriod): Promise<BalanceData> {
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY_MS));

  // Simulate occasional error for testing error state:
  // if (Math.random() < 0.1) throw new Error('Simulated network error');

  // Swap to MOCK_BALANCE_NEGATIVE or MOCK_BALANCE_EMPTY for state testing
  return MOCK_BALANCE_DEFAULT;
}
```

---

## useBalancePeriodStore.ts

```typescript
// src/stores/useBalancePeriodStore.ts
import { create } from 'zustand';
import type { BalancePeriod } from '@/types/balance.types';

interface BalancePeriodState {
  activePeriod: BalancePeriod;
  setPeriod: (period: BalancePeriod) => void;
}

export const useBalancePeriodStore = create<BalancePeriodState>((set) => ({
  activePeriod: 'month',            // Default: current calendar month (matches Figma)
  setPeriod: (period) => set({ activePeriod: period }),
}));
```

---

## Utility Functions

```typescript
// Add to src/utils/formatters.ts

/**
 * Format monetary amount — positive: ₴18,450 | zero: ₴0
 * Traces to: Scenario §12.1 Price/Number Formats
 * (existing formatMoney handles this — alias shown for clarity)
 */
// existing: export function formatMoney(amount: number, currency = '₴'): string

/**
 * Format signed balance history amount.
 * Earned/Overtime → "+₴4,050" (green) | Advance → "−₴5,000" (blue)
 *
 * CRITICAL: Use Unicode minus U+2212 (−) NOT ASCII hyphen (-) for negative amounts.
 * Traces to: Scenario §12.1 Price/Number Formats
 */
export function formatSignedMoney(amount: number, currency = '₴'): string {
  const abs = Math.abs(Math.floor(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (amount > 0) return `+${currency}${abs}`;
  if (amount < 0) return `\u2212${currency}${abs}`; // U+2212 minus sign
  return `${currency}0`;
}

/**
 * Format balance period label for header subtitle.
 * Traces to: Scenario §1, §§12.1
 */
export function formatPeriodLabel(period: 'week' | 'month' | 'all', apiLabel?: string): string {
  if (apiLabel) return apiLabel; // Use API-provided label if available
  const map: Record<string, string> = {
    week: 'Поточний тиждень',
    month: new Date().toLocaleString('uk', { month: 'long', year: 'numeric' }),
    all: 'Весь час',
  };
  return map[period] ?? 'Березень 2026';
}
```

---

## Design Tokens — Tailwind Config Extension

```typescript
// Extend existing tailwind.config.js — add W3-specific tokens:
// All values from Scenario §12.1 Color Table

theme: {
  extend: {
    colors: {
      // --- EXISTING from W1 (already present) ---
      'bg-screen':       '#222226',
      'bg-card':         '#2d2d31',
      'text-primary':    '#ededed',
      'text-secondary':  '#9d9d9d',
      'status-success':  '#34d399',
      'status-warning':  '#fbbf24',

      // --- NEW for W3 ---
      'status-negative': '#ef4444',    // Negative Remaining amount text
      'advances':        '#60a5fa',    // Advances stat card + advance history rows
      'earned-badge':    'rgba(52,211,153,0.15)',   // Earned icon circle bg
      'advances-badge':  'rgba(96,165,250,0.15)',   // Advances icon circle bg
      'overtime-badge':  'rgba(251,191,36,0.15)',   // Overtime icon circle bg
      'remaining-badge': 'rgba(255,255,255,0.1)',   // Remaining icon circle bg
    },
    borderRadius: {
      // --- EXISTING from W1 ---
      'card': '20px',
      // --- NEW for W3 ---
      'stat-card': '20px',    // Stat card border-radius (same as 'card')
      'banner':    '12px',    // Warning banner + Info popup card
    },
    fontSize: {
      // --- EXISTING from W1 ---
      'screen-title': ['18px', { lineHeight: '28px', fontWeight: '600', letterSpacing: '-0.5px' }],
      'meta':         ['12px', { lineHeight: '16px', fontWeight: '400' }],
      // --- NEW for W3 ---
      'stat-label':   ['12px', { lineHeight: '16px', fontWeight: '400' }],
      'stat-amount':  ['18px', { lineHeight: '28px', fontWeight: '700' }], // JetBrains Mono
      'history-name': ['14px', { lineHeight: '20px', fontWeight: '500' }],
      'history-amount': ['14px', { lineHeight: '20px', fontWeight: '700' }], // JetBrains Mono
      'section-head': ['14px', { lineHeight: '20px', fontWeight: '600' }],
      'empty-title':  ['16px', { lineHeight: '24px', fontWeight: '600' }],
    },
  },
},
```

---

## Icon Configuration (Authoritative)

```typescript
// src/constants/balanceIcons.ts
// Traces to: Scenario §12.1 Icon Inventory + ADR-002-C

import type { HistoryItemType } from '@/types/balance.types';

export const HISTORY_ICON: Record<HistoryItemType, string> = {
  earned:   'solar:arrow-up-bold',
  advance:  'solar:arrow-down-bold',
  overtime: 'solar:clock-circle-bold',
};

export const HISTORY_ICON_COLOR: Record<HistoryItemType, string> = {
  earned:   '#34d399',   // --status-success
  advance:  '#60a5fa',   // --advances
  overtime: '#fbbf24',   // --status-warning
};

export const HISTORY_ICON_BG: Record<HistoryItemType, string> = {
  earned:   'rgba(52,211,153,0.15)',   // --earned-badge
  advance:  'rgba(96,165,250,0.15)',   // --advances-badge
  overtime: 'rgba(251,191,36,0.15)',   // --overtime-badge
};

export const HISTORY_AMOUNT_COLOR: Record<HistoryItemType, string> = {
  earned:   '#34d399',
  advance:  '#60a5fa',
  overtime: '#fbbf24',
};

// Stat card icon sizes (badge diameter)
export const STAT_BADGE_SIZE = 24;   // px — stat cards
export const HIST_BADGE_SIZE = 36;   // px — history items
export const STAT_ICON_SIZE  = 12;   // px — icon inside stat badge
export const HIST_ICON_SIZE  = 14;   // px — icon inside history badge
```

---

## External Dependencies

| Package | Version | Purpose | Usage |
|---------|---------|---------|-------|
| `@iconify/react` | latest | All icons — `solar:*` set | `<Icon icon="solar:arrow-up-bold" width={12} />` |
| `@tanstack/react-query` | v5 | Data fetching + cache | `useQuery({ queryKey: ['balance', period], queryFn })` |
| `zustand` | v5 | Period filter state | `useBalancePeriodStore()` |
| `@twa-dev/sdk` | latest | `Telegram.WebApp` API | `WebApp.ready()`, `WebApp.BackButton` |

> **All 4 packages are already installed** from W1 implementation. Zero new dependencies.

---

## Step-by-Step Implementation

### Step 1 — Types & Interfaces
1. Create `src/types/balance.types.ts` with `BalancePeriod`, `HistoryItemType`, `BalanceHistoryItem`, `BalanceData` interfaces.
2. Verify `HistoryItemType` covers all 3 variants: `'earned' | 'advance' | 'overtime'`.

### Step 2 — Mock Data
1. Add `MOCK_BALANCE_DEFAULT`, `MOCK_BALANCE_NEGATIVE`, `MOCK_BALANCE_EMPTY` to `src/mocks/MockData.ts`.
2. Ensure `MOCK_BALANCE_DEFAULT.history` has all 3 item types (earned, advance, overtime) for visual testing.
3. `MOCK_BALANCE_NEGATIVE.remaining` must be negative (`earned - advances < 0`).

### Step 3 — Service Layer
1. Create `src/services/balanceService.ts` with `fetchWorkerBalance(period: BalancePeriod)`.
2. Simulated delay: 600ms (matches W1 loading experience).
3. The function signature must accept `period` as the switch for future real API calls.

### Step 4 — Utility Functions
1. Add `formatSignedMoney(amount)` to `src/utils/formatters.ts`.
2. **Validate**: `formatSignedMoney(4050)` === `"+₴4,050"`, `formatSignedMoney(-5000)` === `"−₴5,000"` (Unicode minus).
3. **Validate**: `formatSignedMoney(0)` === `"₴0"`.
4. Add `formatPeriodLabel(period, apiLabel?)` for header subtitle.

### Step 5 — Zustand Period Store
1. Create `src/stores/useBalancePeriodStore.ts` per code above.
2. Default: `activePeriod = 'month'`.
3. Period change triggers React Query refetch automatically via `queryKey` dependency.

### Step 6 — Icon Constants
1. Create `src/constants/balanceIcons.ts` with `HISTORY_ICON`, `HISTORY_ICON_COLOR`, `HISTORY_ICON_BG`, `HISTORY_AMOUNT_COLOR` records.
2. Verify all 3 `HistoryItemType` keys are covered in each record.

### Step 7 — Tailwind Token Extension
1. Open `tailwind.config.js` and add W3-specific tokens to `theme.extend`.
2. Key additions: `status-negative: '#ef4444'`, `advances: '#60a5fa'`, `stat-amount`, `history-name`, `history-amount` font sizes.
3. **Do NOT** add `JetBrains Mono` to Tailwind — apply it as `font-['JetBrains_Mono',sans-serif]` inline class on amount elements.

### Step 8 — StatCard Component

```tsx
// src/components/screens/MyBalance/StatCard.tsx

interface StatCardProps {
  label: string;             // "Зароблено" | "Аванси" | "Залишок"
  amount: number;
  type: 'earned' | 'advances' | 'remaining';
  isNegative?: boolean;      // Only for 'remaining' type
}

const CARD_CONFIG = {
  earned: {
    icon: 'solar:arrow-up-bold',
    iconColor: '#34d399',
    iconBg: 'rgba(52,211,153,0.15)',
    amountColor: '#34d399',
  },
  advances: {
    icon: 'solar:arrow-down-bold',
    iconColor: '#60a5fa',
    iconBg: 'rgba(96,165,250,0.15)',
    amountColor: '#60a5fa',
  },
  remaining: {
    icon: null,               // emoji 💰
    iconColor: '#ededed',
    iconBg: 'rgba(255,255,255,0.1)',
    amountColor: '#ededed',   // overridden to #ef4444 when isNegative
  },
};

export function StatCard({ label, amount, type, isNegative }: StatCardProps) {
  const cfg = CARD_CONFIG[type];
  const amountColor = type === 'remaining' && isNegative ? '#ef4444' : cfg.amountColor;

  return (
    <div className="bg-bg-card border border-[rgba(255,255,255,0.08)] rounded-[20px] p-[13px] flex flex-col gap-2 flex-1">
      {/* Label row */}
      <div className="flex items-center gap-[6px]">
        {/* Icon badge */}
        <div
          className="rounded-full flex items-center justify-center shrink-0"
          style={{ width: 24, height: 24, background: cfg.iconBg }}
        >
          {type === 'remaining' ? (
            <span className="text-[10px] leading-none">💰</span>
          ) : (
            <Icon icon={cfg.icon!} width={12} color={cfg.iconColor} />
          )}
        </div>
        <span className="text-stat-label text-text-secondary">{label}</span>
      </div>

      {/* Amount */}
      <span
        className="font-['JetBrains_Mono',sans-serif] font-bold text-[18px] leading-[28px]"
        style={{ color: amountColor }}
      >
        {/* Negative remaining: "−₴4,800" | Others: "₴18,450" */}
        {type === 'remaining' && isNegative
          ? `\u2212₴${Math.abs(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
          : formatMoney(amount)}
      </span>
    </div>
  );
}
```

**Critical rules:**
- Use `flex-1` on each card — all 3 cards share available width equally.
- `border border-[rgba(255,255,255,0.08)]` is **all 4 sides** (unlike W1 task cards which are left-only).
- Negative format uses Unicode `\u2212` minus, NOT ASCII `-`.

### Step 9 — StatCards Row Component

```tsx
// src/components/screens/MyBalance/StatCards.tsx

export function StatCards({ data }: { data: BalanceData }) {
  const isNegative = data.remaining < 0;
  return (
    <div className="flex gap-4 px-4">
      <StatCard label="Зароблено" amount={data.earned}    type="earned" />
      <StatCard label="Аванси"    amount={data.advances}  type="advances" />
      <StatCard label="Залишок"   amount={data.remaining} type="remaining" isNegative={isNegative} />
    </div>
  );
}
```

### Step 10 — NegativeBanner Component

```tsx
// src/components/screens/MyBalance/NegativeBanner.tsx

export function NegativeBanner({ deficit }: { deficit: number }) {
  // deficit: absolute value of negative remaining (e.g., 4800 when remaining = -4800)
  return (
    <div className="mx-4 rounded-[12px] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] px-4 py-3 flex items-start gap-3">
      <div className="rounded-full flex items-center justify-center shrink-0 mt-0.5"
           style={{ width: 32, height: 32, background: 'rgba(251,191,36,0.15)' }}>
        <Icon icon="solar:danger-triangle-bold" width={16} color="#fbbf24" />
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-[14px] font-medium leading-5 text-[#ef4444]">Від'ємний баланс</p>
        <p className="text-[12px] leading-4 text-text-secondary">
          Аванси перевищують заробіток на ₴{deficit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        </p>
      </div>
    </div>
  );
}
```

### Step 11 — PeriodFilter Component

```tsx
// src/components/screens/MyBalance/PeriodFilter.tsx
// OQ-W3-01 answer: Period filter IS implemented (This Week / This Month / All Time)

const PERIODS: { key: BalancePeriod; label: string }[] = [
  { key: 'week',  label: 'Цей тиждень' },
  { key: 'month', label: 'Цей місяць' },
  { key: 'all',   label: 'Весь час' },
];

export function PeriodFilter() {
  const { activePeriod, setPeriod } = useBalancePeriodStore();
  return (
    <div className="flex gap-2 px-4 overflow-x-auto">
      {PERIODS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setPeriod(key)}
          className={`
            px-4 py-1.5 rounded-full text-[14px] font-medium whitespace-nowrap shrink-0
            ${activePeriod === key
              ? 'bg-white text-[#222226]'
              : 'border border-[#878787] text-[#878787]'}
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
```

### Step 12 — HistoryItem Component

```tsx
// src/components/screens/MyBalance/HistoryItem.tsx

export function HistoryItem({ item, isLast }: { item: BalanceHistoryItem; isLast: boolean }) {
  const icon     = HISTORY_ICON[item.type];
  const iconColor = HISTORY_ICON_COLOR[item.type];
  const iconBg    = HISTORY_ICON_BG[item.type];
  const amountColor = HISTORY_AMOUNT_COLOR[item.type];

  return (
    <div className={`flex items-center gap-3 py-[12px] px-4 ${!isLast ? 'border-b border-[rgba(255,255,255,0.08)]' : ''}`}>
      {/* Type icon badge */}
      <div
        className="rounded-full flex items-center justify-center shrink-0"
        style={{ width: 36, height: 36, background: iconBg }}
      >
        <Icon icon={icon} width={14} color={iconColor} />
      </div>

      {/* Name + meta */}
      <div className="flex flex-col flex-1 min-w-0">
        <p className="text-[14px] font-medium leading-5 text-text-primary truncate">{item.name}</p>
        <p className="text-[12px] font-normal leading-4 text-text-secondary">
          {item.date}{item.hours ? ` · ${item.hours}` : ''}
        </p>
      </div>

      {/* Signed amount */}
      <span
        className="font-['JetBrains_Mono',sans-serif] font-bold text-[14px] leading-5 shrink-0"
        style={{ color: amountColor }}
      >
        {formatSignedMoney(item.amount)}
      </span>
    </div>
  );
}
```

### Step 13 — HistoryList Component

```tsx
// src/components/screens/MyBalance/HistoryList.tsx

export function HistoryList({ items }: { items: BalanceHistoryItem[] }) {
  return (
    <div className="flex flex-col">
      <p className="px-4 mb-2 text-section-head text-text-primary">Історія операцій</p>
      {items.map((item, idx) => (
        <HistoryItem key={item.id} item={item} isLast={idx === items.length - 1} />
      ))}
    </div>
  );
}
```

### Step 14 — InfoPopup Component

```tsx
// src/components/screens/MyBalance/InfoPopup.tsx
// Uses ReactDOM.createPortal — see ADR-002-D

import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

const INFO_ROWS = [
  {
    icon: 'solar:arrow-up-bold',
    iconBg: 'rgba(52,211,153,0.15)',
    iconColor: '#34d399',
    label: 'Зароблено',
    desc: 'Загальна сума нарахованої оплати за виконані замовлення за поточний місяць',
  },
  {
    icon: 'solar:arrow-down-bold',
    iconBg: 'rgba(96,165,250,0.15)',
    iconColor: '#60a5fa',
    label: 'Аванси',
    desc: 'Сума грошей, які ви вже отримали авансом до кінця розрахункового періоду',
  },
  {
    emoji: '💰',
    iconBg: 'rgba(255,255,255,0.1)',
    label: 'Залишок',
    desc: "Різниця між заробленим та отриманими авансами. Якщо від'ємний — ви повинні компанії",
  },
];

export function InfoPopup({ onClose }: { onClose: () => void }) {
  // Register Telegram BackButton to dismiss popup
  useEffect(() => {
    WebApp.BackButton.show();
    WebApp.BackButton.onClick(onClose);
    return () => {
      WebApp.BackButton.offClick(onClose);
      WebApp.BackButton.hide();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col"
      onClick={onClose}
    >
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Popup card — centered horizontally, positioned below header */}
      <div
        className="relative mx-4 mt-[84px] bg-[#2d2d31] rounded-[12px] p-[17px] flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click through
      >
        <p className="text-[14px] font-semibold leading-5 text-text-primary">Розрахунок балансу</p>
        <div className="flex flex-col gap-3">
          {INFO_ROWS.map((row, idx) => (
            <div key={idx} className="flex items-start gap-3">
              {/* Icon */}
              <div
                className="rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ width: 28, height: 28, background: row.iconBg }}
              >
                {row.emoji
                  ? <span className="text-[12px]">{row.emoji}</span>
                  : <Icon icon={row.icon!} width={14} color={row.iconColor} />}
              </div>
              {/* Text */}
              <div className="flex flex-col gap-0.5">
                <p className="text-[14px] font-normal leading-5 text-text-primary">{row.label}</p>
                <p className="text-[12px] leading-4 text-text-secondary">{row.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
```

### Step 15 — BalanceSkeleton Component

```tsx
// src/components/screens/MyBalance/BalanceSkeleton.tsx

export function BalanceSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {/* Stat cards skeleton */}
      <div className="flex gap-4 px-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 h-[86px] bg-bg-card rounded-[20px]" />
        ))}
      </div>
      {/* Period filter skeleton */}
      <div className="flex gap-2 px-4">
        {[80, 100, 70].map((w, i) => (
          <div key={i} className="h-8 rounded-full bg-bg-card" style={{ width: w }} />
        ))}
      </div>
      {/* History skeleton items */}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4">
          <div className="rounded-full bg-bg-card shrink-0" style={{ width: 36, height: 36 }} />
          <div className="flex flex-col flex-1 gap-1.5">
            <div className="h-4 w-2/3 rounded-md bg-bg-card" />
            <div className="h-3 w-1/3 rounded-md bg-bg-card" />
          </div>
          <div className="h-4 w-14 rounded-md bg-bg-card" />
        </div>
      ))}
    </div>
  );
}
```

### Step 16 — BalanceEmpty Component

```tsx
// src/components/screens/MyBalance/BalanceEmpty.tsx
// Traces to: Scenario §5.1, §8 State S4

import { useNavigate } from 'react-router-dom'; // or your router

export function BalanceEmpty() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 gap-4">
      <span className="text-[48px] leading-none">📊</span>
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-empty-title text-text-primary">Ще немає заробітку</p>
        <p className="text-[14px] text-text-secondary max-w-[245px]">
          Завершіть перше замовлення і ваш баланс з'явиться тут
        </p>
      </div>
      {/* OQ-W3-10: Navigates to W1 My Tasks */}
      <button
        onClick={() => navigate('/tasks')}
        className="w-full max-w-[326px] h-12 bg-white rounded-[32px] text-[#222226] font-semibold text-[14px]"
      >
        Переглянути замовлення
      </button>
    </div>
  );
}
```

### Step 17 — BalanceError Component

```tsx
// src/components/screens/MyBalance/BalanceError.tsx

export function BalanceError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4">
      <span className="text-[48px]">🔴</span>
      <p className="text-text-primary text-[16px] font-medium">Помилка завантаження</p>
      <button
        onClick={onRetry}
        className="px-8 h-10 bg-bg-card rounded-full text-text-primary text-[14px] font-medium"
      >
        Спробувати знову
      </button>
    </div>
  );
}
```

### Step 18 — MyBalanceScreen Root

```tsx
// src/components/screens/MyBalance/MyBalanceScreen.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import WebApp from '@twa-dev/sdk';
import { Icon } from '@iconify/react';
import { useBalancePeriodStore } from '@/stores/useBalancePeriodStore';
import { fetchWorkerBalance } from '@/services/balanceService';
import { formatPeriodLabel } from '@/utils/formatters';

export function MyBalanceScreen() {
  const { activePeriod } = useBalancePeriodStore();
  const [showInfo, setShowInfo] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['balance', activePeriod],   // period in key → auto-refetch on change
    queryFn: () => fetchWorkerBalance(activePeriod),
    staleTime: 5 * 60 * 1000,
  });

  const isNegative = !!data && data.remaining < 0;
  const isEmpty    = !!data && data.history.length === 0;

  return (
    <div
      className="flex flex-col h-full bg-bg-screen overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* HEADER — always visible */}
      <div className="flex items-center justify-between px-4 h-[68px] shrink-0">
        <div className="flex flex-col">
          <p className="text-[18px] font-semibold leading-7 text-text-primary tracking-[-0.5px]">
            Мій баланс
          </p>
          <p className="text-[12px] font-normal leading-4 text-text-secondary">
            {data ? formatPeriodLabel(activePeriod, data.periodLabel) : '…'}
          </p>
        </div>
        {/* ⓘ Info button */}
        <button
          onClick={() => setShowInfo(true)}
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
          aria-label="Інформація про баланс"
        >
          <Icon icon="solar:info-circle-bold" width={16} color="#111827" />
        </button>
      </div>

      {/* LOADING */}
      {isLoading && <BalanceSkeleton />}

      {/* ERROR */}
      {isError && <BalanceError onRetry={refetch} />}

      {/* POPULATED */}
      {!isLoading && !isError && data && (
        <div className="flex flex-col gap-4 overflow-y-auto flex-1">
          {/* Stat cards row */}
          <StatCards data={data} />

          {/* Period filter tabs */}
          <PeriodFilter />

          {/* Negative balance warning banner */}
          {isNegative && (
            <NegativeBanner deficit={Math.abs(data.remaining)} />
          )}

          {/* History section */}
          {isEmpty ? (
            <BalanceEmpty />
          ) : (
            <HistoryList items={data.history} />
          )}
        </div>
      )}

      {/* INFO POPUP */}
      {showInfo && <InfoPopup onClose={() => setShowInfo(false)} />}

      {/* BOTTOM NAVIGATION */}
      <BottomNav activeTab="balance" />
    </div>
  );
}
```

### Step 19 — Verification Gate

After implementation, verify ALL of the following before marking as done:

| Gate | Check | Command / Visual |
|------|-------|-----------------|
| **Figma Icon Check** | All icons use `@iconify/react` with IDs from `balanceIcons.ts`. No hand-drawn SVGs. | `grep -r "<svg" src/components/screens/MyBalance` → 0 results |
| **Color Token Check** | No raw hex values in component files except `balanceIcons.ts` and `StatCard.tsx` inline config | `grep -r "#[0-9a-fA-F]" src/components/screens/MyBalance` → only constants |
| **Signed Amount Format** | `formatSignedMoney(4050)` === `"+₴4,050"` | Console test |
| **Signed Amount Format** | `formatSignedMoney(-5000)` === `"−₴5,000"` (U+2212 not hyphen) | `charCodeAt(0)` === 8722 |
| **Signed Amount Format** | `formatSignedMoney(0)` === `"₴0"` | Console test |
| **Negative State** | When `remaining < 0`: Remaining amount is `#ef4444`, Warning Banner visible | Set `MOCK_BALANCE_NEGATIVE` in service |
| **Empty State** | When `history.length === 0`: history replaced by empty state, CTA navigates to W1 | Set `MOCK_BALANCE_EMPTY` in service |
| **Info Popup** | ⓘ button opens InfoPopup portal; backdrop tap closes it; BackButton closes it | Interactive test |
| **Spacing — Stat Cards** | Cards separated by `gap-4` (16px), internal padding `13px`, border-radius `20px` | DevTools ruler |
| **Spacing — History** | Item padding: `py-[12px]`, horizontal: `px-4`, last item has no border-b | Visual inspection |
| **Border Style** | Stat cards: `border` (all 4 sides, subtle). History: `border-b` only. NO left-only borders. | Code review |
| **JetBrains Mono** | Stat card amounts AND history amounts use `font-['JetBrains_Mono',sans-serif]` | Inspect rendered font |
| **Period Filter** | Selecting period updates `activePeriod` in store, triggers new React Query fetch | Toggle periods + check network |
| **Safe Area** | Root div has `paddingTop: env(safe-area-inset-top, 0px)` | Test on iOS simulator |
| **Period Persistence** | Switch to Tasks tab and back — period filter retains selected value | Manual tab switching |

---

## Verification Gate Result

> ✅ Tech Stack document passes workflow validation gate:
> - [x] Contains `## File Structure`
> - [x] Contains `## Step-by-Step Implementation`
> - [x] Contains `## TypeScript Interfaces`
> - [x] Contains `Traces to:` references
> - [x] Contains `MockData.ts`
