# SCREEN_My_Tasks — System Analyst Scenario

> **Figma Section:** `W1: Мої замовлення` (node `77:5261`)
> **Primary screen node (dark/populated):** `74:4556`
> **Figma URL:** https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=77-5261

---

## 1. Screen Overview

The **My Tasks** screen (W1) is the home screen for the **Worker** role in the Larko Telegram Mini App. It displays a vertical scrollable feed of order/task cards assigned to the currently authenticated worker. The screen acts as the primary entry point after authentication and supports four major screen states: **loading** (skeleton cards), **populated** (task cards feed), **empty** (no tasks assigned), and **error** (failed to load data). Workers can filter tasks by status tab and navigate to Order Hub detail via a card tap.

This screen is the first tab in the Worker's bottom navigation bar (`Tasks` · `Balance` · `Profile`).

---

## 2. Actors

| Actor | Role in screen |
|-------|---------------|
| **Worker** | Primary user. Opens the TMA, sees their assigned tasks. Interacts with cards and filter tabs. |
| **Telegram WebApp** | Provides `initData` for auth context. Controls safe‑area insets and color scheme. |
| **Backend API** | Returns the list of tasks assigned to this worker. Sources task statuses, deadlines, amounts. |
| **Manager/System** | Assigns tasks to the worker — indirect actor. Their actions trigger card appearance on this screen. |

---

## 3. Entry Conditions (Pre-conditions)

1. Worker has opened the Larko Telegram Mini App via bot or direct link.
2. Authentication has completed (`POST /auth` with `initData` returned a valid token).
3. Worker is a member of exactly one active Company (or has selected an active company via the Company Switcher).
4. The worker is on the `Tasks` tab (bottom nav index 0) — this is the default home route.

---

## 4. Main Flow (Happy Path)

1. **Worker** opens the TMA → Telegram WebApp initializes and ready() is called.
2. **Frontend** retrieves auth token from session / re-authenticates via `initData`.
3. **Frontend** shows **Loading State** (skeleton cards) while fetching tasks.
4. **Frontend** calls `GET /tasks?workerId={id}&status=active` (or equivalent endpoint).
5. **Backend** returns list of tasks assigned to this worker, filtered by active statuses (New, In Progress, Blocked, Checking/In Review).
6. **Frontend** sets default filter tab: **"Усі"** (All).
7. **Frontend** renders the task cards feed (Cards Feed), ordered by deadline ascending.
8. **Worker** sees the populated screen with task cards and status filter tabs.
9. **Worker** can:
   - Tap a status filter tab → list filters to that status.
   - Tap **▶ Почати роботу** (Start Work) button on a card → navigates to Order Hub.
   - Tap **solar:route-bold** route icon → opens navigation/map for the task address.
   - Tap **+ Додати / ✓ Завершити** buttons (visible on multi-action cards).
10. Screen is the persistent home while on `Tasks` tab.

---

## 5. Alternative Flows

### 5.1 Empty State — No Active Tasks
- Backend returns an empty array for active tasks.
- Frontend renders **Empty State** screen:
  - Icon (empty task illustration — Component 2, 64×64px).
  - Title `"Немає активних завдань 🎉"` (h4, 18px).
  - Subtitle text `"У вас немає призначених завдань на сьогодні. Відпочивайте або перевірте пізніше."` (p, 13px, centered, max-width ~242px).
  - `[Button: Оновити]` (108×40px) → re-triggers API call.

### 5.2 Error State — Load Failed
- Network timeout, 5xx, or auth failure.
- Frontend renders **Error State** screen:
  - Error icon (Component 1/2, 64×64px centered).
  - Title `"Помилка завантаження"` (h4).
  - Subtitle `"Не вдалося завантажити завдання. Перевірте інтернет-з'єднання та спробуйте ще раз."`.
  - `[Button: Спробувати знову]` (175×40px) → re-triggers full data fetch.

### 5.3 Filter Tab Active — Filtered View
- Worker taps a filter tab: `Усі (5)`, `Нові (2)`, `В процесі (3)`, `Виконані`.
- Frontend filters task list to show only cards matching the selected status.
- Tab with active state: white background pill (`bg-[color/white/solid]`), text `#222226`.
- Inactive tabs: border-only pill with `#878787` text.

