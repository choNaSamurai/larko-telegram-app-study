# ADR-003: Profile, Time Off & Leave Form Screens (W4/W5/W6) — Architecture Decisions

**Status:** PROPOSED  
**Date:** 2026-03-29  
**Screens:** `SCREEN_Profile` (W4), `SCREEN_TimeOff` (W5), `SCREEN_LeaveForm` (W6)  
**Traces to:** `scenario/SCREEN_Profile.md`, `scenario/SCREEN_TimeOff.md`, `scenario/SCREEN_LeaveForm.md`, `ba/04_BRD_Larko_MVP.md §2 Worker — Profile, My Absences`

---

## ADR-003-A: Data Fetching Strategy

### Context
W4/W5/W6 involve three related data domains:
- **W4 Profile:** User identity data (`GET /users/me`) — fetched once, very rarely changes.
- **W5 TimeOff:** Leave request list (`GET /leave-requests`) + calendar markers (`GET /leave-calendar?month=YYYY-MM`) — changes when manager approves/rejects.
- **W6 LeaveForm:** Leave type dropdown (`GET /leave-types`) — static/near-static config data + `POST /leave-requests` mutation.

All three screens are part of the same authenticated session where TanStack React Query is already established (W1, W2, W3).

### Problem
How to manage multiple related queries (profile + leave requests + leave calendar) with appropriate cache strategies, given W5 and W6 are accessed sequentially and share mutation side-effects?

### Options

| | **Option A: TanStack React Query** | **Option B: useState + useEffect** | **Option C: Simple SWR** |
|---|---|---|---|
| Cache across tab nav | ✅ `queryKey` persistent | ❌ Resets on unmount | ✅ Key-based |
| Mutation + cache invalidation | ✅ `useMutation` + `invalidateQueries` | ⚠️ Manual reset | ⚠️ `mutate` built-in |
| Consistency with W1-W3 | ✅ Already in project | ❌ Diverges | ⚠️ New dependency |
| Stale-while-revalidate | ✅ `staleTime` config | ❌ Manual | ✅ Core feature |

### Decision
**TanStack React Query v5** — consistent with W1/W2/W3.

### Query Key Strategy
| Query | Key | staleTime |
|---|---|---|
| User profile | `['profile']` | `10 * 60 * 1000` (10 min) |
| Leave requests | `['leave-requests']` | `2 * 60 * 1000` (2 min) |
| Leave calendar | `['leave-calendar', yearMonth]` | `5 * 60 * 1000` (5 min) |
| Leave types | `['leave-types']` | `60 * 60 * 1000` (1 hour — config data) |

### Mutation Side-effect
After `POST /leave-requests` succeeds in W6:
- `queryClient.invalidateQueries({ queryKey: ['leave-requests'] })` — refresh W5 list
- `queryClient.invalidateQueries({ queryKey: ['leave-calendar'] })` — refresh W5 calendar dots

### Consequences
- ✅ Profile caches for 10 min — zero re-fetch on tab return
- ✅ W6 mutation auto-refreshes W5 list upon navigation back
- ✅ Zero new dependencies — bundle cost already paid by W1-W3

---

## ADR-003-B: User Preferences State (Language + Theme)

### Context
The Profile screen (W4) has two toggle controls:
- **Language:** `uk` (Українська) | `en` (English) — changes all UI labels
- **Theme:** `dark` | `light` — changes CSS color scheme

Both preferences need to:
1. Update instantly in the UI (optimistic toggle — < 100ms visual response)
2. Persist to backend asynchronously (`PATCH /users/me`)
3. Survive tab switching (not reset on screen unmount)
4. Be initialized from Telegram WebApp color scheme (theme) or user's saved preference (language)

### Problem
Where should language and theme state live — local component state, Zustand store, or React Context?

### Options

| | **Option A: Local `useState`** | **Option B: Zustand store** | **Option C: React Context** |
|---|---|---|---|
| Persists across tab nav | ❌ Resets | ✅ Survives tab switch | ✅ Survives (if wrapped at root) |
| Global CSS theme application | ❌ Component-scoped | ✅ Can drive root class | ✅ Can drive root class |
| Consistent with W1-W3 | ❌ No | ✅ Same pattern | ⚠️ Different pattern |
| Complexity | ✅ Minimal | ✅ Minimal | ⚠️ Provider hierarchy |

### Decision
**Zustand store**: `useUserPreferencesStore`.

