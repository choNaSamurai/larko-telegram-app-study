# ADR-W6: Larko New Absence Request Architecture
**Status**: [ACCEPTED]

## Context
The "Нова заявка" screen (W6) is the form where Workers create new absence requests. It interacts with the backend via POST requests, requires strict input validations (e.g. `end_date >= start_date`), and handles network or business-logic errors (such as 409 Overlaps).

- **Project Scope**: Absence request submission.
- **TMA Constraints**: 
  - Forms in a webview need clean, accessible inputs. Native `input type="date"` styling is inconsistent between iOS and Android. 
  - Dropping connection during form submission is common on mobile networks.

## Problem
1. **Date Picker Consistency**: How to ensure the date picker matches the premium Figma design across both iOS and Android Telegram clients?
2. **Offline Form Submission**: Should the app queue the submission locally if offline?
3. **Blocking Context Resolutions**:
   - *OQ-W6-01 (Date Picker UI)*: We assume a specialized component (`react-day-picker` integrated via our design system) over raw HTML5 `<input type="date">` to guarantee the Figma UI exactness.
   - *OQ-W6-04 (Offline queuing)*: We assume blocking the form submission when offline for the MVP. Queuing could lead to unresolvable 409 Conflict errors later (e.g. overlapping dates) that the user won't understand.
   - *OQ-W6-05 (Draft Preserving)*: Discard on back navigation. No draft persistence.

## Options Considered

### Option 1: Native HTML5 UI (`<input type="date">` and native `<select>`)
- **Pros**: Zero JS bundle cost, 100% accessible natively.
- **Cons**: Cannot be styled to match the dark/light modes and glassmorphism specified in the Figma. Creates a jarring break in the "Premium TMA" experience.

### Option 2: Headless UI Components (Radix UI + react-hook-form + yup/zod)
- **Pros**: Highly customizable, fully accessible (WAI-ARIA), allows exact styling to match Figma. `react-hook-form` minimizes re-renders on every keystroke.
- **Cons**: Adds some KB to the bundle size.

## Decision
We select **Option 2 (Headless UI Components wrapped in react-hook-form and zod)**.

## Rationale
- **MVP Speed & Robustness**: `react-hook-form` coupled with `zod` makes executing complex validations (start date cannot be in the past, end >= start) trivial and testable.
- **TanStack Query Mutations**:
  - The submission uses `useMutation`.
  - On `onSuccess`, we invalidate the `/absence-requests` queries to force W5 to refresh.
  - Absence Types fetch `/companies/{id}/absence-types` uses `staleTime: 24 hours`.

## Consequences
- **Positive**: Consistent, beautiful UX matching the design perfectly. bullet-proof client-side validation minimizing unnecessary backend calls.
- **Negative**: Requires implementing accessible bottom-sheet selectors for absence types and date pickers.

## Future Considerations
- Implement background-sync API for offline submissions (v2), but requires building a robust Conflict resolution UI for overlapping dates.
