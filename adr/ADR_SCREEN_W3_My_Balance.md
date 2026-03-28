# ADR-W3-01: Client-Side Architecture for Worker Payroll Balance Screen

**Status**: PROPOSED

---

## Context

The "My Balance" (W3) screen is the Worker's primary payroll transparency view in the Larko Telegram Mini App. It surfaces three computed financial aggregates (Earned, Advances, Remaining) alongside a scrollable, paginated transaction history for the current billing period.

**TMA-specific constraints that drive every decision:**

- Renders inside Telegram WebView — no native APIs, limited memory budget, no background threads.
- Authenticated via Telegram `initData` — no separate login; user identity resolved from `window.Telegram.WebApp.initDataUnsafe`.
- Mobile-first, portrait layout at 360–430px viewport width.
- Network may be 3G/4G with noticeable latency — skeleton-first UX is mandatory.
- Screen is **read-only**: zero write operations. All data flows inbound from backend.

---

## Problem

How should the W3 screen manage two distinct server-state requests (balance summary + transaction history list) together with ephemeral UI-state (info popup open/closed) and company-context switching, while guaranteeing:

1. Sub-1.5 s perceived load time (skeleton before any data).
2. Correct stale-while-revalidate behaviour so returning users see cached data instantly.
3. Consistent negative-balance and empty-state rendering without ad-hoc conditionals scattered across components.
4. Monospace financial-number rendering (JetBrains Mono) with colour-coded transaction rows.

---

## Options Considered

### Option A: Redux Toolkit + RTK Query

- **Pros**: Single store for everything; RTK Query handles caching and polling.
- **Cons**: High boilerplate (slices, actions, reducers); RTK Query bundle is heavier (~14 kB gz); cache invalidation across two endpoints (summary + history) requires manual tag orchestration; W1 already established Zustand + TanStack Query as the project standard — diverging creates maintenance overhead.

### Option B: React Query + Zustand (Chosen — mirrors W1 pattern)

- **Pros**:
  - TanStack Query v5 natively manages two independent queries (`balanceSummary`, `balanceHistory`) with separate loading/error/stale states.
  - Lightweight Zustand store holds only ephemeral UI state: `isInfoPopupOpen: boolean`.
  - Identical dependency bundle to W1 — zero new packages required.
  - `useInfiniteQuery` handles paginated history (`page`, `limit`) out-of-the-box.
  - Cache persistence via `@tanstack/query-persist-client-core` satisfies the "stale data when offline" NFR.
- **Cons**: Two parallel query hooks must be coordinated at the page level (minor complexity).

---

## Decision

**Extend the existing React 18 + Vite + TanStack Query v5 + Zustand architecture established in W1.**

Specifically for W3:

- `useBalanceSummary(companyId, period)` — TanStack Query, `staleTime: 2 min`.
- `useBalanceHistory(companyId, period)` — TanStack `useInfiniteQuery`, `staleTime: 2 min`, `pageSize: 20`.
- `useBalanceStore` (Zustand) — ephemeral UI state: `isInfoPopupOpen`.
- No new routing library needed; screen is a tab within the bottom nav.

---

## Rationale

| Criterion | Justification |
|:----------|:--------------|
| **Bundle size** | Zero new packages vs W1 baseline. TMA users pay network cost once. |
| **Skeleton UX** | TanStack Query's `isLoading` flag drives skeleton display immediately on mount — satisfies ≤1.5 s perceived load NFR. |
| **Offline support** | Persisted query cache shows last-known balance instantly; staleness indicator ("Updated X ago") relies on Query's `dataUpdatedAt` timestamp. |
| **Pagination** | `useInfiniteQuery` provides `fetchNextPage` / `hasNextPage` wiring for the history list with 20 items/page — avoids loading unbounded history rows. |
| **State isolation** | Info popup open/close is pure ephemeral UI state — does not belong in server cache or URL. Zustand slice is the right scope. |
| **Consistency** | W1 already accepted this stack. W3 re-uses the same patterns, making the codebase predictable for future contributors. |

---

## Consequences

### Positive
- Unified state management pattern across W1 and W3 — lower cognitive load.
- TanStack Query's devtools work across both screens for debugging.
- Declarative loading/error/empty state handling removes conditional spaghetti.
- `useInfiniteQuery` + IntersectionObserver enables infinite-scroll history without manual paging logic.

### Negative
- Two parallel queries at mount increases waterfall risk if backend aggregates summary + history in a single endpoint later — ADR should be revisited if API merges endpoints.
- Persisted query cache may show stale negative-balance data to a Worker who has repaid an advance offline — must show "Updated [time ago]" indicator clearly.

---

## Future Considerations

- **Filter by period** (This Week / This Month / All Time) is deferred to 2nd iteration (per Figma annotation §12-Q4). When added, extend `useBalanceHistory` query key with `filter` parameter — no architectural change required.
- **Report Issue (Dispute)** entry point from W3 (§12-Q7) may require a new mutation + modal flow — revisit and create ADR-W3-02 when scope is confirmed.
- **WebSocket / SSE** real-time balance updates (e.g., advance posted by Manager) — W3 is the natural subscriber; TanStack Query's  `refetchOnWindowFocus` + invalidation on advance-posted event covers MVP; upgrade to live subscription in v2.