### Rationale
A single Zustand store for `{ language, theme }` is the minimal, consistent solution. The store drives:
- A `data-theme="dark|light"` attribute on `<html>` (applied in store's `setTheme` setter)
- An i18n context (future) that reads `language` from the store
- The UI toggle states in W4 — no prop drilling required

Preferences are initialized from:
1. `localStorage` (persisted via `zustand/middleware.persist`)
2. Fallback: `Telegram.WebApp.colorScheme` for theme; `'uk'` for language

### Consequences
- ✅ `< 100ms` visual toggle — Zustand setter is synchronous
- ✅ `PATCH /users/me` fires in background (fire-and-forget), reverts on error
- ✅ Theme is applied globally without re-render of all components (CSS class)
- ❌ Requires one new store — minimal added complexity

---

## ADR-003-C: Calendar Rendering Strategy (W5 Mini Calendar)

### Context
W5 requires an interactive mini calendar (month view) with:
- Month navigation (‹ / ›)
- Day grid (7 columns × up to 6 rows)
- Today's date highlighted (white pill)
- Days with absence requests marked with colored 4px dots (`#fbbf24` pending, `#34d399` approved)
- Previous/next month overflow days shown in muted color (`#878787`)

The Figma shows a custom calendar with absolute positioning of day cells within a 290px-high card.

### Problem
Should we use a third-party calendar library, or build a custom calendar component?

### Options

| | **Option A: Third-party library (react-calendar, etc.)** | **Option B: Custom calendar component** |
|---|---|---|
| Bundle size | ⚠️ +20-60KB | ✅ ~150 lines |
| Styling flexibility for TMA dark theme | ⚠️ CSS override required | ✅ Full control |
| Absence dot integration | ⚠️ Requires deep customization | ✅ Native prop support |
| Timeline risk | ✅ None | ✅ Minimal |
| Pixel-perfect match | ⚠️ Difficult | ✅ Exact match |

### Decision
**Option B: Custom `MiniCalendar` component** — handwritten in ~100-150 lines.

### Rationale
This calendar is not interactive in a complex way (no date range selection, no multi-select). It renders a static grid for the current month with 3 pieces of state: `displayedYearMonth`, `today` (for highlighting), and `absenceDots` (from W5 data). A custom implementation achieves pixel-perfect Figma match vs. the complex CSS override needed for a third-party library, and adds zero dependency.

### Calendar Algorithm
```typescript
function buildCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month - 1, 1);
  const startDow = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  
  const days: CalendarDay[] = [];
  // Fill leading prev-month days
  for (let d = startDow; d > 0; d--) {
    days.push({ date: prevMonthDays - d + 1, isCurrentMonth: false });
  }
  // Fill current month days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: d, isCurrentMonth: true });
  }
  // Fill trailing next-month days (always up to 42 = 6 rows)
  let next = 1;
  while (days.length < 42) {
    days.push({ date: next++, isCurrentMonth: false });
  }
  return days;
}
```

### Consequences
- ✅ Pixel-perfect 7-col grid matching Figma (gap 4px, cell height 28px, total h ~272px with header)
- ✅ Absence dots driven by a `Map<string, 'pending' | 'approved'>` prop
- ✅ Zero new dependencies
- ❌ Manual month arithmetic (well-understood problem, no risk)

---

## ADR-003-D: Leave Form Validation Strategy (W6)

### Context
W6 has 3 validation rules:
1. Absence Type is required
2. Start Date is required and must not be in the past
3. End Date is required and must be ≥ Start Date

The validation must show inline errors on individual fields AND a summary banner below the form. Submit must be prevented when invalid. The form has optimistic state (duration auto-calculated as user fills dates).

### Problem
Should we use a form library (react-hook-form, formik) or implement manual validation?

### Options

| | **Option A: react-hook-form** | **Option B: Formik** | **Option C: Manual validation** |
|---|---|---|---|
| Bundle size | ✅ ~8KB | ⚠️ ~15KB | ✅ 0KB |
| Simple 3-field form fit | ⚠️ Overkill | ⚠️ Overkill | ✅ Exact fit |
| Consistency with W1-W3 | ⚠️ Not used in project | ❌ Not used | ✅ Pattern matches |
| Field error display control | ⚠️ Requires integration | ⚠️ Requires integration | ✅ Full control |

### Decision
**Option C: Manual validation** — `useLeaveFormStore` (Zustand slice for W6 form state).

### Rationale
W6 has exactly 4 fields (Type, StartDate, EndDate, Reason) with 3 validation rules. A react-hook-form integration would add a new dependency and boilerplate for what is fundamentally a `isValid = (type && start && end && end >= start && !isPast(start))` check. Manual validation in a Zustand store keeps the pattern consistent with W1-W3 and gives full control over error display and the submit-disabled logic.

### Form State Shape
```typescript
interface LeaveFormState {
  typeId: string | null;
  startDate: string | null;   // ISO 'YYYY-MM-DD'
  endDate: string | null;     // ISO 'YYYY-MM-DD'
  reason: string;
  errors: { type?: string; startDate?: string; endDate?: string };
  isSubmitting: boolean;
  isSuccess: boolean;
}
```

### Consequences
- ✅ Zero new dependencies
- ✅ Duration auto-calculated reactively from `startDate` + `endDate`
- ✅ Submit button disabled state driven cleanly from `isSubmitting || !isValid`
- ✅ Error state reverts optimistically on PATCH failure (preference toggles) or persists on POST failure (form)

---

## ADR-003-E: Icon Rendering Strategy

### Context
W4 Profile screen has icons with specific `data-name` attributes in Figma:
- `material-symbols:style-outline` — Theme row icon (exact Iconify ID)
- `fluent-mdl2:clear-night` — Dark theme chip icon (exact Iconify ID)
- `si:clear-day-line` — Light theme chip icon (exact Iconify ID)
- Calendar/Globe/Question icons — custom SVG components in Figma (no Iconify data-name)

W5 TimeOff and W6 LeaveForm use custom SVG arrow and chevron components.

### Decision
**Mixed strategy:**
- Exact Iconify IDs from `data-name` → use directly: `material-symbols:style-outline`, `fluent-mdl2:clear-night`, `si:clear-day-line`
- Custom SVG components (arrows, chevrons, calendar) → map to closest Iconify equivalents from `solar:*` set

### Icon Mapping (Authoritative)

| Role | Figma data-name | `@iconify/react` ID | Size |
|---|---|---|---|
| Theme icon | `material-symbols:style-outline` | `material-symbols:style-outline` | 16px |
| Dark mode chip | `fluent-mdl2:clear-night` | `fluent-mdl2:clear-night` | 16px |
| Light mode chip | `si:clear-day-line` | `si:clear-day-line` | 16px |
| Back button | Custom SVG | `solar:arrow-left-bold` | 18px |
| Calendar nav prev | Custom SVG | `solar:alt-arrow-left-bold` | 18px |
| Calendar nav next | Custom SVG | `solar:alt-arrow-right-bold` | 18px |
| Time Off row icon | Custom SVG (calendar-like) | `solar:calendar-bold` | 16px |
| Language row icon | Custom SVG (globe-like) | `heroicons:globe-alt` | 16px |
| Support row icon | Custom SVG (question) | `solar:question-circle-bold` | 16px |
| Row chevron (right) | Custom SVG | `solar:alt-arrow-right-bold` | 18px |
| Type dropdown chevron | Custom SVG (variant 2) | `solar:alt-arrow-down-bold` | 16px |
| Date field calendar | Custom SVG (variant 3) | `solar:calendar-bold` | 16px |
| Duration info icon | Custom SVG (variant 1) | `solar:info-circle-bold` | 16px |
| Error warning icon | Custom SVG | `solar:danger-triangle-bold` | 16px |

### Consequences
- ✅ 3 exact Iconify IDs from Figma used directly — pixel-perfect match
- ✅ All others use established `solar:*` set — consistent visual weight
- ✅ Zero new icon libraries needed

---

## ADR-003-F: Navigation & BackButton (TMA-Specific)

### Context
W4 Profile is a root bottom-nav tab (no BackButton). W5 and W6 are sub-screens pushed from W4 — they need Telegram's native BackButton. W6 navigates to W5 on success, W5 navigates to W4 on back.

### Decision
- **W4:** `Telegram.WebApp.BackButton.hide()` on mount.
- **W5:** `Telegram.WebApp.BackButton.show()` on mount; `onClick → navigate(-1)`. `hide()` on unmount.
- **W6:** Same as W5. On success POST: `navigate('/time-off', { replace: true })`.
- **Router:** React Router v6 `useNavigate()` — consistent with W1-W3.

### Consequences
- ✅ Native TMA back gesture works correctly on W5 and W6
- ✅ W6 success navigates back without adding to history stack (`replace: true`)
- ✅ W4 never shows BackButton (it is a root tab)

---

*End of ADR-003. Reviewed against: `scenario/SCREEN_Profile.md` v1.0, `scenario/SCREEN_TimeOff.md` v1.0, `scenario/SCREEN_LeaveForm.md` v1.0*
