# SCREEN_W5_Absences — System Analyst Scenario

**Figma Section:** `87:7730` | **Screen ID:** W5  
**Figma URL:** https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=87-7730

---

## 1. Screen Overview

The "Вихідні та відпустки" (Time Off & Vacations / My Absences) screen (W5) is the Worker's personal absence management dashboard within the Larko Telegram Mini App. It is accessed exclusively via the W4 Profile screen ("Вихідні та відпустки" row). The screen presents two sections: (1) a mini calendar view showing the current month with dots marking days that have associated absence requests, and (2) a "Мої заявки" (My Requests) list showing all the worker's past and current absence requests with status badges and a "+ New" button to create new requests. The calendar helps workers visually understand which days are covered by absences. Tapping "+ New" navigates to the W6 New Request form.

---

## 2. Actors

- **Worker** — authenticated TMA user submitting and reviewing their own absence requests.
- **System** — retrieves absence records scoped to the current worker and company; renders mini calendar.
- **Manager** — not a direct actor on this screen, but their decisions (Approve/Reject) affect request statuses visible here.

---

## 3. Entry Conditions (Pre-conditions)

1. User is authenticated via Telegram with Worker role.
2. User navigates to this screen via W4 Profile → "Вихідні та відпустки" tap.
3. The Company has at least one Absence Type configured (default: Vacation, Sick Leave, Personal Day, etc.).
4. Network may be offline — requests loaded from cache if available.

---

## 4. Main Flow (Happy Path)

1. User taps "Вихідні та відпустки" on the W4 Profile screen.
2. System loads the absence screen [figma: 73:54648 Light / 73:54492 Dark].
3. Screen renders with two sections:
   - **Section A — Month label** ("Березень 2026") [figma: 73:54655].
   - **Section B — Mini Calendar Card** [figma: 73:54659]: month navigation (← →), 7-column weekday header (Пн–Нд), date grid. Days with absence dots marker shown (e.g., 10, 11, 20, 21, 22) [figma: 73:54759, 73:54762, 73:54763, 73:54766, 73:54769]. Selected day (e.g., 23) shown with filled accent circle [figma: 73:54731].
   - **Section C — "Мої заявки" header** with `+ Нова` button [figma: 73:54777].
   - **Section D — Request cards list** [figma: 73:54781, 73:54791]: each card shows type, status badge, date range + day count, reason/note.
4. User taps **`+ Нова`** button → navigates to W6 (New Request form).
5. User scrolls down to view more requests → scrollable list extends [figma: W5_Scrolled Dark: `73:54936`, Light: `73:55004`].

---

## 5. Alternative Flows

### 5.1 Navigating the Calendar
- User taps **`<` (previous month)** arrow → calendar shifts to prior month; request dots update to reflect that month's absences.
- User taps **`>` (next month)** arrow → calendar shifts to next month.
- User taps a **day cell** → [ANNOTATION MISSING: no Figma tap target defined for individual day cells beyond visual selection. Behavior unclear — see OQ-W5-01].
- Days with absences are shown with a dot indicator below the date number [figma: `73:54759`].
- The current/selected day is shown with a filled accent-color circle (today or tapped day) [figma: `73:54731`].
- Days outside the current month are shown in muted text color [figma: `73:54685`].

### 5.2 Scrolled State (Full History)
- When the worker has more than 2 requests, the list becomes scrollable beyond the visible area.
- The scrolled state shows the full-screen list of requests without the mini calendar being visible [figma: W5_Scrolled Dark: `73:54936`, Light: `73:55004`].
- A fade gradient at the bottom of the list hints at more content below [figma: `73:54988`].
- Status badges visible in scrolled state: `На розгляді` (Pending, orange), `Затверджено` (Approved, green), `Відхилено` (Rejected, red).

---

## 6. Edge Cases & Error States

