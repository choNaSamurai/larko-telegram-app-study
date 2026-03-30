# ADR-005: Add Time Log Screen (W2.1) — Architecture Decisions

**Status:** PROPOSED
**Date:** 2026-03-30
**Screen:** `SCREEN_Add_Time_Log` (W2.1 — Додати облік, Full-Screen Modal)
**Traces to:** `scenario/SCREEN_Add_Time_Log.md`, `ba/04_BRD_Larko_MVP.md §2 Worker — Order Hub`

---

## ADR-005-A: Screen Presentation Pattern (Full-Screen vs Bottom Sheet)

### Context
The BRD labels this as the **"Add Time Bottom Sheet (Spoke)"** opened from Order Hub. However, the Figma design (node `255:11209`) explicitly labels the section **"Додати облік (Full-Screen Modal)"** and renders it as a full 390×1124px screen — not a partial bottom sheet. Additionally, a Figma annotation note in the section states: _"1. Треба BottomSheet редагування"_ — confirming a separate Edit Flow is planned for the future.

### Problem
Should the "Add Time Log" entry form be rendered as a CSS bottom sheet overlay (partial height, sliding from bottom) or as a full-page route transition?

### Options

| | **Option A: Bottom Sheet overlay** | **Option B: Full-screen route (`/orders/:id/add-time`)** |
|---|---|---|
| Matches Figma section label | ✅ Label says "Bottom Sheet" | ✅ Figma renders full-screen |
| Matches Figma visual design | ❌ Sheet would clip the content | ✅ Exact match |
| TMA back-navigation support | ⚠️ Custom gesture needed | ✅ `Telegram.WebApp.BackButton` |
| Sheet height validation | ❌ Records section won't fit | ✅ Scrollable full page |
| Consistent with W4/W6 modal patterns | ⚠️ Different UX | ✅ Same full-screen pattern |

### Decision
**Option B: Full-screen route** (`/orders/:id/add-time`).

### Rationale
Despite the BRD copying the pattern to "Bottom Sheet", the Figma explicitly implements this as a full-screen page. The content (form card + history section with 4 time entry cards) **does not fit in a standard iOS/Android bottom sheet** — it requires full-screen height and scroll. The project already uses full-screen routes for W4 Profile, W5 TimeOff, and W6 LeaveForm modals. Consistency demands the same pattern. The Telegram WebApp BackButton provides native back navigation with zero additional code.

### Consequences
- ✅ Back navigation: `Telegram.WebApp.BackButton.show()` → navigates back to Order Hub (`/orders/:id`)
- ✅ Scroll container works naturally in full-screen mode
- ✅ Header with title + close button matches Figma exactly
- ❌ No backdrop dimming effect (no overlay) — acceptable since Order Hub is still accessible via BackButton

### Future
When the Edit Time Entry flow is implemented (as noted in the Figma annotation), it will open as a bottom sheet **within** the Add Time Log screen — layered on top of the history section.

---

## ADR-005-B: Live Net Hours Computation Strategy

### Context
The SA Scenario (§4 Step 5, §6) requires net hours to compute **live** as the worker changes Start, End, or Break fields. The formula: `Net = (End − Start) − sum(breaks)`. The value must account for midnight-crossing shifts. This computation is purely client-side — no API call needed for the calculation itself.

### Problem
Where should the net hours derivation live — inline in the component, a custom hook, or a utility function?

### Options

| | **Option A: Inline component derivation** | **Option B: `useTimeLogForm` custom hook** | **Option C: `useMemo` in form component** |
|---|---|---|---|
| Testability | ❌ Tightly coupled | ✅ Unit-testable in isolation | ⚠️ Moderate |
| Reusability (Edit flow) | ❌ Duplicated | ✅ Reused in Edit BottomSheet | ⚠️ Harder to reuse |
| Midnight handling | ⚠️ Easy to miss | ✅ Centralized logic | ⚠️ Moderate |
| Code clarity | ⚠️ Mixed concerns | ✅ Clean separation | ⚠️ Still mixed |

### Decision
**Option B: `useTimeLogForm` custom hook** — encapsulates all form state, time derivation, validation, and midnight logic.

