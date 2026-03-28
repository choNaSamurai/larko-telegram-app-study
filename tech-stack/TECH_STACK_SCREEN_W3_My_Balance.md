# Tech Stack Specification: SCREEN_W3_My_Balance

## Overview

Technical blueprint for implementing the "My Balance" payroll transparency screen (W3) for Worker-role users. The screen is **read-only** — it fetches, displays, and navigates but performs no writes. Focus areas: dual-query orchestration, paginated transaction history with infinite scroll, negative-balance visual signalling, and offline-capable caching.

---

## Figma Designs

- **Screen (Populated — Positive)**: [W3-screen-populated](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=83-6570&m=dev)
- **Loading State**: [W3-loading-dark (87:7528)](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=87-7528&m=dev), [W3-loading-light (87:7493)](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=87-7493&m=dev)
- **Empty State**: node `73:53215` within main W3 canvas (see §UI Elements in scenario)
- **Error State**: [W3-error-dark (85:7292)](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=85-7292&m=dev), [W3-error-light (85:7286)](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=85-7286&m=dev)
- **Negative Balance State**: node `73:53369` (dark) / `73:53486` (light) Warning Banner
- **Info Popup**: node `73:53569` (dark) / `73:53671` (light)

---

## Core Stack

| Layer | Technology | Rationale |
|:------|:-----------|:----------|
| **Frontend** | React 18 + Vite | Project standard (W1 baseline) |
| **Server State** | TanStack Query v5 | Separate queries for summary + history; `useInfiniteQuery` for pagination |
| **Client / UI State** | Zustand | Ephemeral: `isInfoPopupOpen`, `isWarningVisible` |
| **TMA Integration** | `@telegram-apps/sdk-react` | Auth, theme, back-button |
| **Styling** | Tailwind CSS + CSS variables | Dark/light theme via `--tg-theme-*` + custom design tokens |
| **Typography** | JetBrains Mono Bold (financial amounts), Inter (all labels) | Monospace alignment for currency; see NFR §11 |
| **Icons** | Lucide React | Arrow-up (earnings), Arrow-down (advances), Clock (overtime), Warning/AlertTriangle |
| **HTTP** | Axios (shared instance from W1) | Auth interceptors already wired |
| **Infinite Scroll** | IntersectionObserver (native) + `useInfiniteQuery` | No additional library; fires `fetchNextPage` at scroll boundary |

---

## Step-by-Step Implementation

### Phase 1 — Domain Types & API Contracts

- [ ] Add `TransactionType` union: `'earning' | 'advance' | 'overtime' | 'adjustment'`
- [ ] Define `BalanceSummary` interface matching `GET /balance/summary` response
- [ ] Define `TransactionItem` interface matching `GET /balance/history` response items
- [ ] Define `BalanceHistoryPage` (wraps `items: TransactionItem[]` + `total: number` for TanStack infinite query)
- [ ] Add `period` computed helper: `currentPeriod(): string` → `"YYYY-MM"` using `date-fns/format`

```typescript
export type TransactionType = 'earning' | 'advance' | 'overtime' | 'adjustment';

export interface BalanceSummary {
  earned: number;
  advances: number;
  remaining: number;
  currency: string; // e.g. "UAH"
}

export interface TransactionItem {
  id: string;
  date: string;          // ISO 8601
  type: TransactionType;
  orderName?: string;    // present for 'earning' | 'overtime'
  hours?: number;        // worked hours (earning / overtime)
  multiplier?: number;   // overtime only, e.g. 1.5
  amount: number;        // always positive magnitude; sign derived from type
}

export interface BalanceHistoryPage {
  items: TransactionItem[];
  total: number;
}

// GET /balance/summary
export interface GetBalanceSummaryRequest {
  workerId: string;
  companyId: string;
  period: string; // "YYYY-MM"
}

// GET /balance/history
export interface GetBalanceHistoryRequest {
  workerId: string;
  companyId: string;
  period: string;
  page?: number;
  limit?: number; // default: 20
}
```

---

### Phase 2 — Data Layer (TanStack Query Hooks)

- [ ] **`useBalanceSummary(companyId, period)`**
  - Query key: `['balance', 'summary', companyId, period]`
  - Fetches `GET /balance/summary`
  - `staleTime: 2 * 60 * 1000` (2 min)
  - Returns `{ data: BalanceSummary | undefined, isLoading, isError, refetch }`

- [ ] **`useBalanceHistory(companyId, period)`**
  - `useInfiniteQuery` with query key: `['balance', 'history', companyId, period]`
  - `pageSize = 20`; `getNextPageParam = (lastPage, pages) => lastPage.items.length === 20 ? pages.length : undefined`
  - Fetches `GET /balance/history?page=N&limit=20`
  - `staleTime: 2 * 60 * 1000`
  - Flattens pages on the consumer side: `pages.flatMap(p => p.items)`