| Edge Case | Visual Behavior |
|:----------|:----------------|
| **Empty (ever — no requests ever submitted)** | "🏖️ Немає заявок на відгул" heading + "Потрібен вихідний? Створіть заявку нижче 👇" subtitle + `[Створити заявку]` button. Mini calendar is NOT shown. [figma Dark: `73:54804`, Light: `73:54826`] |
| **Error loading requests** | Centered error icon + "Помилка завантаження" heading + "Не вдалося завантажити завдання. Перевірте інтернет-з'єднання та спробуйте ще раз." + `[Спробувати знову]` button. Header remains visible. [figma Dark: `87:7731`, Light: `87:7758`] |
| **Loading state** | Skeleton mini-calendar card (350×220 shimmer) + skeleton request cards (3 cards, each with 3 shimmer bars) [figma Dark: `73:54848`, Light: `73:54867`] |
| **Network offline (cached data exists)** | Show last-cached requests with offline indicator; `+ Нова` button still navigates to W6 but W6 will handle offline submission |
| **No requests this month (but prior requests exist)** | Calendar shows no dots for the month; "Мої заявки" section shows historical requests including past months |

> **Empty State Clarification:**
> - **empty-ever:** Worker has never submitted any absence request → beach emoji empty state shown, mini calendar hidden, CTA "Створити заявку" shown [figma: `73:54804` / `73:54826`].
> - **empty-page:** N/A — this screen is not paginated; all requests are fetched at once. There is no scenario where requests exist but page returns empty.

---

## 7. UI Elements & States

| Element | Type | Figma Node | States | Behavior | Notes |
|:--------|:-----|:-----------|:-------|:---------|:------|
| Header bar — div.px-4 | Header Component | `113:10860` | default | Title "Вихідні та відпустки" + back arrow `<` | Back navigates to W4 Profile |
| MonthLabel — p.text-sm | Text | `73:54656` | default | Displays current month e.g. "Березень 2026" | Updated with calendar navigation |
| MiniCalendar — div.bg-l-bg-card | Card | `73:54659` | default | Month/year header with prev/next arrows, day-of-week grid, date grid | 7-column grid; dots on dates with absences |
| CalendarPrevArrow — Component 2 | Icon Button | `73:54661` | default, pressed | Navigate to previous month | Left arrow |
| CalendarNextArrow — Component 2 | Icon Button | `73:54666` | default, pressed | Navigate to next month | Right arrow |
| CalendarDayCell — span.text-l-content-primary | Cell | `73:54699` (example) | default, selected, muted, dot | Date number; muted = other month; selected = accent filled circle; dot = has absence | Multiple variants |
| CalendarSelectedDay — span.bg-l-accent-primary | Selected Cell | `73:54731` | selected | Filled circle with white date number | Accent color: primary |
| CalendarDotMarker — span.absolute | Dot | `73:54759` | presence | 4×4 rounded rectangle below date number | Indicates absence on that day |
| MyRequestsHeader — h3.text-sm | Text | `73:54775` | default | "Мої заявки" | Header label |
| NewRequestButton — button.h-8 | Button | `73:54777` | default, pressed | Tapping navigates to W6 New Request form | Label: "+ Нова" with plus icon |
| RequestCard — div.bg-l-bg-card | Card | `73:54781` | pending, approved, rejected | Displays type, status badge (right-aligned), date range + day count, reason text | 99px height; full-width within padding |
| RequestType — span.text-sm | Text | `73:54783` | default | Absence type label e.g. "Лікарняний", "Відпустка", "Особистий день" | Left-aligned |
| RequestStatusBadge — span.text-l-status-success | Badge | `113:10920` | pending (orange), approved (green), rejected (red) | Status pill with dot or check icon | See §9 for enum values |
| RequestDateRange — p.text-xs | Text | `73:54787` | default | e.g. "10–11 березня · 2 дні" | Below type label |
| RequestReason — p.text-xs | Text | `73:54789` | default | Optional reason text (muted) | Below date range |
| BottomFadeGradient | Gradient overlay | `73:54988` | scroll-position | Fades list bottom to hint scrollability | Visible when list overflows |

---

## 8. Screen States

