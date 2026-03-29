# SCREEN_Order_Hub — System Analyst Scenario

> **Figma Section:** W2 — `node-id=298:26477`
> **Figma Primary Frame:** `114:11513` (New/In-Progress state)
> **Figma URL:** https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=298-26477&m=dev

---

## 1. Screen Overview

The **Order Hub** (W2) is a Worker-facing read-only dashboard that displays comprehensive details for a single assigned order. It serves as the central command center for a task — aggregating the order header info, full description/instructions, a time-tracking block (time accounting widget), a photo gallery, a location map mini-widget, and contextual action buttons. Workers open this screen by tapping any task card on the W1 My Tasks screen. The screen appearance **adapts dynamically** based on the current order status: New/In-Progress, Overdue, Pending Confirmation (Перевіряється), Completed+Locked (Готово), and Dispute (Диспут). Order details are read-only; all data entry (time, photos) occurs via inline actions that will open dedicated forms.

---

## 2. Actors

- **Worker** — the authenticated Telegram user who is assigned to this order. Primary consumer of this screen.
- **Backend API** — provides order data, time logs, photos, and dispute status.
- **Manager** — initiates disputes; Worker responds here. Not directly in this screen but their actions affect displayed state.
- **Telegram WebApp** — provides native back navigation and safe-area insets.

---

## 3. Entry Conditions (Pre-conditions)

1. Worker is authenticated (TMA session valid).
2. Worker has at least one order assigned to them (navigated from W1 My Tasks).
3. The order `id` is passed as route parameter to this screen.
4. Network is available OR order data is cached in local state.

---

## 4. Main Flow (Happy Path — New / In Progress)

1. Worker taps an order card on W1 My Tasks screen.
2. System navigates to W2 Order Hub for the selected order.
3. Screen renders:
   - **Header bar:** Back button (`<`) + "Замовлення №XXXXXX" title
   - **Block 1 — Order Info Card** (white-left-border, status-based color):
     - Order name (e.g., "Встановлення сонячної станція №4")
     - Status badge (e.g., `●Новий`, `В процесі`, etc.)
     - Deadline with calendar icon (e.g., "до 20 березня")
     - Amount/rate: ₴12,400 (Space Grotesk, comma format)
   - **Block 2 — Description Panel** (input-bg card): 
     - `majesticons:note-text` icon + italic instruction text (multiline)
     - "Детальніше" expandable link (`material-symbols:expand-all-rounded` icon)
   - **Block 3 — Time Tracking Card** (`Облік`):
     - `majesticons:clock-line` icon + "Облік" heading
     - Large numeric total hours (e.g., "0.0 год")
     - Two buttons: [history icon button] + [+ Додати] button
   - **Block 4 — Photo Gallery Card** (`Фото роботи`):
     - `majesticons:camera-line` icon + "Фото роботи" heading
     - Photo thumbnails (if any) with remove (×) buttons, `+Додати` dashed slot
   - **Block 5 — Map Mini-Widget**: 
     - Static map thumbnail (100px high), gradient overlay, blurred location chip with pin icon + address text
   - **Block 6 — Report Issue Button** (`⚠️ Повідомити про проблему`):
     - Red-tinted pill button, visible for New/In-Progress/Overdue
   - **Footer — Primary CTA Button** (`Почати роботу` or `Завершити роботу`):
     - White pill button at bottom, changes label based on status

4. Worker can tap "Детальніше" to expand the full instruction block.
5. Worker taps `[+ Додати]` in the Time Tracking card → navigates/opens time-entry form.
6. Worker taps `[+ Додати]` / camera slot in Photo Gallery → opens camera/gallery picker.
7. Worker taps `[Повідомити про проблему]` → opens Report Issue bottom sheet.
8. Worker taps `[Почати роботу]` → changes order status to In Progress; button label changes to `Завершити роботу`.
9. Worker taps `[Завершити роботу]` → marks personal completion (sends `worker_done = true`).
10. Worker taps `<` back button → returns to W1 My Tasks.

---

## 5. Alternative Flows

### 5.1 Order is Overdue
- **Condition:** Order deadline has passed and status is not Done/Locked.
- **Screen diff vs Happy Path:**
  - Status badge changes to `Прострочено` (red pill, `#f87171`)
  - Card left border color changes to red (`#f87171`)
  - Banner appears below Order Info Card: red-bordered pill with `⚠` icon + "Прострочено на N дні" message
  - All other blocks remain active (Worker can still log time and photos).
  - CTA button label: `Завершити роботу` (if already in progress)

