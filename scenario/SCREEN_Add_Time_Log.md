# SCREEN_Add_Time_Log — System Analyst Scenario

> **Figma Section:** W2.1 — Додати облік (Full-Screen Modal)
> **Node ID:** 255:11209
> **Role:** Worker
> **Screen type:** Full-screen modal (launched from Order Hub)

---

## 1. Screen Overview

The **Add Time Log** screen is a full-screen modal form that allows a Worker to record their worked hours for a specific order on a given calendar day. It is opened from the Order Hub (W2) via the `[+ Add Time]` button. The screen has two visual zones:

1. **Form zone (top):** A card containing date, start time, end time, optional break link, optional comment text area, a computed "Hours Worked" total row, and a Save button.
2. **History zone (bottom):** A section titled "Records for [date]" that displays all previously saved time entries for this order on this day. Empty state is shown when no entries exist yet. Populated state shows `TimeEntryCard` rows, each with a time range, optional break/comment note, computed hours colored by overtime rule, and an edit (pencil) icon.

The screen supports **two product variants** visible in Figma:
- **Variant A (Per-Hour / Per-Job):** form includes Date + Start + End + Break + Comment + "Відпрацьовано [X год]" + Save.
- **Variant B (Per-Unit):** form additionally includes a **"Виконано [N м²]"** field for units completed, and the summary row shows `"[X год • N м²]"`.

The BRD describes this as the **"Add Time Bottom Sheet (Spoke)"** on the Order Hub, implemented as a full-screen modal in the TMA for proper UX.

---

## 2. Actors

| Actor | Role |
|-------|------|
| **Worker** | Primary actor. Opens form, fills and saves time log. |
| **Telegram WebApp SDK** | Provides back button, safe-area handling, back-navigation UX. |
| **MockData / API** | Stores and retrieves time log entries. |
| **Order Hub (W2)** | Parent screen. Navigates to and back from this screen. |
| **Manager** | Passive consumer — sees saved logs in Order Details. |

---

## 3. Entry Conditions (Pre-conditions)

1. Worker is authenticated and has an active session.
2. Order exists and is in status `New`, `In Progress`, or `Blocked`.
3. Worker navigates to **Order Hub → Block 3 → `[+ Add Time]`** button.
4. The button is **visible** only if no time log was yet submitted for today on this specific order (BRD Rule: "One submission per day per order").
5. Screen opens as a full-screen modal (slide-up animation) with the order number in the header: **"Додати облік • №[OrderNumber]"**.

---

## 4. Main Flow (Happy Path — Per-Hour / Per-Job)

1. Worker taps `[+ Add Time]` from Order Hub.
2. System opens the **Add Time Log** full-screen modal.
3. **Header:** displays "Додати облік • №000445" (order number) + Close (`✕`) button.
4. **Form Card (Card 7):**
   - Row 1 — **Дата (Date):** icon `radix-icons:calendar` + label "Дата" + value chip (bg `#3E3E42`, rounded-[10px]) showing today's date in Ukrainian format ("сьогодні, 27 березня").
   - Divider line (1px, `rgba(255,255,255,0.08)`).
   - Row 2 — **Початок (Start):** icon `mingcute:time-line` + label "Початок" + time chip showing "08:00".
   - Row 3 — **Кінець (End):** icon `mingcute:time-line` + label "Кінець" + time chip showing "17:00".
   - Row 4 — **`+ Додати перерву`** link (centered, color `#878787`, font-weight: 600, 17px). Tapping opens break pair sub-form (BRD: up to 5 breaks).
   - Row 5 — **Comment textarea** (`div.h-20`, bg `#3E3E42`, border `rgba(255,255,255,0.08)`, rounded-[16px], placeholder "Додайте коментар (необовʼязково)", height 48px).
   - Row 6 — **"Відпрацьовано" summary bar** (bg `rgba(52,211,153,0.1)`, rounded-[16px], height 56px):
     - Left: label "Відпрацьовано" (white, Inter Regular, 17px).
     - Right: computed value "8.0 год" (color `#34D399`, Space Grotesk Medium, 24px).
   - Row 7 — **`[Зберегти]` Button** (white bg, rounded-[32px], height 48px, full-width): icon `fluent:save-16-regular` + label "Зберегти" (color `#222226`, Inter SemiBold, 17px).
