# SCREEN_TimeOff — System Analyst Scenario (W5)

## 1. Screen Overview

The Time Off screen (W5) is the "Вихідні та відпустки" (Vacations & Days Off) screen for workers in the Larko TMA. It provides a mini calendar view showing the current month with dots on days that have absences, a section "Мої заявки" listing the worker's absence requests with status badges, and a "+ Нова" button to create a new request (navigates to W6). The screen is accessed from the Profile → Вихідні та відпустки row and has a back button in the header.

---

## 2. Actors

- **Worker (TMA User):** The authenticated worker viewing and managing their own absence requests.
- **Backend API:** Returns the worker's leave requests and absence calendar data.
- **Telegram WebApp:** Provides navigation context (BackButton).

---

## 3. Entry Conditions (Pre-conditions)

- User is authenticated (valid JWT token).
- User has accessed this screen from Profile → "Вихідні та відпустки" OR from a deep link.
- Telegram WebApp `BackButton` is shown.

---

## 4. Main Flow (Happy Path)

1. User taps "Вихідні та відпустки" in the Profile screen.
2. Frontend navigates to `/time-off` route; Telegram BackButton appears.
3. Header renders: back-button (40×40px circle, bg `#2d2d31`, border `#3e3e42`), title "Вихідні та відпустки" (18px, bold, `#ededed`).
4. Frontend calls `GET /leave-requests` and `GET /leave-calendar?month=YYYY-MM`.
5. **Month label** renders below header: "Березень 2026" (14px regular, `#878787`, px-16px py-8px).
6. **Mini Calendar** renders (bg `#2d2d31`, border `rgba(255,255,255,0.08)`, rounded-`20px`, h-`290px`):
   - Month nav: `‹` button (32×32px) | month label (bold 14px `#ededed`) | `›` button.
   - Day-of-week header: Пн Вт Ср Чт Пт Сб Нд (12px, regular, `#878787`).
   - Calendar grid (7-col, 6 rows): days from previous month shown as `#878787`, current month `#ededed`. Today date highlighted with white circle pill (bg `white`, text `#222226`, semibold). Days with absences show a small dot below (4px circle: `#fbbf24` for pending/on-review, `#34d399` for approved).
7. **Requests Section** renders (below calendar, px-16px):
   - Row header: "Мої заявки" label (14px semibold `#ededed`) + "+ Нова" button (80×32px, bg `#fafafa`, text `#222226`, rounded-`32px`, 12px semibold).
   - Each request card: bg `#2d2d31`, border `rgba(255,255,255,0.08)`, rounded-`20px`, h-`99px`:
     - Top row: type name (14px semibold `#ededed`) + status badge (right).
     - Middle: date range "10–11 березня · 2 дні" (12px regular `#878787`).
     - Bottom: reason text (12px regular `#878787`).
8. **Scrolled State:** When requests overflow the screen, only the list scrolls (calendar stays fixed or compresses).

---

## 5. Alternative Flows

### 5.1 Back Navigation
- User taps `‹` back button in header OR Telegram BackButton.
- Navigates back to Profile screen.

### 5.2 Tap "+ Нова"
- Navigates to SCREEN_LeaveForm (W6) to create a new absence request.

### 5.3 Month Navigation (‹ / ›)
- User taps Previous or Next month arrow.
- Calendar re-renders for the selected month; dots update from local cache or `GET /leave-calendar?month=YYYY-MM`.

### 5.4 Loading State (W5_Loading)
- Header: skeleton (96px high placeholder).
- Month label: skeleton bar (96×12px).
- Calendar: large skeleton block (350×220px, rounded-`20px`).
- Requests: 3 skeleton cards (358×122px each, with 3 skeleton bars inside).

### 5.5 Empty State (W5_Empty)
- No requests exist.
- Shows 🏖️ emoji (72px), heading "Немає заявок на відгул" (24px base semibold `#ededed`), sub-text "Потрібен вихідний? Створіть заявку нижче 👇" (14px regular `#878787`), + "+ Нова" button (224×48px, primary button).