### 5.4 Single-Worker Card (No "+ Додати" Button)
- Card has only a `▶ Почати роботу` CTA button.
- Applicable when card type is service/fixed (not composite multi-action).
- Payment shows `₴12,400` (fixed amount format).

### 5.5 Multi-Action Card (With "+ Додати" + "✓ Завершити")
- Card bottom row shows two buttons side-by-side: `[+ Додати]` (155×32px, outlined) + `[✓ Завершити]` (155×32px, filled white).
- Applicable when task status is "В процесі" (In Progress) and worker can report progress.

### 5.6 Quantity-Based Task Card (No Route Button Variant)
- Card shows `solar:layers-linear` icon + `"12 од."` (quantity indicator) in the bottom-left.
- Price displays as `₴400/шт` (per-unit price format).
- No `[▶ Почати роботу]` button row — card is shorter (184px height vs 228px).

---

## 6. Edge Cases & Error States

| # | Condition | Expected Behavior |
|---|-----------|-------------------|
| E-01 | Network timeout > 10s on initial load | Show Error State (5.2) with retry button |
| E-02 | 401 Unauthorized (token expired) | Redirect to auth flow; re-authenticate via `initData` |
| E-03 | Task list returns > 20 items | Paginate or virtualize list; maintain scroll position on filter switch |
| E-04 | Deadline is today | Show deadline text in normal color; no special highlight visible in Figma |
| E-05 | Deadline is overdue (past) | Date text rendered in **error red** (`#f87171`) instead of `#ededed` |
| E-06 | Status badge = Overdue | Border-left color = `#f87171` (error); badge bg `rgba(248,113,113,0.1)` |
| E-07 | Status badge = In Progress (В процесі) | Border-left color = `#fbbf24` (warning/yellow) |
| E-08 | Status badge = New (Новий) | Border-left color = `#60a5fa` (info/blue) |
| E-09 | Status badge = Checking (Перевіряється) | Border-left color = `#60a5fa` (info/blue); badge width 125px |
| E-10 | Status badge = Dispute (Диспут) | Border-left color = `#fdba74` (pending) |
| E-11 | Task notes/instructions absent | Note chip (`bg-input` pill with `majesticons:note-text` icon) is hidden |
| E-12 | Pull-to-refresh gesture | Re-fetches task list; shows skeleton state briefly |
| E-13 | Worker belongs to no company | Show error state with message prompting to contact Manager |
| E-14 | Worker is deactivated | 403 response → show error screen with "Contact your manager" message |
| E-15 | Long task name (>30 chars) | Task name wraps to 2 lines (card height adjusts: 228→198→reduced variants visible in Figma) |

---

## 7. UI Elements & States