5. Worker selects or adjusts Date (date picker), Start time, End time using native TMA time inputs.
6. Worker optionally adds a break via `+ Додати перерву`.
7. System auto-computes **Net Hours** = (End − Start − total break duration). Value updates live.
8. Worker optionally enters a comment.
9. Worker taps `[Зберегти]`.
10. System saves the time log. Modal closes. Order Hub "Time Log History" block updates.

---

## 5. Alternative Flows

### 5.1 Per-Unit Order (Variant B)
- Form additionally shows a **"Виконано [N м²]"** row (icon from `IconBase` node) between "Кінець" and the break link.
- The summary bar shows **"[X год • N м²]"** format, e.g., "8.0 год • 0 м²".
- Worker enters units completed (m², pieces, etc. depending on order type).
- System includes units in log record. Summary bar updates live.

### 5.2 Midnight Shift (Work End < Work Start)
- System detects End < Start → interprets as cross-midnight shift (BRD Rule).
- Net Hours calculated correctly across midnight boundary.
- No error shown — valid state.

### 5.3 Adding Breaks
- Worker taps `+ Додати перерву`.
- Sub-form row appears: [Break Start] — [Break End] time pair + `[✕ Remove]`.
- Up to 5 break pairs allowed (BRD Rule).
- Break End must be after Break Start (accounting for midnight shift).
- Breaks must not overlap.
- Net Hours recalculated after each break pair entry.

### 5.4 Close Without Saving
- Worker taps `✕` (Close) or uses OS back gesture / Telegram Back Button.
- Modal closes without saving.
- No state change in Order Hub.

### 5.5 Already Submitted Today
- `[+ Add Time]` button is hidden on Order Hub (BRD Rule: one log per day).
- Worker cannot access this screen for the same order+day twice.
- Corrections via **Dispute workflow** (separate screen).

---

## 6. Edge Cases & Error States

| Scenario | System Behavior |
|----------|-----------------|
| Net Hours ≤ 0 (e.g., Start = End) | `[Зберегти]` disabled or validation error shown inline |
| Break End < Break Start | Inline error on break row; "Зберегти" blocked |
| Overlapping breaks | Inline error "Breaks overlap"; "Зберегти" blocked |
| Date changed to a past date where entry already exists | Validation error: "Entry already exists for this date" |
| Network error on save | Retry button + error toast; entry queued for offline sync (BRD: `sync_status: Pending`) |
| Overtime detected (Net Hours > 8) | Summary bar changes: "⏰ Overtime: [X]h at 1.5x" (based on company Overtime Rules) |
| Order status = Done | `[+ Add Time]` button hidden from Order Hub; cannot reach this screen |
| Units completed field: value 0 | Warning (not hard block): "Are you sure you completed 0 units?" |
| Cumulative units across all workers exceed order quantity | Warning banner: "Total exceeds order quantity [N]" (BRD Rule) |
| Empty date field | Defaults to today; cannot be cleared |

---

## 7. UI Elements & States