### 5.6 Error State (W5_Error / W1_Error_Dark frame present)
- Shows 64×64px error icon, heading "Помилка завантаження" (18px, `#ededed`), sub-text "Не вдалося завантажити завдання. Перевірте інтернет-з'єднання та спробуйте ще раз." (14px, `#878787`), Retry button (224×48px).

### 5.7 Scrolled State (W5_Scrolled)
- Header with back-button + "Мої Завдання" title + a "+ Нова" filter button remain fixed.
- Only the requests list scrolls; calendar is not shown (or collapsed to a compact strip).

---

## 6. Edge Cases & Error States

- **No requests:** Show W5_Empty state.
- **Network error on initial load:** Show W5_Error with Retry.
- **Partial data (calendar OK, requests fail):** Show calendar, show error bar only for requests section.
- **Dots on calendar for past months:** Show historical absence dots (greyed or coloured by status).
- **Old requests beyond screen:** List scrolls separately; calendar stays at top.
- **Request status change (external):** On mount, always fetch fresh data; cache stale after 5min.

---

## 7. UI Elements & States

| Element | Type | Figma Node ID | Icon (`data-name`) | States | Behavior | Validation |
|---|---|---|---|---|---|---|
| Back button | Button | `I113:10867;113:11022` | arrow-left (via SVG component) | default / pressed | bg `#2d2d31`, border `#3e3e42`, 40×40px, rounded-full | navigates back |
| Screen title | Text | `I113:10867;110:8091` | — | always | "Вихідні та відпустки", 18px semibold, `#ededed` | — |
| Month label | Text | `73:54500` | — | always | "Березень 2026", 14px regular `#878787` | updates with nav |
| Mini Calendar | Card | `73:54503` | — | default / loading | bg `#2d2d31`, border, rounded-20px, h-290px | — |
| Month prev button | Button | `73:54505` | `‹` icon | default / pressed | 32×32px rounded-full | decrements month |
| Month next button | Button | `73:54510` | `›` icon | default / pressed | 32×32px rounded-full | increments month |
| Day-of-week header | Text row | `73:54513` | — | always | 12px regular `#878787` | — |
| Calendar day cell (current month) | Text | `73:54557` etc. | — | default / today / has-dot | `#ededed` 12px; today: white pill; dot: 4px circle below | — |
| Calendar day cell (other month) | Text | `73:54529` etc. | — | always | `#878787` muted | — |
| Today cell | Highlighted day | `73:54575` | — | always | bg `white` (or accent), text `#222226`, rounded-16px | — |
| Absence dot (pending) | Dot | `73:54603` etc. | — | pending | 4px `#fbbf24` rounded-full | shows on sick days in review |
| Absence dot (approved) | Dot | `73:54609` etc. | — | approved | 4px `#34d399` rounded-full | shows on approved leave days |
| Section header "Мої заявки" | Text | `73:54619` | — | always | 14px semibold `#ededed` | — |
| "+ Нова" button | Button | `291:16089` | — | default / pressed | 80×32px, bg `#fafafa`, text `#222226`, rounded-32px | navigates to W6 |
| Request card | Card | `73:54625`, `73:54635` | — | Pending / Approved / Rejected | bg `#2d2d31`, border, rounded-20px, h-99px | — |
| Request type label | Text | `73:54627` | — | always | 14px semibold `#ededed` | — |
| Status badge — Pending (На розгляді) | Badge | — | — | pending | bg `rgba(245,158,11,0.1)`, dot `#fbbf24`, text `#fbbf24` | — |
| Status badge — Approved (Затверджено) | Badge | — | — | approved | bg `rgba(16,185,129,0.1)`, text `#34d399`, check `✓` | — |
| Status badge — Rejected (Відхилено) | Badge | — | — | rejected | bg `rgba(239,68,68,0.1)`, text `#ef4444` | — |
| Date range | Text | `73:54631` | — | always | "10–11 березня · 2 дні", 12px regular `#878787` | — |
| Reason text | Text | `73:54633` | — | always | 12px regular `#878787` | ellipsis if long |