| Element | Type | Figma Node ID | Icon (`data-name`) | States | Behavior | Validation / Notes |
|---------|------|---------------|-------------------|--------|----------|--------------------|
| Screen root | Container | `74:4556` | — | bg `#222226` | Fullscreen TMA view | safe-area-inset-top required |
| **Header** (DivPx) | Component | `110:8257` | — | Static | Shows title + company avatar | 68px height, p-16px |
| Screen title "Мої Завдання" | Text | `node-109_7982` | — | Static | h4, 18px, semibold, tracking -0.5px | `#ededed`, PascalCase |
| Company avatar bubble | Div | `110:8105` | — | Static | 40×40px circle, white bg, text "СД" | Initials of company name |
| **Filter Tabs** (Component 14) | Tab bar | `109:7890` | — | active / inactive | Filters task list by status | Pill shape, 34px high, horizontal scroll |
| Tab — Усі (All) | Tab | `108:7626` | — | selected (white bg) / unselected (border) | Filters to all tasks | 14px medium, `#222226` when selected |
| Tab — Нові | Tab | `104:5862` | — | selected / unselected | Filters to New | Count shown in parentheses |
| Tab — В процесі | Tab | `108:7628` | — | selected / unselected | Filters to In Progress | Count shown |
| Tab — Виконані | Tab | `108:7630` | — | selected / unselected | Filters to Done | No count |
| **Cards Feed** | Scrollable list | `74:4573` | — | loading / empty / populated | Vertical scroll, gap-12px, p-16px | `overflow-auto` |
| **Task Card** | Card | `74:4574` (Card 1) | — | default / active / overdue / checking | Rounded 20px, bg `#2d2d31`, border-left-only | Shadow: `0px_4px_24px_0px_rgba(0,0,0,0.4)` |
| Card: Task name | Text | `74:4577` | — | default | 16px bold Inter, `#ededed`, 1-2 lines | max-width 257px |
| Card: Status badge | SpanTextLStatusSuccess | `110:8019` | `dot (inline)` | New / In Progress / Overdue / Done / Dispute / Checking | Pill, 12px medium, colored | `border-left` color matches status |
| Card: Company icon | Icon | `192:6198` | `mdi:company` | — | 16×16px, `#9d9d9d` | `@iconify/react` |
| Card: Company name | Text | `192:6201` | — | — | 12px medium, `#9d9d9d`, Inter | May overflow |
| Card: Address icon | Icon | `192:6203` | `mdi:address-marker-outline` | — | 16×16px, `#9d9d9d` | `@iconify/react` |
| Card: Address text | Text | `192:6207` | — | — | 12px regular, `#9d9d9d` | |
| Card: Route icon | Icon | `192:6209` | `solar:route-bold` | — | 24×24px | Opens navigation. `@iconify/react` |
| Card: Notes chip | Chip | `111:8613` | `majesticons:note-text` | visible / hidden | bg `#3e3e42`, rounded-16px, h-36px | 20×20px icon, text 11px italic `#ededed` |
| Card: Notes text | Text | `111:8631` | — | — | 11px italic Inter, `#ededed`, 1 line ellipsis | |
| Card: Calendar icon | Icon | `74:4586` | **Component 1 (calendar SVG)** | — | 16×16px | Vector-based calendar icon |
| Card: Deadline text | Text | `74:4588` | — | normal / overdue | 12px regular; normal `#ededed`; overdue `#f87171` | "До 25 березня" |
| Card: Assignees bubble | Avatar group | `112:9100` | — | stacked circles | Shows initials П, C, +2 | 20×20px per bubble, overlap |
| Card: Amount | Text | `74:4597` | — | — | 14px JetBrains Mono bold `#ededed` | Format: `₴12,400` comma separator |
| Card: Quantity indicator | Text + icon | `114:11428` | `solar:layers-linear` | — | 16px icon + "12 од." | Per-unit task variant |
| Card: Per-unit price | Text | `192:6466` | — | — | 14px bold, `#ededed` | Format: `₴400/шт` |
| **"▶ Почати роботу" button** | Button | `192:6061` | — | default | h-32px, bg `#fafafa`, full-width (325px), rounded-32px | Shadow: `0px_5px_20px_0px_rgba(255,255,255,0.2)` |
| **"+ Додати" button** | Button | `192:6057` | — | default | 155×32px outlined white border, rounded-32px | Only on multi-action cards |
| **"✓ Завершити" button** | Button | `192:6064` | — | default | 155×32px, bg `#fafafa`, rounded-32px | Marks task complete |
| **Navigation Bottom Bar** | Component | `110:8377` | — | tasks selected | 64px height, positioned at bottom | Bottom nav: Tasks · Balance · Profile |
| **Skeleton/Loading** | Skeleton | `74:4885`/`74:4931` | — | dark / light variants | Rounded rect placeholders, shimmer animation | Header + 3 card skeletons |
| **Empty state icon** | Illustration | `74:4852` | — | — | 64×64px component | Centered at y=221px within flex-1 |
| **"Оновити" button** (empty) | Button | `74:4859` | — | default | 108×40px | Centers in empty state |
| **Error icon** | Icon | `83:6234` | `Component 1` (28×28px) | — | Centered in 64×64 wrapper | |
| **"Спробувати знову" button** | Button | `83:6244` | — | default | 175×40px | |

---

## 8. Screen States

| State | Trigger | What User Sees |
|-------|---------|----------------|
| **Loading** | API call in-flight | Skeleton header + 3 skeleton cards. No filter tabs visible yet |
| **Populated** | API returns ≥1 task | Filter tabs (Pill tabs) + vertical card feed |
| **Empty** | API returns 0 tasks | Centered empty state illustration + text + `[Оновити]` button |
| **Error** | Network/server error | Error icon + error text + `[Спробувати знову]` button |
| **Filtered** | User taps filter tab | Same card feed filtered to selected status; empty state if 0 results in filter |

