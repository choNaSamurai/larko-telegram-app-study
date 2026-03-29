# ADR-002: My Balance Screen (W3) — Architecture Decisions

**Status:** PROPOSED
**Date:** 2026-03-29
**Screen:** `SCREEN_My_Balance` (W3 — Мій баланс)
**Traces to:** `scenario/SCREEN_My_Balance.md`, `ba/04_BRD_Larko_MVP.md §2 Worker — My Balance`

---

## ADR-002-A: Client-Side Data Fetching Strategy

### Context
W3 is the second bottom-nav tab. As a **pure read-only screen** the Worker visits frequently throughout the day, balance data must be available near-instantly without redundant API calls. The screen covers 7 distinct states (Loading → Default / Negative / Empty / InfoPopup — plus Error and Offline) driven from a single API response. Balance data changes only when the Manager issues an advance or when a new order is closed — both are rare events relative to screen visits.

### Problem
How to fetch the balance snapshot and history list while minimising load time and API calls, given TMA WebView has no service worker and the screen is visited frequently?

### Options

| | **Option A: TanStack React Query** | **Option B: Native `useState` + `useEffect`** | **Option C: SWR** |
|---|---|---|---|
| Stale-while-revalidate | ✅ `staleTime` config | ❌ Manual only | ✅ Core feature |
| Loading / error state | ✅ `isLoading`, `isError` | ⚠️ Manual booleans | ✅ Built-in |
| Cache across tab nav | ✅ `queryKey` persistent | ❌ Resets on unmount | ✅ Key-based |
| Consistency with W1 | ✅ Already in project | ❌ Diverges | ⚠️ Additional dep |
| Bundle size | ⚠️ ~40KB (already paid) | ✅ 0KB | ✅ ~5KB |

### Decision
**TanStack React Query (`@tanstack/react-query` v5)** — same as W1.

### Rationale
React Query is **already in the project** from W1 (ADR-001-A). Adding a second query key `['balance']` with `staleTime: 5 * 60 * 1000` costs zero extra bundle. The 5-minute stale window is appropriate: balance changes at most a few times per day. `queryClient.invalidateQueries({ queryKey: ['balance'] })` will be used in the future when an advance notification arrives (Telegram push → refetch). Loading/error states are handled declaratively with zero boilerplate.

### Consequences
- ✅ Buffer-free loading: cached data renders instantly on tab revisit (< 5 min after first load)
- ✅ Consistent cache strategy — no second HTTP library in project
- ✅ Error + retry handled by existing `QueryClientProvider` defaults
- ❌ No new consequences — bundle cost already paid by W1

### Future
When Telegram bot pushes an advance notification to the Worker, the app can call `queryClient.invalidateQueries({ queryKey: ['balance'] })` on notification receipt to auto-refresh the balance without screen reload.

---

## ADR-002-B: Period Filter State (This Week / This Month / All Time)

### Context
The SA scenario (OQ-W3-01, answered by stakeholder) confirms a **period filter** (`This Week / This Month / All Time`) must be implemented, matching BRD §2. The Figma currently only shows the default "Березень 2026" view — filter tabs are a confirmed addition. The selected period controls: the subtitle under the title, which history items appear, and what totals the stat cards display. The selected period must persist when the Worker switches away and returns.

### Problem
Where should the selected period state live — local component state, URL params, or a shared Zustand store?

### Options

| | **Option A: Local `useState`** | **Option B: Zustand store** | **Option C: URL query param** |
|---|---|---|---|
| Persists across tab nav | ❌ Resets on unmount | ✅ Persists until app closes | ⚠️ TMA URL unreliable |
| Complexity | ✅ Minimal | ✅ Minimal (reuse pattern) | ⚠️ Complex in WebView |
| Consistent with W1 | ❌ No | ✅ Same pattern as filter store | ❌ No |

### Decision
**Zustand store**: `useBalancePeriodStore`.

### Rationale
Identical rationale to ADR-001-B: Zustand is already in the project, the Worker should not lose their selected period when switching tabs. The store is trivially simple — one `period: 'week' | 'month' | 'all'` field + setter. Since period drives a new API call (different query params), the `period` value is included in the React Query `queryKey: ['balance', period]` — a period change invalidates the cache and triggers a fresh fetch automatically.

### Consequences
- ✅ Period selection survives tab switching
- ✅ React Query re-fetches automatically when `queryKey` changes (period included in key)
- ✅ Default period is `'month'` (current calendar month) matching Figma design
- ❌ Minor store added — negligible

---

## ADR-002-C: Icon Rendering Strategy

### Context
The Figma design context for W3 generated SVG vector paths bundled as `<img src="http://localhost:3845/assets/...">` — there are **no Iconify `data-name` attributes** on this screen's icons. All icons (arrow-up, arrow-down, clock, warning, info) are SVG variants of a custom `Component1` / `Component2` design system element.

