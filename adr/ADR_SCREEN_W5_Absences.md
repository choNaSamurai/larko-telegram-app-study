# ADR-W5: Larko Absences & Calendar Architecture
**Status**: [ACCEPTED]

## Context
The "Time Off & Vacations" screen (W5) presents a dual-view dashboard: a current-month mini calendar with dot indicators, and a scrollable list of the user's historical and pending absence requests. 

- **Project Scope**: Absence tracking and calendar visualization for Workers.
- **TMA Constraints**: Complex calendar DOM elements can be heavy on mobile webviews. Data rendering must be efficient and feel native.

## Problem
1. **Calendar Rendering and Interaction**: How to efficiently render the calendar view and handle interactions without lagging the TMA?
2. **Blocking Context Resolutions**:
   - *OQ-W5-01 (Calendar cell tap)*: We assume tapping a calendar cell visually selects it and scrolls/filters the request list below to highlight absences overlapping with that day.
   - *OQ-W5-02 (Calendar dots status)*: We assume dots are shown for ALL statuses (pending, approved, rejected) to provide a complete overview of requested time.

## Options Considered

### Option 1: Full External Library (`react-calendar` or `react-day-picker`)
- **Pros**: Quick to implement, handles all date math and accessibility.
- **Cons**: Can inject heavy CSS/DOM structures that clash with our specific Tailwind/glassmorphism design requirements.

### Option 2: Headless Date Math (`date-fns`) + Custom Tailwind Grid
- **Pros**: Maximum control over DOM and styling, extremely lightweight, perfect for TMA optimizations.
- **Cons**: Requires manually building the 7-column grid and day calculations.

## Decision
We select **Option 2 (Headless Date Math + Custom Tailwind Grid)**.

## Rationale
- **MVP Speed & Customization**: The Figma design has highly specific TMA native states (skeleton loading, dots, muted dates). A custom grid using `date-fns` for getting days of the month is trivial and ensures 100% adherence to Figma.
- **TanStack Query Cache Policies**:
  - The list of requests is moderately dynamic (changes when worker submits or manager approves).
  - `staleTime: 1 minute` (frequent enough for manager approvals while avoiding spam on re-focus).
  - `gcTime: 10 minutes`
  - Calendar metadata `days_with_absences` uses the same cache strategy.

## Consequences
- **Positive**: Blazing fast rendering, complete control over the UI, no heavy third-party CSS.
- **Negative**: Dev must implement month navigation math and edge cases (padding days from previous/next months).

## Future Considerations
- Introducing infinite scroll or pagination if the user's historical requests exceed 50+ items.