---

## 9. Business Rules

| Rule ID | Rule | BRD Source |
|---------|------|-----------|
| BR-W1-01 | Only tasks/orders **assigned to the authenticated worker** are shown. No cross-worker visibility. | BRD §2 Worker — My Tasks: "Only orders assigned to this worker." |
| BR-W1-02 | Default filter is "Active" = statuses: New + In Progress + Blocked + In Review/Checking. | BRD §2 Worker — Filtering: "Active (default — New + In Progress + Blocked + In Review)" |
| BR-W1-03 | "Completed" / "Виконані" tab shows Done status orders. | BRD §2 Worker — Filtering: "Completed (Done)" |
| BR-W1-04 | Deadline displayed as date label. No specific "tomorrow = red" rule confirmed in Figma — overdue = red `#f87171` (confirmed). | BRD §2: "Deadline — red highlight if deadline is tomorrow or overdue." ⚠️ Figma shows only overdue in red. Tomorrow highlighting: [NON-BLOCKING] |
| BR-W1-05 | Status badge values: `New`, `В процесі`, `Перевіряється`, `✓ Готово`, `Прострочено`, `Диспут` mapped to colors. | Extracted from `SpanTextLStatusSuccess` component. |
| BR-W1-06 | Card left border color encodes task status visually (not all 4 sides — left only). | Confirmed in Figma: `border-l` only. |
| BR-W1-07 | Price format uses comma as thousands separator: `₴12,400`. | Confirmed from Figma text nodes. |
| BR-W1-08 | Per-unit tasks show `₴400/шт` format with `solar:layers-linear` quantity icon. | Extracted from Card 7 / Card 6 in Figma. |
| BR-W1-09 | Button `▶ Почати роботу` navigates to Order Hub (sub-screen). | BRD §2 Worker: "`[Tap: Order Card]` → Opens Order Hub" |
| BR-W1-10 | Multi-worker tasks show assignee avatar bubbles (overlapping circles with initials). | Figma: `112:9100` — shows П, C, +2 bubbles. |
| BR-W1-11 | Bottom navigation: `Tasks` (active) · `Balance` · `Profile`. Worker cannot access Manager screens. | BRD §2 Worker: "Bottom Navigation: Tasks · Balance · Profile" |
| BR-W1-12 | Empty state active tab: `"Немає активних завдань 🎉"`. | BRD §2 Worker — Empty state + Figma text. |

---

## 10. Integrations & API Contracts

> ⚠️ Endpoints are inferred from design + BRD. Exact API contract defined by IT.

| Endpoint | Method | Request | Response | Error codes |
|----------|--------|---------|----------|-------------|
| `/auth` | POST | `{ "initData": "string" }` | `{ "token": "jwt", "user": { "id", "name", "companyId" } }` | 401 |
| `/tasks` or `/orders` | GET | `?workerId={id}&status=active` (or `all`) | `{ tasks: Task[] }` | 401, 403, 500 |
| `/tasks/{id}/start` | POST or PATCH | `{ "status": "in_progress" }` | `{ task: Task }` | 401, 404, 409 |

**TMA Integration:**
- `Telegram.WebApp.ready()` called on screen mount.
- `Telegram.WebApp.expand()` called to ensure fullscreen layout.
- `Telegram.WebApp.initData` passed verbatim to `/auth` endpoint.
- `Telegram.WebApp.colorScheme` used to determine dark/light theme.
- Safe-area-inset-top applied using `env(safe-area-inset-top)` for header offset.

---

## 11. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Initial task list must render within 1.5s on 3G. Skeleton state shown immediately on load. |
| **Accessibility** | Status badges must not rely on color alone — text label required. WCAG 2.1 AA minimum. |
| **Offline** | Graceful error state on no connection. No offline data caching required at MVP. |
| **Localization** | UI language: Ukrainian (🇺🇦) by default. English (🇬🇧) selectable in Worker Profile. |
| **Responsiveness** | Fixed 390px design width (Telegram WebApp default). Safe-area on all phone models. |
| **Security** | `initData` must never be logged to console or localStorage. API calls authenticated via Bearer token. |
| **Scroll** | Card feed must be smoothly scrollable (`overflow-auto`). Bottom nav is fixed; content scrolls behind it. |
| **Theme** | Dark theme per Figma. Light variants exist in Figma (W1-screen-empty-light, W1-loading-light) — implementation at discretion unless explicitly toggled by user. |

