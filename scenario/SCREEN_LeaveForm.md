# SCREEN_LeaveForm — System Analyst Scenario (W6)

## 1. Screen Overview

The Leave Form screen (W6) is the "Нова заявка" (New Request) creation form for absence requests. Workers access it by tapping "+ Нова" from the Time Off screen (W5). The form collects: Absence Type (dropdown), Start Date (date picker), End Date (date picker), and an optional Reason (textarea). A fixed bottom "Надіслати заявку" (Submit Request) button is always visible. The form progresses through: Default (empty) → Filled (valid) → Error (validation failed) → Submitting (loading) → Success (submitted, fields locked). The screen has a back button in the header.

---

## 2. Actors

- **Worker (TMA User):** Fills and submits the absence request form.
- **Backend API:** Validates and creates the leave request; returns confirmation or validation errors.
- **Telegram WebApp:** Provides BackButton for navigation.

---

## 3. Entry Conditions (Pre-conditions)

- User is authenticated (valid JWT token).
- User came from SCREEN_TimeOff (W5) via "+ Нова" button.
- Telegram BackButton is shown.

---

## 4. Main Flow (Happy Path)

1. User taps "+ Нова" on W5 screen.
2. Frontend navigates to `/time-off/new`; Telegram BackButton appears.
3. Header renders: back-button (40×40px circle, bg `#2d2d31`, border `#3e3e42`) + title "Нова заявка" (18px semibold, `#ededed`).
4. Form renders with 4 fields (gap-16px between fields, px-16px):
   - **Field: Тип відсутності** (label 12px medium `#878787`, field 48px h, bg `#3e3e42`, border `rgba(255,255,255,0.08)`, rounded-16px, px-17px)
     - Default: placeholder "Оберіть тип" (14px regular `#525252`) + dropdown chevron icon right (16px).
   - **Field: Дата початку** (label 12px medium `#878787`, field 48px h, same styling)
     - Default: placeholder "Оберіть дату" (14px regular `#525252`) + calendar icon right (16px).
   - **Field: Дата закінчення** (label 12px `#878787`, field 48px h)
     - Default: placeholder "Оберіть дату" + calendar icon right.
   - **Field: Причина (необов'язково)** (label 12px `#878787`, textarea 96px h, bg `#3e3e42`, border, rounded-16px, p-13px)
     - Default: placeholder "Опишіть причину..." (14px regular `#525252`).
5. Submit button at bottom: bg `#f4f4f5` (disabled/empty state), 358×56px, rounded-32px, text "Надіслати заявку" (16px semibold) — text color `#878787` when form not ready.
6. User fills all required fields (Type + Start Date + End Date).
   - When Filled: field values show selected data in `#ededed`; submit button becomes active (bg `white`, text `#222226`).
   - A **Duration badge** appears below the Reason field: calendar info icon (16px) + "Тривалість: N дні" (14px regular `#ededed`).
7. User taps "Надіслати заявку".
8. Form enters **Submitting** state: button shows spinner/loading indicator.
9. Frontend calls `POST /leave-requests` with `{ type, start_date, end_date, reason }`.
10. On success: form enters **Success** state — all fields locked (read-only), values preserved, button text changes (or shows checkmark). User is guided back or navigates automatically to W5.

---

## 5. Alternative Flows

### 5.1 Back Navigation
- User taps header back button OR Telegram BackButton.
- Navigates back to W5 (Time Off screen).
- If form is dirty (has unsaved changes), optionally prompt: "Скасувати заявку?" (NON-BLOCKING).

### 5.2 Validation Error State (W6_Error)
- One or more of these conditions:
  - No absence type selected → inline error below field: "Оберіть тип відсутності".
  - End date before start date → error below end date: "Дата закінчення повинна бути після дати початку".
  - Start date in the past → error below start date: "Не можна вибрати минулу дату".
- **Error banner** appears below last form field: warning icon (small, `#ef4444`) + text "Виправте помилки перед надсиланням" (14px, `#878787` or error color).
- Submit button remains active (so user can re-attempt after fix).

### 5.3 Type Dropdown Opens
- User taps "Тип відсутності" field.
- Opens a bottom sheet or native picker with absence types:
  Відпустка | Лікарняний | Особистий день | Вихідний | Неоплачувана відпустка | Сімейна відпустка | Навчання | Інше
- On selection: field updates with chosen type (text in `#ededed`), chevron stays.

### 5.4 Date Picker Opens
- User taps "Дата початку" or "Дата закінчення".
- Opens a native device date picker or custom calendar bottom sheet.
- On selection: field shows the selected date in format "25 бер 2026" (14px `#ededed`); calendar icon remains.

### 5.5 Success State (W6_Success)
- All fields show selected/filled values (read-only appearance).
- Duration badge visible: "Тривалість: 3 дні".
- No inline errors.
- Submit button remains at bottom.

---

## 6. Edge Cases & Error States

- **End date = Start date:** Valid — 1-day absence.
- **End date before Start date:** Validation error (inline + banner).
- **Start date in the past:** Validation error — BRD rule: cannot request absence for past dates.
- **Overlapping approved absence:** Backend returns 422 → show error toast: "Цей період перекривається з вже схваленою відсутністю."
- **Network error on submit:** Show error toast "Не вдалося надіслати заявку. Спробуйте ще раз." Button reactivates.
- **Backend returns unknown error (500):** Error toast, form not cleared.
- **Reason > X characters:** Optionally show char count (if defined by backend — NON-BLOCKING).
- **Form cleared accidentally (back navigation):** Prompt or discard silently (NON-BLOCKING).

---

## 7. UI Elements & States

| Element | Type | Figma Node ID | Icon (`data-name`) | States | Behavior | Validation |
|---|---|---|---|---|---|---|
| Back button | Button | `I113:11057;113:11022` | back arrow SVG | default / pressed | 40×40px, bg `#2d2d31`, border `#3e3e42`, rounded-full | navigates back |
| Screen title | Text | `I113:11057;110:8091` | — | always | "Нова заявка", 18px semibold, `#ededed` | — |
| Form container | Container | `73:55180` | — | always | px-16px, gap-16px between fields, flex-col | — |
| Absence type label | Label | `73:55182` | — | always | "Тип відсутності", 12px medium `#878787` | — |
| Absence type field | Dropdown | `73:55184` | chevron-down SVG (16px) | empty / filled / error | 48px h, bg `#3e3e42`, border, rounded-16px, px-17px | required |
| Absence type placeholder | Text | `73:55185` | — | empty | "Оберіть тип", 14px regular `#525252` | — |
| Start date label | Label | `73:55190` | — | always | "Дата початку", 12px medium `#878787` | — |
| Start date field | Date trigger | `73:55192` | calendar SVG (16px) | empty / filled / error | 48px h, same as type field | required |
| Start date placeholder | Text | `73:55193` | — | empty | "Оберіть дату", 14px regular `#525252` | — |
| End date label | Label | `73:55199` | — | always | "Дата закінчення", 12px medium `#878787` | — |
| End date field | Date trigger | `73:55201` | calendar SVG (16px) | empty / filled / error | 48px h | required; must be ≥ start |
| End date placeholder | Text | `73:55202` | — | empty | "Оберіть дату", 14px regular `#525252` | — |
| End date error text | Inline error | `73:55457` | — | error | "Дата закінчення повинна бути після дати початку", 12px, error color | — |
| Reason label | Label | `73:55208` | — | always | "Причина (необов'язково)", 12px medium `#878787` | — |
| Reason textarea | Textarea | `73:55210` | — | empty / filled | 96px h, bg `#3e3e42`, border, rounded-16px, p-13px | optional |
| Reason placeholder | Text | `73:55211` | — | empty | "Опишіть причину...", 14px regular `#525252` | — |
| Duration badge | Info row | `73:55302` / `73:55353` | calendar-info SVG (16px) | fills-filled only | "Тривалість: N дні", 14px regular `#ededed` | auto-calculated |
| Validation error banner | Banner | `73:55408` | warning SVG (12px, ~`solar:danger-triangle-bold`) | error state | "Виправте помилки перед надсиланням", 14px `#878787` | shown on submit with errors |
| Submit button | Button | `113:11161` | — | empty/disabled / filled/active / submitting | 358×56px, rounded-32px; disabled: bg `#f4f4f5`, text `#878787`; active: bg `white`, text `#222226` | tappable when form valid |
| Submit button (submitting) | Button | — | — | submitting | shows loading spinner; disabled during request | — |

---

## 8. Screen States

| State | Description |
|---|---|
| **Default** | All fields empty; submit button muted (`#f4f4f5` bg, `#878787` text) |
| **Filled** | All required fields set; duration badge appears; button active (white bg, dark text) |
| **Error** | Validation failed; inline error(s) + error banner visible; button still tappable |
| **Submitting** | `POST /leave-requests` in-flight; button shows loading; fields locked |
| **Success** | Fields read-only; values preserved; request created |

---

## 9. Business Rules

- **BR-LF01:** Required fields: Absence Type, Start Date, End Date. Reason is optional.
- **BR-LF02:** Start Date ≤ End Date always.
- **BR-LF03:** Cannot request absence for a past start date.
- **BR-LF04:** Cannot overlap with an existing Approved absence.
- **BR-LF05:** Duration is auto-calculated: `(end_date - start_date) + 1` calendar days.
- **BR-LF06:** On submit, a `Pending` leave request is created; Manager gets a notification.
- **BR-LF07:** Absence types dropdown populated from `GET /leave-types` (or hard-coded defaults).
- **BR-LF08:** Date format displayed: "25 бер 2026" (localized month abbreviation).

---

## 10. Integrations & API Contracts

| Endpoint | Method | Request | Response | Error |
|---|---|---|---|---|
| `/leave-types` | GET | Bearer token | `[{ id, label_uk, label_en }]` | 401, 500 |
| `/leave-requests` | POST | `{ type_id, start_date, end_date, reason? }` | `{ id, status: "pending", ... }` | 401, 422 (overlap/past date), 500 |

**TMA Integration:**
- `Telegram.WebApp.BackButton.show()` on mount; `onClick` → navigate back to W5.
- `Telegram.WebApp.BackButton.hide()` on unmount.

---

## 11. Non-Functional Requirements

- Form validation is immediate (on-change for dates, on-blur or on-submit for type).
- Submit request completes < 3s on 3G.
- Form must prevent double-submission (button disabled during Submitting state).
- Screen header safe area: **YES** — `paddingTop: env(safe-area-inset-top, 16px)`.

---

## 12. Open Questions

- [NON-BLOCKING] Q1: Should the type dropdown use a native picker or a custom bottom-sheet list?
- [NON-BLOCKING] Q2: Should the date fields open a native picker or a custom calendar bottom-sheet (reusing W5 MiniCalendar)?
- [NON-BLOCKING] Q3: Is there a maximum reason text length (character limit)?
- [NON-BLOCKING] Q4: Should the success state auto-navigate back to W5, or show a success confirmation screen?
- [NON-BLOCKING] Q5: Dirty-form guard on back: prompt or silent discard?

---

## 12.1 Design-to-Code Specifics (MANDATORY — feed into Tech Stack)

### Icon Inventory (from SKILL_FIGMA_PARSE icon_inventory)
| Figma data-name | Size | Color | Component |
|---|---|---|---|
| Back arrow (SVG Component) | 18px | `#ededed` | Header back button |
| Dropdown chevron (SVG Component - variant 2) | 16px | `#525252` | Type field right icon |
| Calendar icon (SVG Component - variant 3) | 16px | `#525252` | Date fields right icon |
| Duration info icon (SVG Component - variant 1) | 16px | `#ededed` | Duration badge |
| Warning icon (SVG Component) | 12-16px | `#ef4444` or `#878787` | Error banner |

> **Use Iconify equivalents:**
> - Back: `solar:arrow-left-bold`
> - Chevron: `solar:alt-arrow-down-bold`
> - Calendar: `solar:calendar-bold`
> - Info: `solar:info-circle-bold`
> - Warning: `solar:danger-triangle-bold`

### Color Table (MANDATORY — exact Figma hex per element)
| CSS Variable | Hex value | Usage |
|---|---|---|
| `--color-bg-screen` | `#222226` | Screen root background |
| `--color-bg-card` | `#2d2d31` | Header back-button bg |
| `--color-bg-input` | `#3e3e42` | Form field backgrounds, textarea |
| `--color-text-primary` | `#ededed` | Screen title, filled field values, duration text |
| `--color-text-secondary` | `#878787` | Field labels, error banner text |
| `--color-text-muted` | `#525252` | Field placeholders |
| `--color-border-input` | `rgba(255,255,255,0.08)` | Field and textarea borders |
| `--color-border-back-btn` | `#3e3e42` | Back button border |
| `--color-btn-disabled-bg` | `#f4f4f5` | Submit button when form not valid |
| `--color-btn-disabled-text` | `#878787` | Submit button text when disabled |
| `--color-btn-active-bg` | `#ffffff` | Submit button when form valid |
| `--color-btn-active-text` | `#222226` | Submit button text when active |
| `--color-error` | `#ef4444` | Inline error text |

### Spacing Table (MANDATORY — exact Figma px values)
| Element | Padding / Gap value |
|---|---|
| Screen padding-top | `env(safe-area-inset-top, 16px)` |
| Header height | `68px`, padding `16px` |
| Header gap (back + title) | `12px` |
| Form section outer padding | `px-16px` |
| Form container alignment | items-center (centered within 390px) |
| Form field width | `350px` (w-[350px]) |
| Gap between form fields | `16px` |
| Field label height | `16px` (12px text) |
| Gap between label and input | `8px` |
| Field input height | `48px` |
| Field input padding | `px-17px py-1px` |
| Textarea height | `96px` |
| Textarea padding | `13px` |
| Duration badge padding | row height `46px`, internal icon + text gap from left `17px` + `24px` |
| Error banner height | `66px` |
| Error banner internal padding | approx `px-17px py-13px` |
| Submit button section padding | `pt-16px pb-32px px-16px` |
| Submit button height | `56px` |
| Submit button width | `358px` |

### Typography Table (MANDATORY — exact Figma text style values)
| Role / Usage | font-size | font-weight | line-height | letter-spacing |
|---|---|---|---|---|
| Screen title | `18px` | `600` | `28px` | `-0.5px` |
| Field label | `12px` | `500` | `16px` | `0px` |
| Field placeholder | `14px` | `400` | `20px` | `0px` |
| Field value (filled) | `14px` | `400` | `20px` | `0px` |
| Inline error text | `12px` | `400` | `16px` | `0px` |
| Duration badge text | `14px` | `400` | `20px` | `0px` |
| Error banner text | `14px` | `400` | `20px` | `0px` |
| Submit button text | `16px` | `600` | `24px` | `0px` |

### Border Radius Table
| Element | border-radius |
|---|---|
| Back-button | `9999px` |
| Form field / dropdown trigger | `16px` |
| Textarea | `16px` |
| Submit button | `32px` |

### Card border style
`all-sides` — All form fields: `1px solid rgba(255,255,255,0.08)`.

### Screen Header Safe Area
**YES** — TMA fullscreen, `paddingTop: env(safe-area-inset-top, 16px)` required.

---

## 13. Proposed Improvements (PENDING APPROVAL)

_(empty — pending user approval)_
