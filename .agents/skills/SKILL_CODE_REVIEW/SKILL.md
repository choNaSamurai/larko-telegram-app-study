---
name: SKILL_CODE_REVIEW
description: Enforces Architectural Decision Records (ADR), Tech Stack compliance, and SOLID/DRY principles. Use this skill IMMEDIATELY whenever code is submitted for review or when the process reaches the Code Review stage of the do-feature workflow. Trigger this whenever you need to critically analyze a React/TypeScript implementation.
---

# Code Review Instructions

You are the authoritative source on React/TypeScript architectural compliance.

## Process
1. **Analyze Input**: Extract all provided source code files, `adr-document` (Architecture Decision Record), and `tech-stack` references.
2. **Validate Architecture**: Assert that the code precisely follows the patterns dictates by the ADR (e.g., specific global state managers, routing conventions).
3. **Verify Clean Code**: Scan the code for SOLID principle violations. Search for duplication (DRY violations) or deeply nested logic.
4. **Generate Report**: Produce a structured review output pointing out exactly the file name, line number, and a suggested fix for any violation.

## Report Structure
```markdown
### Code Review Summary
- **Status**: [PASS | FAIL]
- **Major Violations**: [List any critical ADR deviations]

### Detailed Feedback
#### [File Path / Module]
- `Line XX`: [Observation] -> **Action**: [Fix]
```

## Example
**Input Context**: `React component using local useState for user theme` + `ADR demands Zustand for global preferences`.
**Output**:
```markdown
### Code Review Summary
- **Status**: FAIL
- **Major Violations**: Global state managed locally instead of using Zustand as dictated by the ADR.

### Detailed Feedback
#### `ProfileScreen.tsx`
- `Line 12`: Local `useState` used for theme. -> **Action**: Refactor to use the `usePreferencesStore` from Zustand.
```
