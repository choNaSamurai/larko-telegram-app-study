# SA Document — Template Reference

This file is the canonical SA document template for `SKILL_SA_DOCUMENT`.

## File Naming
`scenario/SCREEN_[PascalCaseName].md`

---

## Full Template

```markdown
# SCREEN_[NAME] — System Analyst Scenario

## 1. Screen Overview
[One paragraph: screen purpose, where it sits in the user journey]

## 2. Actors
[List all actors: User roles, systems, external services]

## 3. Entry Conditions (Pre-conditions)
[What must be true before the user can access this screen]

## 4. Main Flow (Happy Path)

1. [Actor]: [Action]
2. [System]: [Response]

## 5. Alternative Flows

### 5.1 [Name]
[Steps for this alternative path]

### 5.2 [Name]
[Steps for this alternative path]

## 6. Edge Cases & Error States
- [Condition]: [Visual/system behavior]
- [Condition]: [Visual/system behavior]

## 7. UI Elements & States

| Element | Type | Figma Node ID | Icon (`data-name`) | States | Behavior | Validation Rules |
|---------|------|---------------|--------------------|--------|----------|-----------------|
|         |      | [figma: XX:XXXXX] | solar:icon-bold |      |          |                 |

> **IMPORTANT for implementers:**
> - Icon column MUST contain the `data-name` value from Figma (e.g., `solar:route-bold`) — use @iconify/react.
> - If a card has a colored accent border, specify: `border-left-only` (NOT all 4 sides).
> - If the element displays a price/amount, document format: `₴12,400` (comma separator).

## 8. Screen States
- `idle` — [description]
- `loading` — [description]
- `success` — [description]
- `error` — [description]
- `empty` — [description]

## 9. Business Rules
[BRD-sourced rules that govern logic on this screen. Cite BRD section if possible]

## 10. Integrations & API Contracts

| Endpoint | Method | Request | Response | Error Codes |
|----------|--------|---------|----------|-------------|
|          |        |         |          |             |

**Data Handling:**
- [How tokens/state are stored]
- [Caching strategy]

**TMA Integration:**
- [Telegram.WebApp calls required]
- [initData constraints]

## 11. Non-Functional Requirements
- Performance: [e.g., initial render < 300ms]
- Accessibility: [WCAG level]
- Offline: [behavior when offline]
- Security: [auth, data exposure constraints]

## 12. Open Questions
- [BLOCKING] Q1: [Question that stops implementation]
- [NON-BLOCKING] Q2: [Question that can be deferred]

## 12.1 Design-to-Code Specifics (MANDATORY — feed into Tech Stack)

> **Source:** All values below come from `SKILL_FIGMA_PARSE` Step 7 `design_tokens_css` output.

### Icon Inventory
| Figma data-name | Size | Color | Component |
|-----------------|------|-------|-----------|
| solar:icon-bold | 24px | #xxxx | CardName |

### Color Table
| CSS Variable | Hex value | Usage |
|---|---|---|
| `--color-bg-screen` | `#??????` | Screen root background |
| `--color-bg-card` | `#??????` | Card/container background |
| `--color-text-primary` | `#??????` | Primary text |
| `--color-text-secondary` | `#??????` | Secondary/meta text |
| `--color-border-status-active` | `#??????` | Active card left border |
| `--color-border-status-done` | `#??????` | Done card left border |

### Spacing Table
> **CRITICAL**: Do NOT guess spacings or write generic terms like "medium". You MUST use `get_design_context` to read EXACT `px` values.
| Element | Padding / Gap |
|---|---|
| Screen horizontal padding | `??px` |
| Card internal padding | `??px ??px` |
| List item gap | `??px` |

### Typography Table
| Role | font-size | font-weight | line-height |
|---|---|---|---|
| Card title | `??px` | `???` | `??px` |
| Card subtitle | `??px` | `???` | `??px` |

### Border Radius Table
| Element | border-radius |
|---|---|
| Card | `??px` |
| Badge | `??px` |

### Price/Number Formats
Specify exact format from Figma: e.g., `₴12,400` (commas) or `12 400` (spaces)

### Card border style
Specify: `all-sides` | `left-only` | `none`

### Screen Header Safe Area
Specify if fullscreen TMA (needs safe-area-inset-top): **YES** / NO

## 13. Out of Scope
- [Feature or flow explicitly excluded]
- [Feature or flow explicitly excluded]