---

## 12. Open Questions

| ID | Question | Priority | Status |
|----|----------|----------|--------|
| Q1 | `[NON-BLOCKING]` Does "tomorrow" deadline trigger a yellow/orange highlight, or only overdue (past) turns red? Figma only shows overdue-red. | NON-BLOCKING | Open |
| Q2 | `[NON-BLOCKING]` Is there a "pull-to-refresh" gesture, or only the `[Оновити]` button for manual refresh? | NON-BLOCKING | Open |
| Q3 | `[NON-BLOCKING]` What is the exact API endpoint name and full query parameters for fetching worker tasks? | NON-BLOCKING | IT to define |
| Q4 | `[NON-BLOCKING]` Does the `solar:route-bold` icon tap open a Telegram native map, external Google Maps, or in-app map? | NON-BLOCKING | Open |
| Q5 | `[NON-BLOCKING]` Are filter tab counts (e.g. "Нові (2)") real-time from the API or calculated client-side? | NON-BLOCKING | Open |
| Q6 | `[NON-BLOCKING]` In the Figma "W1-loading-dark/light" frames, does the filter tab row (`div.px-4` skeleton) appear or not during loading? It appears in the loading frame but as skeletons — should real filter tabs appear only after data loads? | NON-BLOCKING | Open |

---

## 12.1 Design-to-Code Specifics (MANDATORY — feed into Tech Stack)

### Icon Inventory (from SKILL_FIGMA_PARSE icon_inventory)

| Figma data-name | Node ID | Size | Color | Component used in |
|-----------------|---------|------|-------|-------------------|
| `mdi:company` | `192:6198` | 16px | `#9d9d9d` | TaskCard — company row |
| `mdi:address-marker-outline` | `192:6203` | 16px | `#9d9d9d` | TaskCard — address row |
| `solar:route-bold` | `192:6209` | 24px | `#ededed` | TaskCard — route button |
| `majesticons:note-text` | `111:8627` | 20px | `#ededed` | TaskCard — notes chip |
| `solar:layers-linear` | `114:11428` | 16px | `#9d9d9d` | TaskCard (quantity variant) |

### Color Table (MANDATORY — exact Figma hex per element)

| CSS Variable | Hex value | Usage |
|---|---|---|
| `--color-bg-screen` | `#222226` | Screen root background (`dark/color/bg/primary`) |
| `--color-bg-card` | `#2d2d31` | Task card / elevated bg (`dark/color/bg/card`) |
| `--color-bg-input` | `#3e3e42` | Notes chip background (`dark/color/bg/input`) |
| `--color-text-primary` | `#ededed` | Task title, deadline, amount (`dark/color/content/primary`) |
| `--color-text-secondary` | `#9d9d9d` | Company name, address text (`dark/color/content/secondary`) |
| `--color-text-secondary-muted` | `#878787` | Filter tab labels inactive (`dark/color/content/secondary` variant) |
| `--color-text-dark` | `#222226` | Start Work button text (on `#fafafa` bg) |
| `--color-accent-primary` | `#ffffff` | "+ Додати" button border + text (`dark/color/accent/primary`) |
| `--color-bg-button` | `#fafafa` | "Почати роботу" / "Завершити" button bg (`light/color/bg/primary`) |
| `--color-status-info` | `#60a5fa` | New / Checking status — border-left + badge |
| `--color-status-warning` | `#fbbf24` | In Progress status — border-left + badge |
| `--color-status-error` | `#f87171` | Overdue status — border-left + badge + deadline text |
| `--color-status-success` | `#34d399` | Done status — badge text |
| `--color-status-pending` | `#fdba74` | Dispute status — border-left + badge |

### Spacing Table (MANDATORY — exact Figma px values)

