# Tech Stack Specification: SCREEN_W5_Absences

## Overview
Implementation of the Worker Absences dashboard, featuring a custom interactive mini-calendar and a scrollable list of historical absence requests.

## Core Stack
- **Frontend**: React 18, Vite
- **Date Math**: `date-fns` (lightweight date calculations)
- **API**: TanStack Query
- **UI Components**: Tailwind CSS

## File Structure Mapping
- `src/features/absences/screens/AbsencesScreen.tsx`
- `src/features/absences/components/MiniCalendar.tsx`
- `src/features/absences/components/RequestCard.tsx`
- `src/features/absences/components/AbsencesList.tsx`
- `src/api/queries/useAbsencesQuery.ts` (Fetches list)
- `src/api/queries/useAbsenceCalendarQuery.ts` (Fetches dot metadata)

## Step-by-Step Implementation

1. **Phase 1: Setup & API Integration**
   - [ ] Implement `useAbsencesQuery` using TanStack Query. Set `staleTime: 60000`. Returns array of requests.
   - [ ] Implement `useAbsenceCalendarQuery` tracking the currently viewed `year-month`.

2. **Phase 2: Calendar Component (`MiniCalendar.tsx`)**
   - [ ] Use `date-fns` functions (`startOfMonth`, `endOfMonth`, `eachDayOfInterval`, `getDay`) to generate an array of days for the grid.
   - [ ] Build the 7-column CSS Grid (`grid-cols-7`). 
   - [ ] Map the `days_with_absences` from the API response to render the `CalendarDotMarker`.

3. **Phase 3: Integration & UX**
   - [ ] Build the `AbsencesList.tsx` utilizing `RequestCard.tsx` for each item. 
   - [ ] Implement the "Empty (ever)" state ("🏖️ Немає заявок на відгул").
   - [ ] Implement the Skeleton loaders for both the calendar and the list.
   - [ ] Hook up the `+ Нова` button to trigger React Router navigation to the W6 screen.

## External Dependencies
- `date-fns` (Standardize on this instead of moment/dayjs for TMA lightweight bundles).

## Developer Notes
- Ensure the scrolled state behaves correctly natively by using standard CSS `overflow-y-auto` on the list container while leaving the header sticky.
- Calendar dots must display regardless of request status (approved, pending, rejected).
