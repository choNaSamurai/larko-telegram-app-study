# ADR-001: My Tasks Screen (W1) — Architecture Decisions

**Status:** PROPOSED
**Date:** 2026-03-29
**Screen:** `SCREEN_My_Tasks` (W1 — Мої Завдання)
**Traces to:** `scenario/SCREEN_My_Tasks.md`, `ba/04_BRD_Larko_MVP.md §2 Worker`

---

## ADR-001-A: Client-Side Data Fetching Strategy

### Context
The W1 screen is the **home screen** for the Worker role. It loads immediately on app open, must show data quickly on 3G networks, and needs to handle 4 screen states (loading, populated, empty, error). Workers may open the app many times per day. The TMA WebView has no persistent service worker — there is no true offline cache layer.

### Problem
How should the screen fetch and manage the task list from the backend — balancing speed, data freshness, minimal re-fetches, and clean loading/error state handling — given TMA WebView constraints?

### Options

| | **Option A: TanStack React Query** | **Option B: Native `useState` + `useEffect` + `fetch`** | **Option C: SWR** |
|---|---|---|---|
| Stale-while-revalidate | ✅ Built-in `staleTime` config | ❌ Manual only | ✅ Core feature |
| Loading / error state | ✅ `isLoading`, `isError` | ⚠️ Manual booleans | ✅ `isLoading`, `error` |
| DevTools | ✅ Excellent | ❌ None | ⚠️ Basic |
| Cache invalidation | ✅ `queryKey` + `invalidateQueries` | ❌ Full manual | ✅ `mutate()` |
| Bundle size | ⚠️ ~40KB | ✅ 0KB | ✅ ~5KB |
| Team familiarity (React) | ✅ Industry standard | ✅ Always known | ⚠️ Less common |

### Decision
**TanStack React Query (`@tanstack/react-query` v5)**

### Rationale
React Query eliminates the need for boilerplate loading/error state management — which is critical given W1 has 4 distinct states that must be rock-solid. `staleTime: 5 * 60 * 1000` (5 minutes) prevents redundant refetches when the Worker switches tabs and returns. Query invalidation after actions (e.g., tapping "Start Work") keeps data consistent. SWR would be acceptable but React Query is the stronger choice for a multi-screen app where cache invalidation will be needed across screens (e.g., Order Hub → Task List).

### Consequences
- ✅ Loading/error/empty states handled declaratively (no manual boolean juggling)
- ✅ Consistent cache strategy across all future screens
- ✅ `devtools` visibility during development
- ❌ ~40KB bundle addition — acceptable for TMA where the WebView is pre-loaded

### Future
If the app moves toward real-time task updates (WebSocket push), React Query's `queryClient.invalidateQueries` makes it trivial to trigger a refetch on push event — no architectural change needed.

---

## ADR-001-B: Client-Side UI State (Filter Tabs)

### Context
The filter tabs (`Усі`, `Нові`, `В процесі`, `Виконані`) control the visible subset of the task list. Tab counts are calculated client-side from the full API response (confirmed in Q5). The active tab selection must survive tab navigation (Worker switches to Balance, returns to Tasks — filter should persist).

### Problem
Where should the currently selected filter tab state live — local component state or a shared store?

### Options

| | **Option A: Local `useState`** | **Option B: Zustand store** | **Option C: URL query param (`?filter=new`)** |
|---|---|---|---|
| Persistence across tab nav | ❌ Resets on unmount | ✅ Persists until app closes | ✅ URL survives |
| Complexity | ✅ Minimal | ⚠️ Moderate | ⚠️ TMA URL handling complex |
| TMA-safe | ✅ Yes | ✅ Yes | ⚠️ TMA URL state is unreliable |
| Shareable state | ❌ Component-scoped | ✅ Any component | ✅ Via URL |

### Decision
**Zustand store** for filter state.

### Rationale
In the TMA WebView, bottom navigation renders each tab as a mounted/unmounted route. When a Worker switches to Balance and returns to Tasks, a local `useState` resets to "Усі" — jarring UX. Zustand's persistence across mounts solves this with ~2KB overhead. URL query params are not reliable in Telegram's WebView due to navigation model restrictions. A dedicated `useTaskFilterStore` is trivially simple and testable.

### Consequences
- ✅ Filter state survives tab switching
- ✅ Store can be extended to hold scroll position
- ❌ Minor added complexity — acceptable given clear scope

### Future
If the app adds deep-linking to specific filtered views (e.g., bot notification "You have 2 overdue tasks" → opens W1 filtered to Overdue), Zustand store can be seeded from URL params at app boot with minimal effort.

---

## ADR-001-C: Mock Data Layer (API Simulation)

### Context
The backend API is not yet available. The SA scenario defines the data shape but the exact endpoint is TBD (Q3: confirmed — use mock data for now, replace later). The mock must faithfully represent the full range of card variants: New, In Progress, Overdue, Checking, Dispute — including both price formats (₴12,400 fixed; ₴400/шт per-unit).

### Problem
How to implement the data layer so the UI is decoupled from the real API and the mock can be swapped cleanly later?

### Options

| | **Option A: Static `MockData.ts` file** | **Option B: MSW (Mock Service Worker)** | **Option C: JSON Server** |
|---|---|---|---|
| Setup complexity | ✅ Zero | ⚠️ Moderate (requires SW registration) | ⚠️ Separate process |
| TMA WebView compatible | ✅ Yes | ⚠️ SW in WebView unreliable | ❌ Requires network |
| Swap to real API | ✅ Change single import | ✅ Change one handler | ⚠️ Update fetch URLs |
| Realistic latency | ❌ None (manual delay) | ✅ Built-in | ✅ Built-in |

### Decision
**Static `MockData.ts` + service module abstraction (`src/services/tasksService.ts`)**.

### Rationale
MSW's Service Worker registration is unreliable inside Telegram's WebView (known limitation). Static mock data with a 500ms simulated delay (`await new Promise(r => setTimeout(r, 500))`) provides the loading skeleton UX without infrastructure overhead. The key architectural discipline: **ALL data access goes through `tasksService.ts`** — the React Query `queryFn` calls the service, not `fetch()` directly. When the real API is ready, only `tasksService.ts` changes; all UI code stays identical.

### Consequences
- ✅ No infrastructure required — works in TMA WebView immediately
- ✅ Clean service boundary — real API swap is a one-file change
- ✅ Mock faithfully covers all card variants for UI testing
- ❌ No network-layer testing — acceptable at MVP

### Future
When backend is ready: replace `MockData.ts` with real `fetch('/api/tasks', ...)` inside `tasksService.ts`. React Query handles retries, caching, and error transformation automatically.

---

## ADR-001-D: Navigation to Google Maps (Route Icon)

### Context
The `solar:route-bold` icon on each task card opens navigation to the task's address. The answer to Q4 confirmed: external Google Maps.

### Problem
How to open Google Maps from within a Telegram WebView without breaking the TMA session?

### Decision
Use `Telegram.WebApp.openLink(googleMapsUrl)` — the official TMA API for opening external URLs. This opens Google Maps in the device's default browser or Maps app while keeping the TMA session active.

### Rationale
Direct `window.open()` calls inside TMA WebViews are unreliable cross-platform (iOS vs Android). `Telegram.WebApp.openLink()` is the documented, safe API. Format: `https://maps.google.com/?q=<address>` — universal across platforms.

### Consequences
- ✅ Works reliably on both iOS and Android TMA
- ✅ TMA session preserved
- ❌ User must return manually from Maps app — acceptable UX for MVP

---

*End of ADR-001. Reviewed against: `scenario/SCREEN_My_Tasks.md` v1.0*