---

## 8. Screen States

| State | Description |
|---|---|
| **Loading** | Skeleton calendar + skeleton cards |
| **Default (Populated)** | Calendar + request cards |
| **Empty** | 🏖️ emoji + CTA button |
| **Error** | Error icon + Retry button |
| **Scrolled** | Header fixed, list scrolls below calendar range |

---

## 9. Business Rules

- **BR-TO01:** Absence types (Sick Leave, Vacation, Personal Day, etc.) are configured by Manager in Company Settings. Default set: Vacation (Відпустка), Sick Leave (Лікарняний), Personal Day (Особистий день), Holiday, Unpaid Leave, Family Leave, Training, Other.
- **BR-TO02:** Request statuses: `Pending` → `Approved` | `Rejected` (by Manager).
- **BR-TO03:** Start Date ≤ End Date. Cannot request absence for past dates.
- **BR-TO04:** Cannot create an absence that overlaps with an existing `Approved` absence.
- **BR-TO05:** Manager receives a notification when a new request is submitted.
- **BR-TO06:** Worker can see all own requests (past and future); cannot modify an approved/rejected request.
- **BR-TO07:** Calendar dot colors: `#fbbf24` = pending/on-review; `#34d399` = approved.

---

## 10. Integrations & API Contracts

| Endpoint | Method | Request | Response | Error |
|---|---|---|---|---|
| `/leave-requests` | GET | Bearer token | `[{ id, type, start_date, end_date, reason, status, duration_days }]` | 401, 500 |
| `/leave-calendar` | GET | `?month=YYYY-MM` | `[{ date: "YYYY-MM-DD", has_request: bool, status: "pending"\|"approved"\|"rejected" }]` | 401, 500 |

**TMA Integration:**
- `Telegram.WebApp.BackButton.show()` on mount; `onClick` → navigate back.
- `Telegram.WebApp.BackButton.hide()` on unmount.

---

## 11. Non-Functional Requirements

- List and calendar load < 1.5s on 4G.
- Calendar rendering is synchronous (no flicker on month nav if data cached).
- Requests list supports infinite scroll or shows all (< 30 items typically).
- Safe area: **YES** — `paddingTop: env(safe-area-inset-top, 16px)` on screen root.

---

## 12. Open Questions

- [NON-BLOCKING] Q1: Should calendar show only current month, or persist the user's viewed month across sessions?
- [NON-BLOCKING] Q2: Can a worker cancel a `Pending` request directly from this list (swipe left)?
- [NON-BLOCKING] Q3: Max number of visible requests before pagination kicks in?

---

## 12.1 Design-to-Code Specifics (MANDATORY — feed into Tech Stack)

### Icon Inventory (from SKILL_FIGMA_PARSE icon_inventory)
| Figma data-name | Size | Color | Component |
|---|---|---|---|
| Back arrow (SVG Component) | 18px | `#ededed` | Header back button |
| Month Prev arrow (SVG Component) | 18px | `#ededed` | Calendar prev |
| Month Next arrow (SVG Component) | 18px | `#ededed` | Calendar next |

> **Note:** Arrows are custom SVG components in Figma. Use Iconify equivalents: `solar:arrow-left-bold` (back button), `solar:alt-arrow-left-bold`, `solar:alt-arrow-right-bold` (calendar nav).

