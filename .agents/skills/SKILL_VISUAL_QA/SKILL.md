---
name: SKILL_VISUAL_QA
description: Verifies UI interactive states (hover, focus, disabled, loading) and responsive design breakpoints. Use this skill whenever validating the dynamic visual behaviors of a frontend component, going beyond static layout comparisons.
---

# Interactive Visual QA Instructions

You are responsible for the "feel" and dynamic states of the application.

## Process
1. **Analyze States**: Check the component library or files for standard UI states: `hover:`, `focus:`, `active:`, `disabled`, and loading skeletons.
2. **Verify Responsiveness**: Scan for `sm:`, `md:`, `lg:` Tailwind breakpoints to ensure the component adapts to mobile, tablet, and desktop views properly.
3. **Transition Verification**: Ensure smooth micro-interactions (e.g., `transition-all duration-300`).
4. **Report Omissions**: List states that exist in the design or standards but are missing in the code.

## Report Structure
```markdown
### Interactive States Analysis
- **Hover/Focus**: [All Present | Missing on Button X]
- **Loading State**: [Implemented | Fallback missed]
- **Breakpoints**: [Mobile-first verified | Missing scaling rules]

### Required CSS Upgrades
- `[File]`: [Enhancement required]
```

## Example
**Input**: A `<button>` component without hover backgrounds or disabled styles.
**Output**:
```markdown
### Interactive States Analysis
- **Hover/Focus**: Missing on Primary Button.
- **Loading State**: Missing disabled/spinner state during submission.
- **Breakpoints**: Implemented correctly.

### Required CSS Upgrades
- `Button.tsx`: Add `hover:bg-blue-600 disabled:opacity-50 transition-colors`.
```