### Rationale
The form has multiple interdependent fields (start, end, array of break pairs, date, comment, units). Managing this complexity inline in the component leads to large, hard-to-test render functions. A custom hook cleanly separates concerns: the hook owns the state and derived values; the component owns only rendering. The hook will be reused when the Edit BottomSheet is implemented (ADR-005-A Future note). Time math with midnight handling is a non-trivial bug magnet — isolating it in a single tested function (`calculateNetMinutes`) is mandatory.

### Consequences
- ✅ Midnight-crossing logic tested in isolation via unit tests
- ✅ Net Hours updated on every field change via `useMemo` inside the hook
- ✅ Same hook reused for Edit flow
- ✅ Validation (breaks overlap, net > 0) encapsulated in hook, not scattered in components
- ❌ Slightly more files — worth the clarity

---

## ADR-005-C: Time Input Strategy (Date & Time Pickers)

### Context
The form has three time inputs: Date, Start Time, End Time — plus up to 5 Break pairs (each with Break Start and Break End). The Figma renders these as stylized chips (bg `#3E3E42`, rounded-[10px]) displaying formatted values. TMA WebView on iOS and Android provides native `<input type="date">` and `<input type="time">` pickers — these are the correct implementation for maximum compatibility.

### Problem
Should we use native HTML `<input type="date" / type="time">` with custom styling, or a custom drum-roll picker, or a date library?

### Options

| | **Option A: Native `<input type="time">` hidden, chip triggers it** | **Option B: Custom drum-roll picker (library)** | **Option C: Simple text chips (no picker)** |
|---|---|---|---|
| TMA WebView compatible | ✅ Native OS picker | ⚠️ Libraries may have WebView issues | ❌ No UX |
| Figma visual match | ✅ Chip shows formatted value; native picker opens on tap | ⚠️ Library styling overhead | N/A |
| Break pairs (5 pairs) | ✅ Same pattern repeated | ⚠️ Complex for pairs | N/A |
| Development time | ✅ Minimal | ⚠️ Significant | N/A |
| Bundle size | ✅ 0KB | ⚠️ +15-30KB | N/A |

### Decision
**Option A: Native `<input type="time">` / `<input type="date">` hidden, triggered by tapping the styled chip.**

### Rationale
Native OS pickers (iOS scroll wheel, Android clock) are exactly what TMA users expect. The Figma styled chips become the visual layer — the hidden native input is absolutely positioned and covers the chip when tapped, opening the OS picker. This pattern is battle-tested in Telegram Mini Apps and requires zero additional dependencies. It correctly handles all locale/OS nuances including 24h vs 12h time format.

### Consequences
- ✅ Native OS time/date experience — zero learning curve for users
- ✅ No additional library dependencies
- ✅ Pattern works for all 5 break pairs (each pair is 2 hidden inputs + 2 chips)
- ❌ Minor visual: OS picker appearance varies by device — not under our control; acceptable for MVP

---

## ADR-005-D: Duplicate Entry Prevention (One Log Per Day)

### Context
BRD Rule BR-TL-001: one time log per day per order per worker. After a log is submitted and saved, the `[+ Add Time]` button on Order Hub hides. This is enforced at the Order Hub level (W2), so the Add Time Log screen itself is unreachable for duplicates in normal flow. However, edge cases exist (network race conditions, stale cache).

### Problem
How is duplicate prevention enforced — purely client-side, purely server-side, or both?

### Options

| | **Option A: Server-side only (409 Conflict response)** | **Option B: Client-side guard + server-side** |
|---|---|---|
| Data integrity | ✅ Always correct | ✅ Always correct |
| UX on race condition | ⚠️ Error only shown after submit | ✅ Can pre-detect from cache |
| Implementation effort | ✅ Minimal | ⚠️ Moderate |

### Decision
**Option B: Client-side guard + server-side enforcement.** The mock service checks for existing entries; the real API returns 409. The client shows a clear inline error on 409.

### Rationale
The client should attempt to prevent the duplicate before the form is even visible — by checking if `existingEntries.some(e => e.logDate === today)` from the history list data. If yes, the Save button is disabled and a banner shows "Entry for today already exists." The server is the authoritative gate (409), but client-side feedback is essential for TMA UX where error screens feel disruptive.

### Consequences
- ✅ Most duplicate attempts blocked before API call
- ✅ Server 409 handled gracefully with friendly error message
- ❌ Requires history list to be loaded before form is usable — acceptable since history loads in same view

---

*End of ADR-005. Reviewed against: `scenario/SCREEN_Add_Time_Log.md` v1.0*