## 14. Proposed Improvements (PENDING APPROVAL)
[Added ONLY after explicit user approval]
```

---

## Section Guidance

| Section | Source | Notes |
|---------|--------|-------|
| 1. Screen Overview | Figma context | 1 paragraph, user journey position |
| 2. Actors | Figma + BRD | All roles & systems (User, Backend, Telegram WebApp) |
| 3. Entry Conditions | BRD FR/BR | What must be true before access |
| 4. Main Flow | Figma flows + BRD FR | Numbered steps: Actor → Action → Response |
| 5. Alternative Flows | Figma + BRD | Named, numbered sub-sections (A1, A2…) |
| 6. Edge Cases | BRD + inference | ALL error conditions, timeouts, empty states |
| 7. UI Elements | Figma parse | Table with Figma Node ID, icon data-name, all states |
| 8. Screen States | Figma variants | All screen-level states with visual description |
| 9. Business Rules | BRD BR | Cite BR-NNN or BRD section |
| 10. Integrations | BRD API | Full endpoint table + data handling + TMA integration |
| 11. NFR | BRD NFR | Performance, a11y, offline, security |
| 12. Open Questions | Gaps | Tag every item [BLOCKING] or [NON-BLOCKING] |
| 12.1 Design Specifics | Figma parse | Icons, colors, spacing, typography, border style |
| 13. Out of Scope | Explicit exclusions | What is explicitly NOT part of this screen |
| 14. Improvements | AI analysis | ONLY after explicit user approval |

---

## Full Filled Example (Reference)

> Based on: Feature — Telegram Authentication (TMA)

```markdown
# SCREEN_Auth — System Analyst Scenario

## 1. Screen Overview
The Auth screen is the entry point for all users. It initializes the Telegram WebApp context,
authenticates the user via Telegram initData, and redirects to the Dashboard on success.

## 2. Actors
- **User** (Telegram user): initiates app open
- **Telegram WebApp**: provides initData and context
- **Backend API**: validates initData, issues auth token

## 3. Entry Conditions (Pre-conditions)
- User opens the Mini App from within Telegram
- Telegram client passes a valid initData payload

## 4. Main Flow (Happy Path)

1. User opens Mini App from Telegram
2. Frontend: initializes Telegram.WebApp, retrieves initData
3. Frontend: sends POST /auth with initData
4. Backend: validates initData (Telegram hash), finds or creates user account
5. Backend: returns auth token + user info
6. Frontend: stores token, redirects to Dashboard

## 5. Alternative Flows

### 5.1 Invalid initData
- Backend returns 401
- Frontend shows error screen with "Authentication failed" message

### 5.2 Network Error
- Frontend shows retry state: "Connection error. Please try again."

### 5.3 User Not Found
- Backend creates new user account automatically
- Flow continues as happy path from step 5

## 6. Edge Cases & Error States
- initData missing or malformed → show hard error, cannot proceed
- Backend timeout (>10s) → show retry banner
- Token storage failure → log silently, redirect anyway (in-memory fallback)

## 7. UI Elements & States

| Element | Type | Figma Node ID | Icon (`data-name`) | States | Behavior |
|---------|------|---------------|--------------------|--------|----------|
| Start Button | primary | [figma: 12:345] | — | default, disabled, loading | On click: disable + show loader + trigger auth |
| Auth Loader | spinner | [figma: 12:346] | — | hidden, visible | Shown during auth request |

## 8. Screen States
- `idle` — Initial state, "Start" button visible
- `loading` — Button disabled, loader visible
- `success` — Redirect to Dashboard (screen unmounts)
- `error` — Error message shown with retry option

## 9. Business Rules
- BR-001: initData must be sent as-is to backend; NO client-side parsing
- BR-002: Token validation happens ONLY on backend

## 10. Integrations & API Contracts

| Endpoint | Method | Request | Response | Error Codes |
|----------|--------|---------|----------|-------------|
| /auth | POST | `{ "initData": "string" }` | `{ "token": "jwt", "user": { "id": "123", "name": "John" } }` | 401 |

**Data Handling:**
- Token stored in memory + localStorage fallback
- User data cached in Zustand global store

**TMA Integration:**
- `Telegram.WebApp.ready()` called on screen open
- `Telegram.WebApp.initData` passed verbatim to backend

## 11. Non-Functional Requirements
- Auth round-trip must complete within 3 seconds on 3G
- No auth state persisted between Telegram sessions
- initData must never be logged to console

## 12. Open Questions
- [BLOCKING] Q1: Should the app create users automatically on first login, or require pre-registration?
- [NON-BLOCKING] Q2: Should we support biometric/PIN fallback if initData is unavailable?

## 12.1 Design-to-Code Specifics

### Color Table
| CSS Variable | Hex | Usage |
|---|---|---|
| `--color-bg-screen` | `#1a1a2e` | Auth screen background |
| `--color-btn-primary` | `#4e89ff` | Start button background |

### Card border style: `none`
### Screen Header Safe Area: **YES**
### Price/Number Formats: N/A

## 13. Out of Scope
- Manual login (email/password)
- Logout flow
- Token refresh strategy

## 14. Proposed Improvements (PENDING APPROVAL)
```
