---
name: SKILL_SA_DOCUMENT
description: >
  Generates structured System Analyst scenario files (scenario/SCREEN_[NAME].md) from analyzed
  Figma screens and BRD requirements. Use this skill whenever a screen has been fully parsed and
  the SA document for that screen needs to be written, updated, or improved. Triggers on any
  mention of: "write scenario", "document screen", "SA doc", "screen analysis", or upon
  completion of SKILL_FIGMA_PARSE + SKILL_BRD_PARSE for a given screen.
---

# SKILL_SA_DOCUMENT — Write SA Screen Scenario

## Purpose

Produce one `scenario/SCREEN_[NAME].md` file per screen, strictly following the standard
SA document template (sections 1–13). After writing each file, list potential improvements
and apply them **only upon explicit user approval**.

---

## Prerequisites

Before invoking this skill, ensure both inputs are available:
- Output from `SKILL_FIGMA_PARSE` for the target screen (actors, UI elements, states, flows)
- Output from `SKILL_BRD_PARSE` for the target screen (mapped BRD requirements, rules, integrations)
- Reference template: [`references/sa_doc_template.md`](./references/sa_doc_template.md) — canonical structure with filled example

If either Figma or BRD input is missing, **stop** and invoke the corresponding skill first.

---

## Standard SA Document Template (13 Sections)

Every `scenario/SCREEN_[NAME].md` **must** contain all 13 sections below. Do not skip sections;
if information is not available, write `N/A — [reason]`.

```
# SCREEN_[NAME] — System Analyst Scenario

## 1. Screen Overview
[One paragraph: screen purpose, where it sits in the user journey]

## 2. Actors
[List all actors who interact with this screen: User roles, systems, external services]

## 3. Entry Conditions (Pre-conditions)
[What must be true before the user can access this screen]

## 4. Main Flow (Happy Path)
[Numbered step-by-step actions: Actor → Action → System Response]

## 5. Alternative Flows
[Named alternative paths: e.g., "5.1 User is unauthenticated", "5.2 No data"]

## 6. Edge Cases & Error States
[Exhaustive list of error conditions, validation failures, timeouts, empty states]

## 7. UI Elements & States
[Table: Element | Type | Figma Node ID | Icon (`data-name`) | States | Behavior | Validation Rules]

> **IMPORTANT for implementers:**
> - Icon column MUST contain the `data-name` value from Figma (e.g., `solar:route-bold`) — use @iconify/react.
> - If a card has a colored accent border, specify: `border-left-only` (NOT all 4 sides).
> - If the element displays a price/amount, document format: `₴12,400` (comma separator).

## 8. Screen States
[All possible screen-level states: loading, empty, error, populated, disabled, etc.]

## 9. Business Rules
[BRD-sourced rules that govern logic on this screen. Cite BRD section if possible]

## 10. Integrations & API Contracts
[Endpoint | Method | Request | Response | Error codes — from BRD or inferred from design]

## 11. Non-Functional Requirements
[Performance expectations, accessibility (WCAG level), offline behavior, security]

## 12. Open Questions
[Questions for stakeholders that cannot be answered from current design + BRD]

## 12.1 Design-to-Code Specifics (MANDATORY — feed into Tech Stack)

> **Source:** All values below come from `SKILL_FIGMA_PARSE` Step 7 `design_tokens_css` output.
> The implementer's "Color Token Check" and "Spacing Fidelity Check" gates will validate against this section.

### Icon Inventory (from SKILL_FIGMA_PARSE icon_inventory)
| Figma data-name         | Size | Color    | Component     |
|-------------------------|------|----------|---------------|
| solar:route-bold        | 24px | #ededed  | TaskCard      |
| mdi:company             | 16px | #9d9d9d  | TaskCard      |
_(fill from icon_inventory output)_

### Color Table (MANDATORY — exact Figma hex per element)
| CSS Variable                    | Hex value   | Usage                                    |
|---------------------------------|-------------|------------------------------------------|
| `--color-bg-screen`             | `#???????`  | Screen root background                   |
| `--color-bg-card`               | `#???????`  | Card/container background                |
| `--color-text-primary`          | `#???????`  | Primary text (titles, amounts)           |
| `--color-text-secondary`        | `#???????`  | Secondary text (meta, labels)            |
| `--color-border-status-active`  | `#???????`  | Active/In-progress card left border      |
| `--color-border-status-done`    | `#???????`  | Done card left border                    |
_(replace `#???????` with actual hex from Figma — extracted by SKILL_FIGMA_PARSE)_

### Spacing Table (MANDATORY — exact Figma px values)
> **CRITICAL**: Do NOT guess spacings or write generic terms like "medium". You MUST open the Figma node in DevMode or call `get_design_context` to read EXACT `px` values.
| Element                         | Padding / Gap value   |
|---------------------------------|-----------------------|
| Screen horizontal padding       | `??px`                |
| Card internal padding           | `??px ??px`           |
| List item gap (between cards)   | `??px`                |
| Section header margin-bottom    | `??px`                |
_(fill from get_design_context spacing output)_

### Typography Table (MANDATORY — exact Figma text style values)
| Role / Usage            | font-size | font-weight | line-height | letter-spacing |
|-------------------------|-----------|-------------|-------------|----------------|
| Card title              | `??px`    | `???`       | `??px`      | `0px`          |
| Card subtitle/meta      | `??px`    | `???`       | `??px`      | `0px`          |
| Section heading         | `??px`    | `???`       | `??px`      | `0px`          |
| Badge/label text        | `??px`    | `???`       | `??px`      | `0px`          |
_(fill from get_design_context typography output)_