- [ ] Persist both queries with `@tanstack/query-persist-client-core` (LocalStorage key: `larko-balance-cache`). Satisfies offline NFR — show stale data with `dataUpdatedAt` indicator.

---

### Phase 3 — Zustand Store

- [ ] Create `useBalanceStore` with:

```typescript
interface BalanceStore {
  isInfoPopupOpen: boolean;
  openInfoPopup: () => void;
  closeInfoPopup: () => void;
}
```

- No persistence needed — popup state resets on remount intentionally.

---

### Phase 4 — Component Architecture

```
src/screens/MyBalance/
├── MyBalance.screen.tsx          ← screen root; orchestrates queries + store
├── components/
│   ├── BalanceHeader.tsx         ← title "Мій баланс" + period subtitle + ⓘ button
│   ├── StatCards/
│   │   ├── StatCards.tsx         ← 3-card horizontal row
│   │   ├── EarnedCard.tsx        ← green icon + amount (#34d399)
│   │   ├── AdvancesCard.tsx      ← blue icon + amount (#60a5fa)
│   │   └── RemainingCard.tsx     ← neutral/red card; switches variant on negative
│   ├── WarningBanner.tsx         ← visible only when remaining < 0
│   ├── InfoPopup.tsx             ← overlay with 3 explanation rows
│   ├── TransactionHistory/
│   │   ├── TransactionHistory.tsx  ← section header + list + sentinel ref
│   │   ├── TransactionRow.tsx      ← polymorphic row; switches icon/colour by type
│   │   └── TransactionSkeleton.tsx ← shimmer row placeholder
│   ├── BalanceSkeleton.tsx       ← full-screen shimmer (header + cards + rows)
│   ├── BalanceEmptyState.tsx     ← 📊 + heading + CTA → W1
│   └── BalanceError.tsx          ← error illustration + "Спробувати знову" button
```

**Key component rules:**

- `RemainingCard` accepts `variant: 'positive' | 'negative'` prop — switches between coin icon (positive) and red warning icon (negative), bg tint, and amount colour.
- `TransactionRow` accepts `type: TransactionType` and derives:
  - Icon background: green (earning), blue (advance), amber (overtime), grey (adjustment)
  - Amount prefix: `+` (earning, overtime, positive adjustment) | `−` (advance, negative adjustment)
  - Amount colour: `#34d399` (earning), `#60a5fa` (advance), `#fbbf24` (overtime)
  - Sub-label: `"${date} · ${hours} год"` for earning/overtime; `date` only for advance; — for adjustment.
- All monetary amounts rendered with `font-family: 'JetBrains Mono', monospace` and `font-weight: 700`.
- Text truncation for long order names: `truncate` (Tailwind: `overflow-hidden text-ellipsis whitespace-nowrap`).

---

### Phase 5 — Screen State Machine

Implement a derived `screenState` computed from query statuses:

```typescript
type BalanceScreenState =
  | 'loading'
  | 'error'
  | 'empty'
  | 'populated_positive'
  | 'populated_negative';

function deriveScreenState(
  summaryQuery: UseQueryResult<BalanceSummary>,
  historyQuery: UseInfiniteQueryResult<BalanceHistoryPage>
): BalanceScreenState {
  if (summaryQuery.isLoading || historyQuery.isLoading) return 'loading';
  if (summaryQuery.isError || historyQuery.isError) return 'error';
  if (!summaryQuery.data || summaryQuery.data.earned === 0 && historyQuery.data?.pages[0]?.items.length === 0) return 'empty';
  if (summaryQuery.data.remaining < 0) return 'populated_negative';
  return 'populated_positive';
}
```

Screen renders one of: `<BalanceSkeleton>`, `<BalanceError>`, `<BalanceEmptyState>`, or populated layout (with/without `<WarningBanner>`).

---

### Phase 6 — Infinite Scroll & Pagination

- [ ] Attach `ref` (via `useRef`) to a sentinel `<div>` at the bottom of `TransactionHistory`.
- [ ] Use `useEffect` + `IntersectionObserver` to call `fetchNextPage()` when sentinel enters viewport.
- [ ] Show `<TransactionSkeleton>` rows while `isFetchingNextPage === true`.
- [ ] When `!hasNextPage`: show "Усі операції завантажено" text in muted colour — no further fetches.

---

### Phase 7 — Info Popup

- [ ] `InfoPopup` renders as an absolute-positioned overlay card (358×327px, `rounded-2xl`, `bg-bg-card`).
- [ ] Dismissal: tap outside (click on backdrop `<div>` with `onClick={closeInfoPopup}`) or scroll.
- [ ] Scroll dismiss: attach `onScroll` on the page container → call `closeInfoPopup()` when scroll delta > 10px.
- [ ] `isInfoPopupOpen` controls via Zustand.