| State | Description | Figma Node |
|:------|:------------|:-----------|
| **Loading** | Skeleton calendar + skeleton request cards | Dark: `73:54848` / Light: `73:54867` |
| **Default (Populated)** | Mini calendar + 2+ request cards visible | Dark: `73:54492` / Light: `73:54648` |
| **Scrolled** | Full-screen list of requests (calendar scrolled out of view) | Dark: `73:54936` / Light: `73:55004` |
| **Empty (ever)** | No requests ever; beach emoji, CTA shown; no calendar | Dark: `73:54804` / Light: `73:54826` |
| **Error** | Network error loading requests; error icon + retry button | Dark: `87:7731` / Light: `87:7758` |

---

## 9. Business Rules

| Rule | Description | BRD Source |
|:-----|:------------|:-----------|
| BR-W5-01 | Request statuses (enum): `'pending'` (UI: "На розгляді", orange), `'approved'` (UI: "Затверджено", green), `'rejected'` (UI: "Відхилено", red). | BRD §2 My Absences + §3 Absence Requests |
| BR-W5-02 | Absence Types (configurable per Company by Manager). Default set: `'vacation'` (Відпустка), `'sick_leave'` (Лікарняний), `'personal_day'` (Особистий день), `'holiday'` (Вихідний), `'unpaid_leave'` (Без збереження), `'family_leave'` (Сімейний). | BRD §2 My Absences + §Screen: Company Settings |
| BR-W5-03 | Worker can only view their own absence requests. Cross-worker visibility is Manager-only. | BRD §2 My Absences |
| BR-W5-04 | Calendar dots indicate days covered by ANY absence request (regardless of status). | Inferred from Figma — ANNOTATION MISSING |
| BR-W5-05 | Worker cannot submit an absence for past dates. Cannot overlap with existing approved absences. | BRD §2 My Absences: Validation |
| BR-W5-06 | Requests are scoped to the currently active Company context. Switching companies (W4 Switcher) reloads requests for the new company. | BRD §Global Company Switcher |

---

## 10. Integrations & API Contracts

| Endpoint | Method | Request | Response | Error Codes |
|:---------|:-------|:--------|:---------|:------------|
| GET /absence-requests | GET | `Authorization: Bearer {token}`, Query: `?company_id={id}&worker_id={self}` | `[{ id, type, start_date, end_date, reason, status, review_comment }]` | 401, 403 |
| GET /absence-requests/calendar | GET | `?company_id={id}&month=2026-03` | `{ days_with_absences: ['2026-03-10', '2026-03-11', ...] }` | 401, 403 |

**Status enum values:** `'pending'`, `'approved'`, `'rejected'`  
**Type enum values:** `'vacation'`, `'sick_leave'`, `'personal_day'`, `'holiday'`, `'unpaid_leave'`, `'family_leave'`, `'training'`, `'other'`  
**Default on load:** current calendar month

---

## 11. Non-Functional Requirements

| NFR | Requirement |
|:----|:------------|
| Performance | Screen renders within 300ms from cache; skeleton shown if API > 200ms |
| Offline | Last-fetched requests shown from local cache with "last updated" indicator |
| Accessibility | Calendar cells must be keyboard-navigable with aria-labels for dates |
| Pagination | All requests loaded in a single fetch for MVP (no infinite scroll). If list exceeds 50 items, pagination should be introduced. |

---

## 12. Open Questions

| # | Question | Blocking? | Notes |
|:--|:---------|:----------|:------|
| OQ-W5-01 | What happens when the user taps an individual date cell in the mini calendar? Does it filter the request list to show only absences on that day, or is it visual-only? | [BLOCKING] | Affects implementation of calendar interaction |
| OQ-W5-02 | Are calendar dots shown for ALL statuses (pending, approved, rejected) or only approved? | [BLOCKING] | Affects API contract for `days_with_absences` |
| OQ-W5-03 | Is the mini calendar always visible on scroll (sticky), or does it scroll out of view and the "Scrolled" state replaces it? Figma shows two distinct states (Default with calendar, Scrolled without). | [NON-BLOCKING] | Safe to assume scroll-out-of-view behavior |
| OQ-W5-04 | Can the worker tap a request card to view its full details (e.g., review comment if rejected)? Figma shows no tap interaction on request cards. | [NON-BLOCKING] | May be deferred to v2 |

---

## 13. Proposed Improvements (PENDING APPROVAL)

*Section intentionally empty — pending user approval per SKILL_SA_DOCUMENT protocol.*