### Border Radius Table
| Element                 | border-radius |
|-------------------------|---------------|
| Task/order card         | `??px`        |
| Status badge            | `??px`        |
| Input / form field      | `??px`        |
| Avatar                  | `50%`         |

### Price/Number Formats
Specify exact format from Figma: e.g., ₴12,400 (commas) or 12 400 (spaces)

### Card border style
Specify if border is: `all-sides` | `left-only` | `none`
(extract from Figma: look for "border-l" vs "border" in generated code)

### Screen Header Safe Area
Specify if screen is fullscreen TMA (needs safe-area-inset-top): **YES** / NO



## 13. Proposed Improvements (PENDING APPROVAL)
[List of suggested UX gaps, missing edge cases, ambiguous states — added ONLY after user approval]
```

---

## Execution Steps

1. **Prepare inputs**: Read the parsed Figma data and BRD mapping for the screen.
2. **Fill sections 1–12**: Write all sections from available data. Never invent business rules.
3. **Write the file**: Output to `scenario/SCREEN_[NAME].md`. Screen name must match Figma layer name (PascalCase, spaces replaced by `_`).
4. **Present summary**: Show the user a summary of what was written.
5. **Generate improvements list**: After writing, enumerate potential improvements as a separate list (do NOT append to file yet).
6. **Wait for approval**: Do NOT write section 13 or modify the file until user says "approved" or "apply improvements".
7. **Apply on approval**: Append only approved improvements to section 13 of the file.

---

## Constraints

- One file per screen. Never combine screens.
- Do not invent business logic absent from BRD or confirmed stakeholder input.
- Do not proceed to the next screen until current screen doc is confirmed by user.
- Section 13 remains empty (or omitted) until user explicitly approves improvements.

---

## Output Contract

- **File**: `scenario/SCREEN_[NAME].md`
- **Encoding**: UTF-8
- **Sections**: All 13 present
- **Validation**: Run `scripts/validate_sa_doc.sh <file_path>` after creation

---

## Examples

> Full filled example is available in [`references/sa_doc_template.md`](./references/sa_doc_template.md) — **read it before writing any scenario**.

### Example: Telegram Authentication (TMA context)

**Input:**
```
Figma screen: "AuthScreen"
Actors: User (Telegram user), Telegram WebApp, Backend API
Main flow: User opens Mini App → Frontend retrieves initData → POST /auth → token issued → redirect to Dashboard
Edge cases: Invalid initData (401), network error (retry), new user (auto-created)
BRD rules: initData sent as-is, validation backend-only
API: POST /auth → { token, user } | 401
```

**Output (excerpt):**
```markdown
# SCREEN_Auth — System Analyst Scenario

## 2. Actors
- **User**: Telegram user who opens the Mini App
- **Telegram WebApp**: Provides initData and context
- **Backend API**: Validates initData, issues token

## 4. Main Flow (Happy Path)
1. User opens Mini App from Telegram
2. Frontend: initializes Telegram.WebApp, retrieves initData
3. Frontend: sends POST /auth with initData
4. Backend: validates initData (Telegram hash), finds or creates user
5. Backend: returns auth token + user info
6. Frontend: stores token, redirects to Dashboard

## 5. Alternative Flows
### 5.1 Invalid initData
- Backend returns 401
- Frontend shows error screen
### 5.2 Network Error
- Show retry state
### 5.3 User Not Found
- Backend auto-creates user, continues happy path

## 6. Edge Cases & Error States
- initData missing → hard error, cannot proceed
- Backend timeout >10s → retry banner
- Token storage failure → in-memory fallback

## 9. Business Rules
- BR-001: initData must be sent as-is — NO client-side parsing
- BR-002: Token validation happens ONLY on backend

## 10. Integrations & API Contracts
| Endpoint | Method | Request | Response | Error |
|----------|--------|---------|----------|-------|
| /auth | POST | `{ "initData": "string" }` | `{ "token": "jwt", "user": {"id":"123","name":"John"} }` | 401 |

**TMA Integration:**
- `Telegram.WebApp.ready()` called on screen open
- `Telegram.WebApp.initData` passed verbatim to backend

## 11. Non-Functional Requirements
- Auth round-trip < 3s on 3G
- initData must never be logged to console

## 12. Open Questions
- [BLOCKING] Q1: Auto-create users on first login, or require pre-registration?
- [NON-BLOCKING] Q2: Biometric/PIN fallback if initData unavailable?

## 13. Out of Scope
- Manual login (email/password)
- Logout flow
```

### Example: Classic Form Screen (non-TMA)

**Input:**
```
Figma screen: "LoginScreen"
Actors: Guest User, Auth Service
Edge cases: Wrong password (3 attempts → lock), empty fields, network error
BRD rule: "Passwords must be min 8 chars, one uppercase, one digit"
API: POST /auth/login → {token, userId} | 401
```

**Output (excerpt):**
```markdown
## 6. Edge Cases & Error States
- Wrong password 1–2x: Show inline error "Invalid credentials"
- Wrong password 3x: Lock account → "Account locked. Check email."
- Empty fields: Field-level validation error immediately
- Network timeout >10s: Error banner "Connection error. Try again."
```