| Element | Type | Figma Node ID | Icon (`data-name`) | States | Behavior | Validation Rules |
|---------|------|---------------|--------------------|--------|----------|-----------------|
| Screen Header | Container | `I307:47114` | — | default | Title "Додати облік • №[OrderNumber]" + Close button | Read-only |
| Close Button (✕) | Icon Button | `I307:47114;298:21294` | Cross SVG | default, pressed | Closes modal without saving | — |
| Date Row | SelectField | `255:11098` | `radix-icons:calendar` (20px, #ededed) | default, focused | Shows today; tapping opens date picker | Cannot be empty |
| Start Time Row | SelectField | `255:11108` | `mingcute:time-line` (20px, #ededed) | default, focused | Time picker HH:MM | Required |
| End Time Row | SelectField | `255:11121` | `mingcute:time-line` (20px, #ededed) | default, focused | Time picker HH:MM | Required; logic: end < start = midnight shift |
| Add Break Link | TextButton | `255:11119` | — | default, pressed | Toggles break sub-form rows | Up to 5 break pairs |
| Break Row (pair) | Sub-form row | — | — | default, error | Break Start + End time-pickers + remove button | End > Start; no overlap |
| Comment Textarea | TextField | `255:11132` | — | empty, filled | Optional free text input | Max 500 chars (inferred) |
| "Відпрацьовано" Summary Bar | DisplayRow | `255:11134` | — | normal (≤8h), overtime (>8h) | Shows computed net hours in `#34D399`; OT state changes to warning color | Auto-computed; read-only |
| "Виконано" Units Row (Variant B) | InputField | `307:48128` | `IconBase`—task icon (20px) | default, filled | Value "N м²" | ≥ 0 |
| Save Button | Button | `307:47182` | `fluent:save-16-regular` (24px, #222226) | default, disabled, loading | Saves log on tap | All required fields valid |
| Records Section Header | Text + Counter | `255:11203` | — | empty, populated | "Записи за [date]" + total hours counter on right | — |
| TimeEntryCard | Card | `265:11607` | `IconBase` clock (16px, #ededed) | default, overtime, warning | Shows "HH:MM - HH:MM", comment subtitle, hours right-aligned + edit icon | — |
| TimeEntryCard hours (normal ≤8h) | Text | `265:11617` | — | green | Values like "8.0 год", color `#34D399` | — |
| TimeEntryCard hours (warning >8h) | Text | `265:11646` | — | warning | Values like "11.0 год", color `#fbbf24` | — |
| TimeEntryCard Edit Button | IconButton | `307:47208` | `PencilIcon` SVG (24px) | default | Opens Edit Time Log modal (BottomSheet editing — separate screen, see note §12) | — |
| Empty State (no records) | EmptyState | `261:11397` | `material-symbols:work-history-outline` (32px, icon on bg #2d2d31) | empty | Shows "Немає записів" + subtitle "За обраний день ще нічого не додано" | — |

---

## 8. Screen States

| State | Description | Trigger |
|-------|-------------|---------|
| **Empty** | Form is pre-filled with today's date + default start/end times. Records section shows empty state with `material-symbols:work-history-outline` icon. | First open for the day |
| **Form Filled** | Worker has entered start/end + optional break/comment. Net Hours computed and visible. Save button active. | User interaction |
| **Records Populated** | History section shows 1–N `TimeEntryCard` rows. Records section header shows total hours aggregated (e.g., "24.5 год"). | Previous saves exist for this date |
| **Overtime State** | Net hours > 8h threshold. Summary bar may change style. TimeEntryCard hours show `#fbbf24` (warning color). | Auto-calculated |
| **Validation Error** | Inline error on affected field. Save button disabled. | Invalid input |
| **Saving (Loading)** | Save button shows spinner/loading state. | On tap of Save |
| **Network Error** | Error toast + retry. Entry queued offline. | No connectivity |

---

## 9. Business Rules

| Rule ID | Description | BRD Source |
|---------|-------------|------------|
| BR-TL-001 | **One time log per day per order per worker.** After saving, the "Add Time" button is hidden and the entry becomes read-only. Corrections go through the Dispute workflow. | BRD §Order Hub: "One submission per day" |
| BR-TL-002 | **Net Hours = (Work End − Work Start − total break time).** Must be > 0. | BRD §Add Time Bottom Sheet |
| BR-TL-003 | **Midnight shift:** If Work End < Work Start, system treats shift as crossing midnight. Valid — no error. | BRD §Validation rules |
| BR-TL-004 | **Break validation:** Break End must be after Break Start. Breaks must not overlap. Maximum 5 break pairs. | BRD §Validation rules |
| BR-TL-005 | **Overtime threshold:** Configurable per Company (default 8h/day). If Net Hours > threshold → overtime hours computed. Display may show overtime indicator. | BRD §Company Settings: Overtime Rules |
| BR-TL-006 | **Units Completed (Per-Unit orders only):** Optional ≥ 0. Warning if cumulative across all workers exceeds order quantity. | BRD §Add Time Bottom Sheet: "Units Completed" |
| BR-TL-007 | **Order must not be in "Done" status** for time logging to be accessible. | BRD §Order Hub (Add Time button visibility) |
| BR-TL-008 | **Offline support:** Entries may be queued as `sync_status: Pending` if no connectivity. Synced when connection restored. | BRD §Time Logs data schema |
| BR-TL-009 | **Photo upload (not on this screen):** Photos are added via separate "Add Photo" action in Order Hub Block 5, not in the time entry form. | BRD §Order Hub Block 5 |
| BR-TL-010 | **Rate snapshot:** The rate locked at order creation is used for payroll calculation. Worker does not see rate in this form. | BRD §Rate Snapshot Rule |

---

## 10. Integrations & API Contracts

| Endpoint | Method | Request | Response | Error Codes |
|----------|--------|---------|----------|-------------|
| `GET /orders/:orderId/time-logs?date=YYYY-MM-DD` | GET | — | `[{ id, workStart, workEnd, breaks, netHours, unitsCompleted, comment, syncStatus }]` | 404 (order not found), 403 (not assigned) |
| `POST /orders/:orderId/time-logs` | POST | `{ logDate, workStart, workEnd, breaks, netHours, unitsCompleted?, comment? }` | `{ id, netHours, syncStatus }` | 400 (validation fail), 409 (duplicate for date), 403 (order Done or not assigned) |
| `PUT /orders/:orderId/time-logs/:logId` | PUT | `{ workStart, workEnd, breaks, unitsCompleted?, comment? }` | Updated log object | 400, 403, 404 |
| `DELETE /orders/:orderId/time-logs/:logId` | DELETE | — | 204 No Content | 403 (only before order is Done) |

**TMA Integration:**
- `Telegram.WebApp.BackButton.show()` — shown when modal is open; triggers close-without-save.
- `Telegram.WebApp.MainButton` — optionally used as "Save" trigger on mobile keyboard dismiss.
- Safe Area: `env(safe-area-inset-top)` used for header padding.

---

## 11. Non-Functional Requirements

| Requirement | Value |
|-------------|-------|
| **Performance** | Net Hours computed client-side in < 50ms. Save response < 2s on 3G. |
| **Accessibility** | WCAG 2.1 AA. Time inputs are tapable elements ≥ 44×44px. |
| **Offline** | Entry queued locally on network failure. Synced automatically on reconnect. |
| **Security** | Worker can only post time logs for orders assigned to them. No rate/payroll data visible. |
| **Language** | All labels in Ukrainian (UA locale). Numbers in format: `8.0 год`, `24.5 год`. |
| **Safe Area** | Full-screen modal requires `padding-top: env(safe-area-inset-top)`. |
| **Animation** | Slide-up entrance animation on modal open. |

---

## 12. Open Questions

- [NON-BLOCKING] Q1: Does tapping the **Date chip** open a native Telegram date picker or a custom calendar bottom sheet? Figma does not annotate the picker type.
- [NON-BLOCKING] Q2: Does tapping the **Start/End time chips** open a native `<input type="time">` or a custom TMA drum-roll picker?
- [NON-BLOCKING] Q3: **Edit flow for existing TimeEntryCard** — the pencil icon is visible. The BRD says "after submitting, entry becomes read-only. Corrections via dispute workflow." Figma shows a pencil icon. → Is the pencil icon for **editing before finalizing** (within the same session, before closing modal), or is editing allowed at any time via a separate Edit BottomSheet? The Figma note at node level says "1. Треба BottomSheet редагування" (§255:11209 section label) — confirming a separate **Edit Time BottomSheet** is needed. **[BLOCKING for edit sub-screen scope, but NOT blocking for Add flow]**.
- [NON-BLOCKING] Q4: Is the **total hours counter** in the Records section header ("24.5 год") the aggregate of ALL entries for this date across ALL orders, or only for the current order?
- [NON-BLOCKING] Q5: Are the M² / units labels in TimeEntryCard visible only for Per-Unit orders, or always?

---

## 12.1 Design-to-Code Specifics (MANDATORY — feed into Tech Stack)

> **Source:** Extracted from `get_variable_defs` and `get_design_context` on node `255:11093` and `255:11209`.

### Icon Inventory

| Figma `data-name` | Size | Color | Component |
|-------------------|------|-------|-----------|
| `radix-icons:calendar` | 20px | `#EDEDED` | Date Row |
| `mingcute:time-line` | 20px | `#EDEDED` | Start Row, End Row |
| `material-symbols:work-history-outline` | 32px | (on card bg) | Empty State |
| `fluent:save-16-regular` | 24px | `#222226` | Save Button (icon) |
| `PencilIcon` (custom SVG, data-name: `PencilIcon`) | 24px | `#EDEDED` | TimeEntryCard edit button |
| `IconBase` (clock icon SVG) | 16px | `#EDEDED` | TimeEntryCard time row left icon |
| `IconBase` (task/cube icon) | 20px | (inherited) | Variant B "Виконано" row left icon (node `307:48142`) |

### Color Table

| CSS Variable | Hex Value | Usage |
|---|---|---|
| `--color-bg-primary` | `#222226` | Screen root background |
| `--color-bg-card` | `#2D2D31` | Form card, TimeEntryCard background |
| `--color-bg-input` | `#3E3E42` | Date/Time chips, Comment textarea background |
| `--color-text-primary` | `#EDEDED` | Labels: "Дата", "Початок", "Кінець", "Відпрацьовано" |
| `--color-text-secondary` | `#878787` | "Додайте коментар" placeholder, "+ Додати перерву" link |
| `--color-border-subtle` | `rgba(255,255,255,0.08)` | Divider line, card border, textarea border |
| `--color-status-success` | `#34D399` | Net Hours text in summary bar, TimeEntryCard hours (≤8h entries) |
| `--color-status-warning` | `#fbbf24` | TimeEntryCard hours (>8h / overtime entries) |
| `--color-summary-bg` | `rgba(52,211,153,0.1)` | "Відпрацьовано" summary bar background |
| `--color-accent-primary` | `#FFFFFF` | Save button background, Screen title, "Записи за..." section title |
| `--color-button-text` | `#222226` | Save button label text |

### Spacing Table

| Element | Padding / Gap Value |
|---|---|
| Screen horizontal padding (form card to edges) | `16px` |
| Form card internal padding | `16px` |
| Gap between form rows inside card | `12px` |
| Date/Time chip horizontal padding | `12px` |
| Date/Time chip vertical padding | `8px` |
| Comment textarea internal padding | `13px` |
| Summary bar horizontal padding | `16px` |
| Gap between form card and records section | `24px` |
| Records section horizontal padding | `16px` |
| Gap between TimeEntryCard items | `12px` |
| TimeEntryCard internal horizontal padding | `17px` |
| TimeEntryCard height | `74px` |
| TimeEntryCard internal content gap (left column) | `4px` (between time and subtitle) |
| Icon-to-label gap in form rows | `12px` |
| Icon-to-time gap in TimeEntryCard | `6px` |

### Typography Table

| Role / Usage | font-size | font-weight | font-family | line-height | letter-spacing |
|---|---|---|---|---|---|
| Screen title ("Додати облік • №...") | `17px` | `600` (SemiBold) | Inter | `20.4px` | `-0.43px` |
| Form row label ("Дата", "Початок") | `17px` | `400` (Regular) | Inter | `20.4px` | `-0.43px` |
| Chip values ("сьогодні, 27 березня", "08:00") | `15px` | `500` (Medium) | Space Grotesk | `18px` | `0px` |
| "+ Додати перерву" link | `17px` | `600` (SemiBold) | Inter | `20.4px` | `-0.43px` |
| Comment placeholder | `15px` | `400` (Regular) | Inter | `18px` | `-0.23px` |
| "Відпрацьовано" label | `17px` | `400` (Regular) | Inter | `20.4px` | `-0.43px` |
| Net Hours value ("8.0 год") | `24px` | `500` (Medium) | Space Grotesk | `28.8px` | `0px` |
| Save Button label | `17px` | `600` (SemiBold) | Inter | `20.4px` | `-0.43px` |
| Records header ("Записи за ...") | `18px` | `600` (SemiBold) | Inter | `28px` | `-0.44px` |
| Records total hours ("24.5 год") | `15px` | `400` (Regular) | Inter | `18px` | `-0.23px` |
| TimeEntryCard time range ("08:00 - 17:00") | `15px` | `500` (Medium) | Space Grotesk | `18px` | `0px` |
| TimeEntryCard subtitle ("Перерва 1 год") | `11px` | `400` (Regular) | Inter | `13.2px` | `0.06px` |
| TimeEntryCard hours value ("8.0 год") | `15px` | `500` (Medium) | Space Grotesk | `18px` | `0px` |

### Border Radius Table

| Element | border-radius |
|---|---|
| Form card (Card 7) | `20px` |
| Date/Time chips (input style) | `10px` |
| Comment textarea | `16px` |
| Summary bar ("Відпрацьовано") | `16px` |
| Save button | `32px` |
| TimeEntryCard | `16px` |
| Close button (✕) | `9999px` (full circle) |

### Card border style

- Form card (Card 7): **none** (no visible border, uses `bg-card` bg only)
- TimeEntryCard: **all-sides, subtle** — `1px solid rgba(255,255,255,0.08)`
- Comment textarea: **all-sides, subtle** — `1px solid rgba(255,255,255,0.08)`

### Screen Header Safe Area

**YES** — Full-screen TMA modal. Header requires `padding-top: env(safe-area-inset-top)`.

### Price/Number Formats

- Hours format: `8.0 год`, `24.5 год`, `11.0 год` — Space Grotesk, 1 decimal place.
- Units format: `0 м²`, `130 м²` — Space Grotesk, integer (no decimal for units).
- Combined: `8.0 год • 130 м²` — bullet separator.

---

## 13. Proposed Improvements (PENDING APPROVAL)

_Not yet approved. Will be populated upon user confirmation._