### 5.2 Order is Pending Manager Confirmation (Перевіряється)
- **Condition:** Worker marked their part as Done; Manager must confirm.
- **Screen diff:**
  - Status badge: `● Перевіряється` (blue pill, `#60a5fa`)
  - Card left border: blue (`#60a5fa`)
  - Banner appears: blue-bordered info banner with `ℹ` icon + "Менеджер повинен підтвердити виконання замовлення"
  - Time entry `[+ Додати]` button is **disabled** (greyed out, `rgba(82,82,82,0.3)`)
  - No primary CTA submit button visible

### 5.3 Order is Completed and Locked (Готово)
- **Condition:** Manager confirmed completion, status is `Done`.
- **Screen diff:**
  - Status badge: `✓ Готово` (green pill, `#34d399`)
  - Card left border: green (`#34d399`)
  - Green banner: "Замовлення завершено. Дані доступні лише для перегляду."
  - Time tracking card: `[+ Додати]` button replaced by `[🕐 Історія]` read-only button
  - Photo gallery: `+Додати` slot removed, only existing photos visible (no delete)
  - `[Повідомити про проблему]` button NOT visible
  - No primary CTA button
  - All data is **read-only**, no interactive actions

### 5.4 Order has Active Dispute (Диспут)
- **Condition:** Manager has contested the order/time logs.
- **Screen diff:**
  - Status badge: `● Диспут` (orange/pending pill, `#fdba74`)
  - Card left border: orange (`#fdba74`)
  - **Dispute Banner** appears (orange-bordered card, `rgba(253,186,116,0.1)` bg):
    - Alert icon + "Менеджер оскаржив замовлення" title
    - Dispute description text (Manager's claim)
    - Created timestamp (right-aligned meta: "Створено: 24 бер, 09:15")
  - **Response Form Card** appears below Dispute Banner:
    - `mdi:think-outline` icon + "Ваша відповідь" heading
    - Text area with placeholder "Напишіть пояснення..."
    - Two action buttons side by side:
      - `[Оскаржити]` — red pill (`#f87171`), left
      - `[Погодитись]` — green pill (`#34d399`), right
  - Time tracking `[+ Додати]` button **disabled** (greyed)
  - No primary CTA

### 5.5 Network Error / Data Load Failure
- Worker sees loading skeleton or error toast.
- Retry mechanism available (pull-to-refresh or retry button).
- If cached data is available (offline mode), show stale data with "Дані можуть бути застарілими" banner.

### 5.6 Order Not Found / Access Denied
- Worker taps link to order that was reassigned away or deleted.
- System shows error screen: "Замовлення не знайдено або доступ заборонено" + `[← Назад]` button.

---

## 6. Edge Cases & Error States

| # | Condition | Expected Behavior |
|---|-----------|-------------------|
| 1 | Order re-assigned while viewing | Show banner: "This order has been re-assigned" + auto-navigate back after 3s |
| 2 | Photo upload fails | Inline error toast under photos section, thumbnail shows error state |
| 3 | Photo exceeds 10MB | Validation error before upload: "Файл занадто великий (max 10MB)" |
| 4 | More than 3 photos per day | `+Додати` slot hidden after 3rd photo; tooltip: "Максимум 3 фото на день" |
| 5 | Dispute response empty on submit | Inline validation: "Необхідно написати пояснення" |
| 6 | Time entry already submitted today | `[+ Додати]` hidden; entry shows `✅ Відправлено` (read-only) |
| 7 | Order deadline changes during view | Deadline display updates on next data refresh |
| 8 | Map fails to load | Greyed placeholder with map icon, no address overlay |
| 9 | Long order name overflow | Title truncates with `...`, tap to expand (or natural wrap up to 2 lines) |
| 10 | Network lost mid-session | Offline banner appears, data preserved in local state |

---

## 7. UI Elements & States

| ID | Element | Type | Figma Node ID | Icon (`data-name`) | States | Behavior | Validation |
|----|---------|------|--------------|-------------------|--------|----------|------------|
| `header_back_btn` | Back button | IconButton | `I298:23982;298:21180` | `ChevronRightIcon` (rotated 180°) | default, pressed | Navigate back to W1 My Tasks | — |
| `header_title` | "Замовлення №XXXXXX" | Label | `I298:23982;298:21155` | — | static | Displays order number | — |
| `order_info_card` | Order Info Card | Card | `157:7995` | — | New (blue border), InProgress (amber), Overdue (red), Checking (blue), Done (green), Dispute (orange) | `border-left-only` | — |
| `order_name` | Order Name | Text (H4) | `157:7997` | — | static | Inter SemiBold 17px | — |
| `status_badge` | Status badge | Badge | `157:7999` | — | New, InProgress, Done, Overdue, Checking, Dispute, Decline | Pill badge; color changes per status | — |
| `deadline_icon` | Calendar icon | Icon | `157:8023` | calendar icon (SVG) | static | 16×16px inline with deadline text | — |
| `deadline_text` | Deadline date | Label | `157:8024` | — | normal, overdue (red text) | Inter Medium 13px | — |
| `amount_display` | Order amount | DataDisplay | `157:8035` | — | static | Space Grotesk Medium 24px, format: `₴12,400` (comma separator) | — |
| `description_card` | Instructions Card | Card | `150:7393` | `majesticons:note-text` (20px) | collapsed, expanded | `bg-[#3e3e42]`, italic body text 15px | — |
| `expand_details_btn` | "Детальніше" | TextButton | `157:7972` | `material-symbols:expand-all-rounded` (14px) | default, expanded | Toggles full description | — |
| `time_tracking_card` | Time Tracking Card | Card | `298:22795` | `majesticons:clock-line` (20px) | active, disabled (checking/dispute), locked (done) | Shows total hours | — |
| `time_history_btn` | History icon button | IconButton | `I298:22795;298:22387` | clock/history icon | default, disabled | Opens time log history | — |
| `time_add_btn` | "+ Додати" time | Button | `I298:22795;298:22398` | — | active (`#525252`), disabled (`rgba(82,82,82,0.3)`) | Opens Add Time form | Disabled if status is Checking/Dispute/Done |
| `photos_card` | Photo Gallery Card | Card | `158:8126` | `majesticons:camera-line` (20px) | empty, with_photos, locked | — | — |
| `photo_thumbnail` | Photo thumbnail | Image | — | — | default, error | 80×80px rounded-xl, opacity 0.8 | Max 3 per day |
| `photo_remove_btn` | Photo remove (×) | IconButton | `161:9070` | × close icon | active, hidden (locked) | Removes photo from order | Hidden when order is Done |
| `photo_add_slot` | Add photo slot | DashedButton | `161:9059` | camera icon | active, hidden | Opens camera/gallery picker | Hidden when 3 photos exist or order Done |
| `map_widget` | Map mini-widget | Container | `157:8072` | — | loaded, error | 100px static map + gradient + location chip | — |
| `map_location_chip` | Location chip | Chip | `157:8075` | pin icon (SVG) | static | Blurred backdrop, 12px rounded | — |
| `report_issue_btn` | "Повідомити про проблему" | Button | `298:22880` | warning icon | active, hidden (Done) | Opens Report Issue bottom sheet | Hidden when status=Done/Locked |
| `primary_cta_btn` | Primary CTA | Button | `119:5175` | — | "Почати роботу" (New), "Завершити роботу" (InProgress/Overdue), hidden (Done/Dispute/Checking) | Triggers status change | — |
| `overdue_banner` | Overdue banner | Banner | `159:8643` | `⚠` icon | shown, hidden | Red bordered pill | Shown when overdue |
| `checking_banner` | Checking banner | Banner | `159:8624` | `ℹ` icon | shown, hidden | Blue info banner | Shown when status=Checking |
| `locked_banner` | Locked banner | Banner | `161:9085` | lock icon | shown, hidden | Green info banner | Shown when status=Done |
| `dispute_banner` | Dispute Banner | Banner | `159:8758` | alert icon (`imgFrame`) | shown, hidden | Orange card `rgba(253,186,116,0.1)` | Shown when status=Dispute |
| `dispute_response_form` | Response Form | Card | `159:8771` | `mdi:think-outline` (20px) | visible, hidden | Text area + 2 action buttons | Shown when status=Dispute |
| `dispute_reject_btn` | "Оскаржити" | Button | `161:8798` | — | default, pressed | Red `#f87171`, submits dispute response | Response text required |
| `dispute_accept_btn` | "Погодитись" | Button | `161:8790` | — | default, pressed | Green `#34d399`, accepts manager decision | — |

---

## 8. Screen States

| State ID | Name | Trigger | Visual Differences |
|----------|------|---------|-------------------|
| `S1` | **New** | Order status = New | Blue left border, `●Новий` badge, `Почати роботу` CTA, no banners |
| `S2` | **In Progress** | Order status = InProgress | Amber left border, `В процесі` badge, `Завершити роботу` CTA, full time/photo controls |
| `S3` | **Overdue** | Deadline passed + not Done | Red left border, `Прострочено` badge (red), overdue banner, `Завершити роботу` CTA |
| `S4` | **Checking** | Worker submitted done, awaiting Manager | Blue left border, `Перевіряється` badge, info banner, `[+Додати]` disabled |
| `S5` | **Locked/Done** | Manager confirmed completion | Green left border, `✓Готово` badge, green banner, all read-only, no CTA |
| `S6` | **Dispute** | Manager raised dispute | Orange left border, `●Диспут` badge, dispute banner, response form, time `[+Додати]` disabled |
| `S7` | **Loading** | Initial data fetch | Skeleton screens for each card block |
| `S8` | **Error** | Network failure, 4xx/5xx | Error toast / error state screen with retry |

---

## 9. Business Rules

| Rule ID | Rule | BRD Reference |
|---------|------|---------------|
| BR-W2-01 | Worker can only view orders assigned to them. No cross-worker data visible. | BRD §2 Role: Worker |
| BR-W2-02 | Order status pipeline: `New → In Progress → (Blocked) → In Review/Checking → Done`. Status can only advance, not revert. | BRD §3 Orders.status |
| BR-W2-03 | Only ONE time log submission per day per order allowed. After submitting, `[+ Додати]` hides and entry is read-only. | BRD §2 Order Hub, Bottom Sheet: Add Time |
| BR-W2-04 | Photo limit: max 3 photos per day per order, max 10 MB per photo. After 3 photos, add slot disappears. | BRD §2 Order Hub Block 5 |
| BR-W2-05 | Amount format: `₴12,400` — Ukrainian hryvnia, comma as thousands separator. | BRD §3 Business Data Schema |
| BR-W2-06 | Rate snapshot is locked at order creation time. The displayed amount reflects the locked rate, not current catalog rate. | BRD §2 Create Order (Rate snapshot rule) |
| BR-W2-07 | When order status is `Done`, ALL fields become read-only. `[Повідомити про проблему]` button disappears. | BRD §2 Order Hub Block 6 |
| BR-W2-08 | `[Повідомити про проблему]` is visible for all statuses except `Done/Locked`. | BRD §2 Order Hub Block 6 |
| BR-W2-09 | When Manager raises a dispute, Worker must respond with either `Оскаржити` (counter-dispute) or `Погодитись` (accept). | BRD §2 Report Issue, §3 Disputes |
| BR-W2-10 | `[Почати роботу]` CTA changes state to `In Progress`. `[Завершити роботу]` signals `worker_done = true`. Does NOT automatically close the order. | BRD §2 Order Hub Block 2 |
| BR-W2-11 | When status is `Checking` or `Dispute`, `[+ Додати]` time button is disabled. | BRD §2 Order Hub, validation |
| BR-W2-12 | Overtime (> 8h net) is highlighted in the time tracking block. | BRD §2 Add Time Bottom Sheet |

---

## 10. Integrations & API Contracts

| Endpoint | Method | Request | Response | Error codes |
|----------|--------|---------|----------|-------------|
| `/orders/{id}` | GET | `{ id: string }` | `{ id, number, name, status, deadline, amount, notes, assigned_workers[], photos[], time_logs[], location }` | 404, 403, 500 |
| `/orders/{id}/status` | PATCH | `{ status: "in_progress" \| "done" }` | `{ id, status, updated_at }` | 400, 403, 409 |
| `/orders/{id}/time-logs` | GET | — | `[ { id, date, net_hours, work_start, work_end, breaks[], units_completed, is_overtime } ]` | 403 |
| `/orders/{id}/time-logs` | POST | `{ date, work_start, work_end, breaks[], units_completed }` | `{ id, net_hours, overtime_hours }` | 400, 409 (duplicate) |
| `/orders/{id}/photos` | POST | `FormData { file, date }` | `{ id, url, thumbnail_url }` | 400, 413 (size limit) |
| `/orders/{id}/photos/{photoId}` | DELETE | `{ orderId, photoId }` | `204 No Content` | 403, 404 |
| `/orders/{id}/dispute/response` | POST | `{ action: "accept" \| "contest", explanation?: string }` | `{ status, updated_at }` | 400, 403 |

**TMA Integration:**
- `Telegram.WebApp.BackButton` — shown on mount, hidden on unmount; tapped → navigate to W1
- `Telegram.WebApp.ready()` called on screen mount
- `Telegram.WebApp.safeAreaInset.top` applied to header padding

---

## 11. Non-Functional Requirements

| Category | Requirement |
|---------|-------------|
| **Performance** | Screen TTFB < 1s on 4G; time log fetch < 500ms |
| **Accessibility** | All action buttons have accessible labels; status badges have `aria-label` |
| **Offline** | Order data cached after first load. Offline state shows banner. Time logs queued for sync when network returns (`sync_status: pending`) |
| **Security** | Worker can only access orders where they are in `assigned_workers[]`. 403 otherwise. |
| **Safe Area** | Header uses `padding-top: env(safe-area-inset-top)` for iOS notch. Bottom CTA uses `padding-bottom: env(safe-area-inset-bottom)`. |
| **Scrollability** | Full screen is scrollable. Bottom CTA is fixed/sticky. |

---

## 12. Open Questions

- [NON-BLOCKING] Q1: Should tapping `[Почати роботу]` require confirmation dialog before status change?
- [NON-BLOCKING] Q2: Should the expand/collapse "Детальніше" for description persist across sessions or reset on next open?
- [NON-BLOCKING] Q3: Is the map widget a static image or an interactive map (Leaflet/Mapbox)? BRD shows static-ish thumbnail, but implementation detail unclear.
- [NON-BLOCKING] Q4: What is the "history" icon button behavior in the Time Tracking card? Opens full time log list? Or last entry detail?
- [NON-BLOCKING] Q5: Should overtime be visually highlighted within the time tracking card total display?

---

## 12.1 Design-to-Code Specifics (MANDATORY — feed into Tech Stack)

> **Source:** All values extracted from `get_design_context` (nodeId: `114:11513`, `159:8651`) and `get_variable_defs`.

### Icon Inventory (from SKILL_FIGMA_PARSE icon_inventory)

| Figma `data-name` | Size | Color | Component Used In |
|-------------------|------|-------|-------------------|
| `majesticons:note-text` | 20px | `#ededed` | DescriptionCard |
| `material-symbols:expand-all-rounded` | 14px | `#ededed` | DescriptionCard (expand trigger) |
| `majesticons:clock-line` | 20px | `#ededed` | TimeTrackingCard |
| `majesticons:camera-line` | 20px | `#ededed` | PhotoGalleryCard |
| `mdi:think-outline` | 20px | `#ededed` | DisputeResponseForm |
| Calendar icon (SVG component) | 16px | `#ededed` | OrderInfoCard (deadline) |
| Alert/Warning icon (SVG `imgFrame`) | 16px | `#fdba74` | DisputeBanner |
| Pin/Location icon (SVG `imgContainer`) | ~10px | `#e7e5e8` | MapLocationChip |

### Color Table (MANDATORY — exact Figma hex per element)

| CSS Variable | Hex Value | Usage |
|---|---|---|
| `--color-bg-screen` | `#222226` | Screen root background |
| `--color-bg-card` | `#2D2D31` | Order info card, time tracking card, photo card |
| `--color-bg-input` | `#3E3E42` | Description card, text area |
| `--color-text-primary` | `#EDEDED` | All primary text, card titles, order name |
| `--color-text-secondary` | `#9D9D9D` / `#878787` | Meta text, disabled button labels, placeholder |
| `--color-text-muted` | `#525252` | Muted button bg |
| `--color-status-info` | `#60a5fa` | `New` + `Checking` badge, left border, banner |
| `--color-status-warning` | `#fbbf24` | `In Progress` badge |
| `--color-status-error` | `#f87171` | `Overdue` badge + border, `Оскаржити` button |
| `--color-status-success` | `#34d399` | `Done` badge + border, `Погодитись` button |
| `--color-status-pending` | `#fdba74` | `Dispute` badge + border, dispute banner |
| `--color-border-subtle` | `rgba(255,255,255,0.08)` | Subtle card borders |
| `--color-bg-primary-light` | `#FAFAFA` | Primary CTA button background |
| `--color-text-on-light` | `#222226` | CTA button text on light bg |
| `--color-dispute-bg` | `rgba(253,186,116,0.1)` | Dispute banner background |
| `--color-map-gradient` | `#0e0e0f → transparent` | Map gradient overlay |
| `--color-map-chip-bg` | `rgba(31,31,34,0.8)` | Map location chip background |

### Spacing Table (MANDATORY — exact Figma px values)

| Element | Padding / Gap Value |
|---------|---------------------|
| Screen horizontal padding | `16px` |
| Header padding | `16px` (all sides) |
| Order Info Card padding | `pl-17px pr-16px py-16px` |
| Description Card padding | `16px` |
| Time Tracking Card padding | `17px` |
| Photo Card padding | `17px` |
| Card gap (between cards in scroll) | `12px` |
| Status badge padding | `px-10px py-2px` |
| Map chip padding | `px-12px py-8px` |
| Dispute banner internal padding | `16px` |
| Response form text area padding | `13px` |

### Typography Table (MANDATORY — exact Figma text style values)

| Role / Usage | font-size | font-weight | line-height | letter-spacing |
|---|---|---|---|---|
| Header title ("Замовлення №...") | `17px` | `600` | `20.4px` | `-0.43px` |
| Order name (H4) | `17px` | `600` | `20.4px` | `-0.43px` |
| Amount / Hours (Data) | `24px` | `500` | `28.8px` | `0px` |
| Deadline date (Label/Large) | `13px` | `500` | `15.6px` | `-0.08px` |
| Description body | `15px` | `400` | `18px` | `-0.23px` |
| Button text (primary CTA) | `16px` | `600` | `24px` | `0px` |
| Button text (secondary) | `15px` | `400` | `18px` | `-0.23px` |
| Section heading ("Облік", "Фото роботи") | `17px` | `600` | `20.4px` | `-0.43px` |
| "Детальніше" text | `11px` | `400` | `13.2px` | `0.06px` |
| Status badge text | `12px` | `500` | `16px` | `0px` |
| Location chip text | `11px` | `400` | `13.2px` | `0.06px` |
| Dispute meta text (timestamp) | `11px` | `400` | `13.2px` | `0.06px` |

### Border Radius Table

| Element | border-radius |
|---------|---------------|
| Order Info Card | `20px` |
| Description Card | `16px` |
| Time Tracking Card | `20px` |
| Photo Gallery Card | `20px` |
| Map widget container | `20px` |
| Photo thumbnail | `20px` (rounded-xl) |
| Dashed add-photo slot | `20px` |
| Map location chip | `12px` |
| Status badge | `9999px` (pill) |
| Primary CTA button | `32px` (pill) |
| Report Issue button | `32px` (pill) |
| Dispute banner | `20px` |
| Response action buttons | `32px` (pill) |
| Time tracking buttons | `32px` |
| Back button | `9999px` |

### Price/Number Formats

- Amount: `₴12,400` — hryvnia sign, comma as thousands separator
- Hours: `0.0 год` — one decimal, " год" suffix, Space Grotesk 24px

### Card Border Style

Order Info Card: **`border-left-only`** — `border-l` only, NOT all 4 sides. Border color changes per status:
- New / Checking: `#60a5fa` (blue)
- In Progress: `#fbbf24` (amber) — *NOTE: check Figma for exact amber for InProgress*
- Overdue: `#f87171` (red)
- Done: `#34d399` (green)
- Dispute: `#fdba74` (orange/pending)

All other cards: `border` all sides with `rgba(255,255,255,0.08)`.

### Screen Header Safe Area

**YES** — This is a fullscreen TMA. Header must apply `padding-top: env(safe-area-inset-top)`. Bottom CTA button must apply `padding-bottom: env(safe-area-inset-bottom)`.

---

## 13. Proposed Improvements (PENDING APPROVAL)

*Section empty — awaiting user approval before adding.*
