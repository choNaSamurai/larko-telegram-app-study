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

If either is missing, **stop** and invoke the corresponding skill first.

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
[Table: Element | Type | States | Behavior | Validation Rules]

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

### Input
```
Figma screen: "LoginScreen"
Actors: Guest User, Auth Service
Main flow: User enters email → enters password → taps Login → Auth Service validates → redirect to Dashboard
Edge cases: Wrong password (3 attempts → lock), empty fields, network error
BRD rule: "Passwords must be min 8 chars, one uppercase, one digit"
API: POST /auth/login → {token, userId} | 401 on invalid credentials
```

### Output (excerpt)
```markdown
# SCREEN_Login — System Analyst Scenario

## 2. Actors
- **Guest User**: Unauthenticated person attempting to sign in
- **Auth Service**: Backend authentication microservice

## 4. Main Flow (Happy Path)
1. User enters valid email in the Email field
2. User enters valid password in the Password field
3. User taps "Login" button
4. System sends POST /auth/login
5. Auth Service returns 200 + {token, userId}
6. System stores token, navigates to Dashboard screen

## 6. Edge Cases & Error States
- Wrong password 1–2x: Show inline error "Invalid credentials"
- Wrong password 3x: Lock account, show "Account locked. Check email."
- Empty email or password: Show field-level validation error immediately
- Network timeout (>10s): Show error banner "Connection error. Try again."
```