| Element | Padding / Gap value |
|---------|---------------------|
| Screen header (DivPx) | `p-16px`, height `68px` |
| Filter tab bar | `pl-16px`, height `34px` |
| Cards Feed outer container | `p-16px`, `gap-12px` |
| Card internal (all sides) | `pl-17px pr-16px py-16px` (**left=17** for border-left clearance) |
| Card internal gap between sections | `gap-12px` |
| Card → Company/Address row | `gap-8px` between icon and text; `gap-4px` between rows |
| Notes chip internal padding | `p-8px` |
| Notes chip → icon-text gap | `gap-8px` |
| Bottom row (deadline + amount) | `items-center justify-between` |
| Avatar bubbles overlap | `left-[44px]`, `left-[59px]`, `left-[73px]` — 14px step |
| Bottom Nav | height `64px`, positioned `bottom-0` |
| Filter tab pill padding | `px-16px py-6px` |

### Typography Table (MANDATORY — exact Figma text style values)

| Role / Usage | font-size | font-weight | font-family | line-height | letter-spacing |
|---|---|---|---|---|---|
| Screen title "Мої Завдання" | 18px | 600 (SemiBold) | Inter | 28px | -0.5px |
| Task card title | 16px | 700 (Bold) | Inter | 20px | 0px |
| Company avatar initials | 14px | 700 (Bold) | Inter | 20px | 0px |
| Company name / Address text | 12px | 500 (Medium) | Inter | 15px | 0px |
| Address text (street) | 12px | 400 (Regular) | Inter | 20px | 0px |
| Notes chip text | 11px | 400 (Regular, Italic) | Inter | 20px | 0px |
| Deadline date | 12px | 400 (Regular) | Inter | 16px | 0px |
| Amount (₴12,400) | 14px | 700 (Bold) | JetBrains Mono + Noto Sans | 20px | 0px |
| Per-unit price (₴400/шт) | 14px | 700 (Bold) | JetBrains Mono + Noto Sans | 20px | 0px |
| Quantity label (12 од.) | 14px | 400 (Regular) | Inter | 20px | 0px |
| Status badge text | 12px | 500 (Medium) | Inter | 16px | 0px |
| Filter tab text | 14px | 500 (Medium) | Inter | 20px | 0px |
| "▶ Почати роботу" button | 12px + 14px mixed span | 600 (SemiBold) | Inter | 24px | 0px |
| "+ Додати" / "✓ Завершити" | 12px | 600 (SemiBold) | Inter | 24px | 0px |
| Empty state title | 18px | — (inferred medium) | Inter | 28px | 0px |
| Empty state subtitle | 13px | 400 | Inter | ~18px | 0px |

### Border Radius Table

| Element | border-radius |
|---------|---------------|
| Task card | `20px` |
| Notes chip | `16px` |
| Status badge | `9999px` (pill) |
| Filter tab pill | `9999px` |
| "Start Work" / CTA button | `32px` |
| "+ Додати" button | `32px` |
| Company avatar | `9999px` (circle) |
| Avatar bubbles | `999px` |

### Shadows

| Element | CSS shadow |
|---------|-----------|
| Task card | `0px 4px 24px 0px rgba(0, 0, 0, 0.4)` + inner `inset 0px 1px 0px 0px rgba(255,255,255,0.05)` |
| Company avatar | `0px 4px 24px 0px rgba(0, 0, 0, 0.4)` |
| "Start Work" button | `0px 5px 20px 0px rgba(255, 255, 255, 0.2)` |
| "+ Додати" button (ghost) | `0px 5px 15px -3px rgba(255,255,255,0.2), 0px 4px 6px -4px rgba(255,255,255,0.2)` |

### Price/Number Formats
- Regular task amount: `₴12,400` — comma as thousands separator, no decimal.
- Per-unit price: `₴400/шт` — no thousands separator when < 1000, `/шт` suffix.

### Card border style
`left-only` — `border-l` only. The border color encodes the task status. **Do NOT apply border on all 4 sides.**

### Screen Header Safe Area
**YES** — This is a fullscreen TMA screen. Apply `padding-top: env(safe-area-inset-top)` to the screen header container or root wrapper. Header height is 68px + safe-area.

---

## 13. Proposed Improvements (PENDING APPROVAL)

> Empty — improvements will be listed and appended only upon explicit user approval.
