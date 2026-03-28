# SCREEN_W6_NewRequest — System Analyst Scenario

**Figma Section:** `90:8990` | **Screen ID:** W6  
**Figma URL:** https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=90-8990

---

## 1. Screen Overview

The "Нова заявка" (New Request) screen (W6) is the absence request creation form in the Larko Telegram Mini App. It is accessed by tapping the `+ Нова` button on the W5 Absences screen. The screen presents a single-page form with four fields: Absence Type (dropdown selector), Start Date (date picker), End Date (date picker), and Reason (optional textarea). A persistent bottom bar contains the primary CTA button ("Надіслати заявку"). The form has clearly defined states: Default (empty), Filled (all required fields entered), Submitting (API call in progress), Success (submitted OK — fields become read-only), and Error (validation failures highlighted with inline messages and an error banner). This is a write-only form; no read or edit of existing requests is supported on this screen.

---

## 2. Actors

- **Worker** — authenticated TMA user filling and submitting an absence request.
- **System** — validates form fields client-side, submits request to backend, transitions screen state.
- **Manager** — receives a notification after submission; reviews the request on their side (not part of this screen).

---

## 3. Entry Conditions (Pre-conditions)

1. User is authenticated via Telegram with Worker role.
2. User is on the W5 Absences screen and taps `+ Нова`.
3. The Company has at least one Absence Type configured (Manager has not disabled all types).
4. Network connection should be active for submission; offline submission queuing is TBD (see OQ-W6-04).

---

## 4. Main Flow (Happy Path)

