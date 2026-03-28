# SA Document — Template Reference

This file is the canonical SA document template for `SKILL_SA_DOCUMENT`.

## File Naming
`scenario/SCREEN_[PascalCaseName].md`

## Full Template

```markdown
# SCREEN_[NAME] — System Analyst Scenario

## 1. Screen Overview

## 2. Actors

## 3. Entry Conditions (Pre-conditions)

## 4. Main Flow (Happy Path)

1. 

## 5. Alternative Flows

### 5.1 [Name]

## 6. Edge Cases & Error States

## 7. UI Elements & States

| Element | Type | States | Behavior | Validation Rules |
|---------|------|--------|----------|-----------------|
|         |      |        |          |                 |

## 8. Screen States

## 9. Business Rules

## 10. Integrations & API Contracts

| Endpoint | Method | Request | Response | Error Codes |
|----------|--------|---------|----------|-------------|
|          |        |         |          |             |

## 11. Non-Functional Requirements

## 12. Open Questions

## 13. Proposed Improvements (PENDING APPROVAL)
```

## Section Guidance

| Section | Source | Notes |
|---------|--------|-------|
| 1. Screen Overview | Figma context | 1 paragraph, user journey position |
| 2. Actors | Figma + BRD | All roles & systems |
| 3. Entry Conditions | BRD FR/BR | What must be true before access |
| 4. Main Flow | Figma flows + BRD FR | Numbered steps: Actor → Action → Response |
| 5. Alternative Flows | Figma + BRD | Named, numbered sub-sections |
| 6. Edge Cases | BRD + inference | ALL error conditions |
| 7. UI Elements | Figma parse | Table with all states |
| 8. Screen States | Figma variants | All screen-level states |
| 9. Business Rules | BRD BR | Cite BR-NNN |
| 10. Integrations | BRD API | Table with endpoints |
| 11. NFR | BRD NFR | Performance, a11y, security |
| 12. Open Questions | Gaps | Missing info for stakeholders |
| 13. Improvements | AI analysis | ONLY after explicit user approval |