---

### Phase 8 — Offline & Stale Data Indicator

- [ ] Read `summaryQuery.dataUpdatedAt` (timestamp in ms).
- [ ] If `!navigator.onLine` or data was fetched > 5 minutes ago: render `<OfflineBadge updatedAt={summaryQuery.dataUpdatedAt} />` below the period subtitle in `BalanceHeader`.
- [ ] Format: `"Оновлено {X} хв тому"` using `date-fns/formatDistanceToNow`.

---

### Phase 9 — Styling & Design Tokens

```css
/* W3-specific tokens (extend global theme) */
--color-earned:       #34d399;   /* Tailwind: text-emerald-400 */
--color-advances:     #60a5fa;   /* Tailwind: text-blue-400    */
--color-overtime:     #fbbf24;   /* Tailwind: text-amber-400   */
--color-negative:     #f87171;   /* Tailwind: text-red-400     */
--color-amount-text:  #ededed;   /* Tailwind: text-neutral-200 */
--font-mono:          'JetBrains Mono', monospace;
```

Dark theme card: `bg-[#2d2d31]` | Light theme card: `bg-white` (follow `--tg-theme-secondary-bg-color`).

---

## TypeScript Interfaces (Full Reference)

```typescript
// Extends project-wide types; add to src/types/balance.ts

export type TransactionType = 'earning' | 'advance' | 'overtime' | 'adjustment';
export type BalanceScreenState = 'loading' | 'error' | 'empty' | 'populated_positive' | 'populated_negative';

export interface BalanceSummary {
  earned: number;
  advances: number;
  remaining: number;
  currency: string;
}

export interface TransactionItem {
  id: string;
  date: string;
  type: TransactionType;
  orderName?: string;
  hours?: number;
  multiplier?: number;
  amount: number;
}

export interface BalanceHistoryPage {
  items: TransactionItem[];
  total: number;
}
```

---

## External Dependencies

| Package | Already in W1? | Purpose |
|:--------|:--------------|:--------|
| `@tanstack/react-query` | ✅ | `useQuery` + `useInfiniteQuery` |
| `zustand` | ✅ | `useBalanceStore` |
| `axios` | ✅ | HTTP client |
| `date-fns` | ✅ | `currentPeriod()`, `formatDistanceToNow()` |
| `@telegram-apps/sdk-react` | ✅ | initData, theme |
| `lucide-react` | ✅ | Arrow-up, Arrow-down, Clock, AlertTriangle, Info icons |

> **Zero new packages required.** W3 fully reuses the W1 dependency footprint.

---

## Developer Notes

- **Monospace alignment**: Wrap every amount in `<span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>`. Do not use Tailwind's `font-mono` (it maps to a different stack).
- **Currency symbol**: Always read `currency` from `BalanceSummary`. Default `₴` for UAH. Do not hard-code.
- **Rate locking (BRD §2)**: History rows show the rate **at the time of order creation** — no client-side recalculation. Display `amount` from API as-is.
- **Negative sign convention**: `amount` in API response is always a positive magnitude. The client determines sign display:
  - `earning` / `overtime` / positive `adjustment` → `+₴{amount}`
  - `advance` / negative `adjustment` → `−₴{amount}`
- **Plan gating (Q1)**: Until resolved, render `AdvancesCard` with `₴0` and no lock UI. Do not hide the card.
- **Period scope (Q2)**: Use calendar month (`YYYY-MM`) derived from `new Date()`. Hard-code period in query until backend confirms definition.
- **Accessibility**: All tappable targets ≥ 44×44px. Stat cards must include `aria-label` with full readable text (e.g., `"Зароблено: 18 450 гривень"`).

---

## Improvement Proposals (PENDING APPROVAL)

> The following improvements are proposed but **not included** in the current spec. User approval required before implementation.

1. **Optimistic period caching**: Pre-fetch next month's balance summary on idle (low-priority background request) so switching period feels instant.
2. **Shimmer height matching**: Make skeleton row heights equal to actual `TransactionRow` rendered heights (measure on first render) to prevent layout shift after hydration.
3. **Type-specific filter pills on history**: Even though full period filter is 2nd iteration, a simple `All | Earnings | Advances` pill filter on the history list is purely client-side and adds significant navigability with zero API changes.
4. **Amount animation**: Animate stat card numbers counting up from `0` to final value on first successful load (using `requestAnimationFrame`) to draw attention to key figures — consistent with "Premium Intelligence" design philosophy.
5. **Dispute entry point (Q7)**: Add a subtle `⚠️ Повідомити про проблему` text link below the history header, hidden by default behind a long-press on any transaction row, pending stakeholder confirmation.
