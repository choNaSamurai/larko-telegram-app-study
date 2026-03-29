# ADR — SCREEN_Order_Hub (W2)

**Status:** ACCEPTED
**Traces to:** `scenario/SCREEN_Order_Hub.md` | `ba/04_BRD_Larko_MVP.md` §2 Worker — Order Hub
**Figma:** https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=298-26477&m=dev
**Date:** 2026-03-29

---

## Context

The Order Hub (W2) is the most complex screen in the Worker TMA experience. It must:

1. **Render 6 distinct status-driven UI states** (New, InProgress, Overdue, Checking, Done/Locked, Dispute) — each requiring different banners, card borders, CTA buttons, and interactive controls.
2. **Handle progressive photo upload** — up to 3 photos per day (10MB each), display thumbnails with remove controls, and show a dashed "add" slot when slots remain.
3. **Integrate a time tracking widget** — display cumulative hours, allow adding a new time entry (disabled in certain states), and show history.
4. **Render a static map thumbnail** with gradient overlay and a backdrop-blurred location chip.
5. **Support a dispute response flow** — when status is `Dispute`, show the Manager's claim, a text area for Worker's response, and two action buttons (`Оскаржити` / `Погодитись`).
6. **Adhere to strict TMA constraints**: safe-area insets, 390px viewport, no native scrollbars, Telegram.WebApp.BackButton integration.

### TMA-specific constraints
- No browser URL bar — navigation is managed by `Telegram.WebApp.BackButton`
- The screen is vertically scrollable; the bottom CTA must be sticky/fixed
- The `env(safe-area-inset-top)` must be applied to the header
- Minimal bundle size; no full charting libs or heavy maps SDKs

---

## Decision 1: State Management Architecture

### Problem
The Order Hub has 6 screen states, sub-states (photos count, time already submitted, description expanded), and a dispute response form — all needs to be managed without over-engineering.

### Options Compared

| Option | Pros | Cons |
|--------|------|------|
| **A) Zustand store (local screen state)** | Simple, consistent with rest of codebase, no boilerplate | Shared state might outlive component; requires explicit reset on unmount |
| **B) React `useState` + `useReducer`** | Colocated, no deps, readable | More boilerplate for complex state; harder to debug |
| **C) React Query server state + local useState** | Clean separation: server state (React Query) vs UI state (useState) | Two patterns to maintain |

### Decision: **Option C — React Query + local useState**

- **Server state** (order details, time logs, photos list): managed by `useQuery` from `@tanstack/react-query`. Automatically handles loading/error/stale states with retry logic.
- **UI state** (description expanded, dispute response text, photo upload progress): managed by `useState` inside the screen component.
- This pattern is already established in the project (W1 uses same split).

---

## Decision 2: Photo Upload Strategy

### Problem
Photos must be uploaded in a TMA context. The Worker picks a photo from camera/gallery, sees a thumbnail immediately, can delete before commit, and is limited to 3/day.

### Options Compared

| Option | Pros | Cons |
|--------|------|------|
| **A) Upload immediately on pick** | Consistent server state | Bad UX if network is slow; can't "cancel" mid-upload |
| **B) Stage locally, upload on action** | Preview UX, batch commit | Requires local blob URL management |
| **C) Use `<input type="file">` with FileReader for preview + upload on pick** | Simple, minimal deps | No staging; immediate upload = no cancel |

### Decision: **Option C — `<input type="file">` + immediate upload on pick**

- Simple, zero-dependency approach suitable for MVP.
- Preview shown immediately via `URL.createObjectURL(file)`.
- Upload triggered immediately; on success, photo ID returned and added to photo list.
- On failure, error toast shown, thumbnail removed.
- `[×]` delete button sends `DELETE /orders/{id}/photos/{photoId}`.

---

## Decision 3: Map Integration

### Problem
The design shows a static map thumbnail with the order's address. Full interactive map would require a heavy SDK (Mapbox, Leaflet) and map tiles, which is overkill for MVP.

### Options Compared

| Option | Pros | Cons |
|--------|------|------|
| **A) Static map image (OpenStreetMap tiles via URL)** | Zero JS deps, lightweight, cacheable | Requires tile URL construction, OpenStreetMap ToS |
| **B) Leaflet.js** | Interactive, good React integration | Heavy (~150KB), overkill for MVP thumbnail |
| **C) Google Static Maps API** | Clean, reliable | Requires API key, billing |
| **D) Placeholder gradient + address text only (no map)** | Zero deps, max performance | Less visually rich than Figma design |

### Decision: **Option A — OpenStreetMap Static Tile (or fallback to placeholder)**

For MVP: Render a static tile image via `https://staticmap.openstreetmap.de/staticmap.php?center={lat,lng}&zoom=15&size=358x100`.
If geocoding from address string is not available (no backend geocode endpoint), **fallback**: render a dark gradient placeholder with the address label overlay only. This matches the Figma's minimalist map appearance and avoids any API key dependency for MVP.

---

## Decision 4: Dispute Response Submission

### Problem
Worker must respond to a dispute with either `Оскаржити` (contest) or `Погодитись` (accept). Both actions require an optional explanation text.

### Decision: **Inline form with optimistic UI**

- `dispute_response_form` text area + two buttons rendered directly in the scrollable content (not as a bottom sheet).
- On `Погодитись` (accept): `POST /orders/{id}/dispute/response { action: "accept" }` — no explanation required.
- On `Оскаржити` (contest): explanation text is **required** (min 1 char). Validation shown inline.
- Optimistic update: button shows loading spinner immediately; on success → screen refreshes with new status.

---

## Consequences

- **Accepted complexity:** The screen has the most conditional rendering logic in the entire app. Each `if (status === ...)` block must be clearly commented with its BRD reference.
- **Tradeoff — no offline photo upload queue:** For MVP, photo upload requires network. Offline queuing is deferred to Phase 2.
- **Dependency:** `@tanstack/react-query` (already installed), `@iconify/react` (already installed), `@twa-dev/sdk` (already installed), no new packages required for this screen.