### Color Table (MANDATORY — exact Figma hex per element)
| CSS Variable | Hex value | Usage |
|---|---|---|
| `--color-bg-screen` | `#222226` | Screen root background |
| `--color-bg-card` | `#2d2d31` | Calendar card, request cards |
| `--color-bg-input` | `#3e3e42` | Back button border |
| `--color-text-primary` | `#ededed` | Title, type label, section header |
| `--color-text-secondary` | `#878787` | Month label, date range, reason |
| `--color-text-muted` | `#525252` | Muted / placeholder text |
| `--color-border-card` | `rgba(255,255,255,0.08)` | Calendar and request card border |
| `--color-accent-primary` | `#ffffff` | Today cell background |
| `--color-status-warning` | `#fbbf24` | Pending dot, pending badge text |
| `--color-status-success` | `#34d399` | Approved dot, approved badge text |
| `--color-status-error` | `#ef4444` | Rejected badge text |
| `--color-badge-pending-bg` | `rgba(245,158,11,0.1)` | Pending badge background |
| `--color-badge-approved-bg` | `rgba(16,185,129,0.1)` | Approved badge background |
| `--color-badge-rejected-bg` | `rgba(239,68,68,0.1)` | Rejected badge background |
| `--color-btn-new-bg` | `#fafafa` | "+ Нова" button background |
| `--color-btn-new-text` | `#222226` | "+ Нова" button text |

### Spacing Table (MANDATORY — exact Figma px values)
| Element | Padding / Gap value |
|---|---|
| Screen padding-top | `env(safe-area-inset-top, 16px)` |
| Header height | `68px`, padding `16px` all sides |
| Header gap (back + title) | `12px` |
| Month label section padding | `px-16px py-8px` |
| Calendar outer margin | `px-16px pb-16px` |
| Calendar internal padding | `16px` (rows, header) |
| Calendar nav height | `32px`, absolute top-16px |
| Day-of-week header top offset | `60px` from calendar top |
| Calendar grid top offset | `84px` from calendar top |
| Calendar cell height | `28px`, py-6px |
| Calendar grid gap | `4px` (x and y) |
| Requests section padding | `px-16px` |
| Section header height | `32px` |
| Gap between section header and cards | `12px` |
| Request card height | `99px` |
| Request card padding | absolute: top-16px, left-16px, right-16px |
| Gap between type row and date | `abs: top-45px` |
| Gap between date and reason | `abs: top-65px` |
| Gap between cards | `12px` (gap-[12px] in flex-col) |

### Typography Table (MANDATORY — exact Figma text style values)
| Role / Usage | font-size | font-weight | line-height | letter-spacing |
|---|---|---|---|---|
| Screen title | `18px` | `600` | `28px` | `-0.5px` |
| Month label (above calendar) | `14px` | `400` | `20px` | `0px` |
| Calendar month header | `14px` | `600` | `20px` | `0px` |
| Day-of-week label | `12px` | `400` | `16px` | `0px` |
| Calendar day number | `12px` | `400` | `16px` | `0px` |
| Today day number | `12px` | `600` | `16px` | `0px` |
| Section header ("Мої заявки") | `14px` | `600` | `20px` | `0px` |
| Request type label | `14px` | `600` | `20px` | `0px` |
| Status badge text | `12px` | `500` | `16px` | `0px` |
| Date range text | `12px` | `400` | `16px` | `0px` |
| Reason text | `12px` | `400` | `16px` | `0px` |
| "+ Нова" button text | `12px` | `600` | `24px` | `0px` |

### Border Radius Table
| Element | border-radius |
|---|---|
| Calendar card | `20px` |
| Request card | `20px` |
| Back-button circle | `9999px` |
| Today cell | `16px` |
| Absence dot | `9999px` |
| Status badge | `9999px` |
| "+ Нова" button | `32px` |

### Card border style
`all-sides` — Request cards: `1px solid rgba(255,255,255,0.08)`. Calendar card: same.

### Screen Header Safe Area
**YES** — TMA fullscreen, `paddingTop: env(safe-area-inset-top, 16px)` required.

---

## 13. Proposed Improvements (PENDING APPROVAL)

_(empty — pending user approval)_