### Problem
Should we:
- (A) Extract and bundle the SVG paths as inline SVG components or static assets, OR
- (B) Map to existing `@iconify/react` icon IDs that visually match, OR
- (C) Mix: emojis as spans, all others via Iconify

### Options

| | **Option A: Extract SVG assets** | **Option B: Iconify equivalents** | **Option C: Mix (Iconify + emojis)** |
|---|---|---|---|
| Pixel-perfect Figma match | ✅ Exact | ⚠️ Near-match | ⚠️ Near-match |
| Maintainability | ⚠️ Binary SVG files in repo | ✅ No assets needed | ✅ No assets needed |
| Bundle size | ⚠️ Extra files | ✅ Tree-shaken via Iconify | ✅ Minimal |
| Consistency with W1 | ❌ W1 uses Iconify | ✅ Same pattern | ✅ Same pattern |
| Iconify ID available | N/A | ✅ `solar:*` set matches | ✅ `solar:*` set matches |

### Decision
**Option C — Iconify + emojis.** All SVG icons mapped to `@iconify/react` using the `solar:*` and `mdi:*` sets. Emoji icons (💰, 📊) rendered as `<span>` elements.

### Rationale
`@iconify/react` is already installed. The Figma icons (up-arrow, down-arrow, clock, warning triangle, info) are generic design-system primitives — the `solar:*` bold set provides visually equivalent matches (same visual weight as Figma's design system). Extracting raw SVG asset files from the Figma MCP localhost server would create fragile build-time dependencies on a local dev tool. Using emojis for 💰 and 📊 is correct — they are intentional emoji choices in the Figma design, not icon system elements.

### Consequences
- ✅ No binary SVG assets in repository
- ✅ `@iconify/react` already in `node_modules` — zero new dependencies
- ✅ Icons scale correctly with font-size
- ⚠️ 1-2% visual deviation from Figma pixel-perfect — acceptable for MVP

### Icon Mapping (authoritative):
| Role | `@iconify/react` ID | Size | Badge bg |
|---|---|---|---|
| Earned (stat card + history) | `solar:arrow-up-bold` | 12px / 14px | `rgba(52,211,153,0.15)` |
| Advance (stat card + history) | `solar:arrow-down-bold` | 12px / 14px | `rgba(96,165,250,0.15)` |
| Overtime (history) | `solar:clock-circle-bold` | 14px | `rgba(251,191,36,0.15)` |
| Warning (negative banner) | `solar:danger-triangle-bold` | 18px | amber bg |
| Info (ⓘ button) | `solar:info-circle-bold` | 16px | white circle |
| Remaining icon | 💰 emoji span | 16px | `rgba(255,255,255,0.1)` |
| Empty state | 📊 emoji span | 48px | — |

---

## ADR-002-D: Info Popup Rendering

### Context
The ⓘ button in the header opens a "Розрахунок балансу" popup that overlays the screen with an explanation card. This is a simple one-way informational overlay — no state changes, no forms, just explanation text. It should dismiss on tap-outside or back gesture.

### Problem
Should this be implemented as a React portal modal, an inline conditional render, or a bottom sheet library component?

### Options

| | **Option A: Inline conditional render** | **Option B: React Portal + backdrop** | **Option C: Bottom sheet library** |
|---|---|---|---|
| Implementation complexity | ✅ Minimal | ⚠️ Moderate | ⚠️ Library overhead |
| Positioning flexibility | ⚠️ Flow-dependent | ✅ Full viewport control | ✅ Full viewport |
| Backdrop tap-to-dismiss | ⚠️ Manual | ✅ Standard backdrop div | ✅ Built-in |
| Consistent with Figma | ✅ Centered card | ✅ Centered card | ⚠️ Bottom sheet UX |
| TMA WebView safe | ✅ Yes | ✅ Yes | ⚠️ Some libs have issues |

### Decision
**Option B: React Portal + fixed backdrop**.

### Rationale
The Info Popup appears over the full screen (above stat cards and below header), which requires `position: fixed` — an inline `if (showPopup)` inside the scroll container won't cover the stat cards correctly. A `ReactDOM.createPortal()` into `document.body` with a fixed semi-transparent backdrop gives correct layering with minimal complexity. No library needed — the popup has no animation requirements beyond simple opacity fade.

### Consequences
- ✅ Correct layering over all content
- ✅ Backdrop tap dismisses the popup
- ✅ TMA back button (`WebApp.BackButton`) can also dismiss it
- ❌ Slightly more code than inline — justified by correctness

---

*End of ADR-002. Reviewed against: `scenario/SCREEN_My_Balance.md` v1.0*