1. User taps `+ Нова` on W5 → W6 screen opens [figma: `73:55218` Light / `73:55173` Dark].
2. Screen renders header "Нова заявка" with back arrow `<` [figma: `113:11064`], and the form in Default state.
3. User taps **Тип відсутності** (Absence Type) dropdown → selects a type (e.g., "Лікарняний") from a bottom sheet picker [figma: Type field `73:55226`].
4. User taps **Дата початку** (Start Date) → date picker opens; user selects a date [figma: `73:55234`].
5. User taps **Дата закінчення** (End Date) → date picker opens; user selects an end date [figma: `73:55243`].
6. System auto-calculates duration: **"Тривалість: N днів"** appears as a duration badge below the Reason field [figma: `73:55353`] once both dates are selected.
7. User optionally types in **Причина (необов'язково)** (Reason) textarea [figma: `73:55252`].
8. User taps **"Надіслати заявку"** button [figma: `73:55212`] → System enters Submitting state.
9. API call succeeds → Screen transitions to **Success** state: all fields become read-only (no border change but no interaction), button text changes to **"✓ Відправлено"** [figma: `73:55559` Dark / `73:55607` Light].
10. Worker sees request appears in W5 as `Pending` status.

---

## 5. Alternative Flows

### 5.1 Back Navigation
- User taps the `<` back arrow in the header → returns to W5 Absences screen.
- If any fields were filled, data is NOT persisted (no draft saving — see OQ-W6-05).

### 5.2 Form Filled (Pre-submission Valid State)
- When all required fields are filled and validation passes, the form is in the **Filled** state [figma Dark: `73:55263`, Light: `73:55314`].
- The duration badge `"Тривалість: N дні/днів"` is displayed [figma: `73:55302` / `73:55353`].
- The submit button is enabled (active style).
- The Reason field label switches from "Причина (необов'язково)" to "Причина" once type requires a reason — ANNOTATION MISSING (see OQ-W6-02).

### 5.3 Submitting State
- After the user taps "Надіслати заявку", the button enters a loading/submitting state [figma Dark: `73:55477`, Light: `73:55518`].
- All fields and the button are disabled during submission.
- The button shows a spinner or loading indicator (exact component not detailed in figma — ANNOTATION MISSING).

### 5.4 Success State
- After successful API response, all fields become read-only [figma Dark: `73:55559`, Light: `73:55607`].
- Button label changes to "✓ Відправлено" (submitted) with a checkmark icon.
- The Reason field label changes to "Причина" (non-optional label in success view — the value was saved).
- No navigation occurs automatically; user must manually tap back to return to W5.
- On W5, the new request appears at the top of the list with `Pending` status.

---

## 6. Edge Cases & Error States

| Edge Case | Validation Rule | Visual Behavior |
|:----------|:---------------|:----------------|
| **Type not selected** | Required | Field border highlighted red; inline error "Оберіть тип відсутності" below field [figma: `73:55437`] |
| **End Date before Start Date** | `end_date >= start_date` | End Date field highlighted red; inline error "Дата закінчення повинна бути після дати початку" [figma: `73:55457`] |
| **Both required errors present** | Multiple validation failures at once | Each invalid field shows independent inline error; a summary error banner "Виправте помилки перед надсиланням" shown at bottom of form [figma Error banner: `73:55464` Light / `73:55408` Dark] |
| **Start date in the past** | `start_date >= today` | ANNOTATION MISSING — BRD says cannot request for past dates; inline error text TBD |
| **Overlap with existing approved absence** | Server-side check | Server returns 409 Conflict; error banner shows "У вас вже є схвалена заявка на цей період" (text TBD) |
| **API submission failure** | Network or server error | Error banner shown; button reverts to active state; fields remain editable for retry |
| **Company has no absence types** | System misconfiguration | Type dropdown empty; user cannot submit; show empty state or error in dropdown — ANNOTATION MISSING |

---

## 7. UI Elements & States

| Element | Type | Figma Node | States | Behavior | Notes |
|:--------|:-----|:-----------|:-------|:---------|:------|
| Header — div.px-4 | Header Component | `113:11064` | default | Title "Нова заявка" + back arrow | Back → W5 |
| TypeField — div + label + div.h-12 | Form Field (Dropdown) | `73:55226` | empty (placeholder "Оберіть тип"), filled (selected value), error (red border + inline error) | Tap → opens bottom sheet with absence type options | Required |
| TypeDropdownChevron — Component 1 | Icon | `73:55232` | default | Chevron-down icon indicating dropdown |  |
| TypeErrorMessage — p.text-xs | Error Text | `73:55437` | error | "Оберіть тип відсутності" | Red text, shown below field |
| StartDateField — div + label + div.h-12 | Form Field (Date Picker) | `73:55234` | empty (placeholder "Оберіть дату"), filled (formatted date), error | Tap → native/custom date picker | Required |
| StartDateIcon — Component 1 | Icon | `73:55240` | default | Calendar icon on right |  |
| EndDateField — div + label + div.h-12 | Form Field (Date Picker) | `73:55243` | empty, filled, error (red border + inline error) | Tap → native/custom date picker | Required |
| EndDateErrorMessage — p.text-xs | Error Text | `73:55457` | error | "Дата закінчення повинна бути після дати початку" | Red, multiline |
| ReasonField — div + label + div.h-24 | Textarea | `73:55252` | empty (placeholder "Опишіть причину..."), filled | Free text input | Optional |
| DurationBadge — div.flex | Info Badge | `73:55353` | visible when dates valid | Shows "Тривалість: N дні/днів" with icon | Shown only after both dates selected |
| ErrorBanner — div.flex | Error Summary Banner | `73:55464` | visible on validation fail | "⚠ Виправте помилки перед надсиланням" | Red background, warning icon |
| SubmitButton — button.w-full | CTA Button | `73:55212` | default (disabled, faded), active (all fields valid), submitting (loading), success ("✓ Відправлено") | Tap → submits form | Disabled when form is empty/invalid |
| BottomSubmitBar — div.px-5 | Container | `73:55212` | sticky at bottom | Wraps the submit button | Always visible, 104px height |

---

## 8. Screen States

| State | Description | Figma Node |
|:------|:------------|:-----------|
| **Default (Empty)** | All fields empty, placeholders shown, button disabled | Dark: `73:55173` / Light: `73:55218` |
| **Filled (Valid)** | All required fields filled, duration badge visible, button enabled | Dark: `73:55263` / Light: `73:55314` |
| **Error (Validation)** | One or more required fields invalid; inline errors + error banner shown; button disabled | Dark: `73:55365` / Light: `73:55421` |
| **Submitting** | Form submitted; fields and button disabled; button shows loading indicator | Dark: `73:55477` / Light: `73:55518` |
| **Success** | Request submitted successfully; fields read-only; button shows "✓ Відправлено" | Dark: `73:55559` / Light: `73:55607` |

> **Note:** No paginated lists exist on this screen — empty-ever / empty-page distinction is N/A.

---

## 9. Business Rules

| Rule | Description | BRD Source |
|:-----|:------------|:-----------|
| BR-W6-01 | **Absence Type** is required. Types come from Company settings; default set: `'vacation'`, `'sick_leave'`, `'personal_day'`, `'holiday'`, `'unpaid_leave'`, `'family_leave'`, `'training'`, `'other'`. | BRD §2 My Absences |
| BR-W6-02 | **Start Date** is required. Cannot be in the past (`start_date >= today`). | BRD §2 My Absences: Validation |
| BR-W6-03 | **End Date** is required. Must satisfy `end_date >= start_date` (1-day absence: `start_date == end_date` is valid). | BRD §2 My Absences: Validation |
| BR-W6-04 | **Reason** is optional (field label: "Причина (необов'язково)"). Max length: TBD (see OQ-W6-03). | BRD §2 My Absences |
| BR-W6-05 | Cannot submit a request that overlaps with an existing **approved** absence for the same worker. Server returns 409 with conflict details. | BRD §2 My Absences: Validation |
| BR-W6-06 | After successful submission, the request is created with status `'pending'`. Manager receives a Telegram notification. | BRD §2 My Absences: State after action |
| BR-W6-07 | Once in Success state, the user cannot edit or delete the request from this screen. Dispute/cancellation flow is not defined in BRD for MVP. | BRD §2 My Absences |
| BR-W6-08 | Duration (number of calendar days inclusive) is auto-calculated: `duration = end_date - start_date + 1`. Shown as "Тривалість: N дні/днів". | Inferred from Figma [figma: `73:55353`] |

**Absence Type enum values (code-level):**
`'vacation'`, `'sick_leave'`, `'personal_day'`, `'holiday'`, `'unpaid_leave'`, `'family_leave'`, `'training'`, `'other'`

**Status after creation:** `'pending'` (only value on creation)

---

## 10. Integrations & API Contracts

| Endpoint | Method | Request | Response | Error Codes |
|:---------|:-------|:--------|:---------|:------------|
| GET /companies/{id}/absence-types | GET | `Authorization: Bearer {token}` | `[{ id, name, code }]` — list of enabled types for this company | 401, 403 |
| POST /absence-requests | POST | `{ company_id, type: 'sick_leave', start_date: '2026-03-25', end_date: '2026-03-27', reason: '...' }` | `{ id, type, start_date, end_date, reason, status: 'pending', created_at }` | 400 (validation), 401, 403, 409 (overlap conflict) |

**Date format:** ISO 8601 `YYYY-MM-DD`  
**409 Conflict response body (example):** `{ error: 'OVERLAP_CONFLICT', conflicting_request_id: '...', message: 'Overlaps with approved absence 2026-03-20 to 2026-03-27' }`

---

## 11. Non-Functional Requirements

| NFR | Requirement |
|:----|:------------|
| Performance | Form renders within 200ms; date picker opens within 100ms; submit API call completes within 2s or shows timeout |
| Validation | All validation runs client-side before API call; server-side validation is a second layer |
| Accessibility | All form fields must have associated `<label>`; date pickers must be keyboard/screen-reader compatible |
| i18n | All field labels, placeholders, and error messages must be translated; duration suffix ("дні/днів") must follow Ukrainian declension rules |
| UX | Duration badge appears instantly (no API call needed) when both dates are valid |
| Data Safety | Form data is NOT persisted locally as a draft; navigating back loses all entered data (confirmed in MVP scope) |

---

## 12. Open Questions

| # | Question | Blocking? | Notes |
|:--|:---------|:----------|:------|
| OQ-W6-01 | What is the exact date picker UI — native OS date picker, Telegram's native date selector, or a custom calendar component? The choice affects TMA compatibility. | [BLOCKING] | Must be decided before implementation |
| OQ-W6-02 | Does Reason become **required** for any specific absence type (e.g., "Sick Leave" always requires a reason)? Figma shows optional in Default/Filled states but "Причина" (without "необов'язково") in Success and Error states. | [NON-BLOCKING] | Can default to always-optional with label switching only on success |
| OQ-W6-03 | What is the maximum character length for the Reason field? BRD does not specify. | [NON-BLOCKING] | Default to 500 chars; adjust after stakeholder confirmation |
| OQ-W6-04 | Should the form support **offline submission queuing** (submit when connection is restored), or should it block submission when offline? | [BLOCKING] | Affects data layer architecture |
| OQ-W6-05 | Should the form preserve draft state if the user navigates away accidentally (e.g., via back button)? BRD does not mention draft saving. | [NON-BLOCKING] | Safer to discard for MVP; add draft saving in v2 |
| OQ-W6-06 | After Success state, should the screen automatically navigate back to W5 after a delay (e.g., 2 seconds), or wait for the user's manual back tap? Figma does not indicate auto-navigation. | [NON-BLOCKING] | Recommend auto-navigate after 2s with animation |

---

## 13. Proposed Improvements (PENDING APPROVAL)

*Section intentionally empty — pending user approval per SKILL_SA_DOCUMENT protocol.*
