# Tech Stack Specification: SCREEN_W6_NewRequest

## Overview
Implementation of the Create Absence Request form. Includes client-side validaton, date calculation, form state management, and API submission.

## Core Stack
- **Frontend**: React 18, Vite
- **Form State**: `react-hook-form`
- **Validation**: `zod`
- **API**: TanStack Query (`useMutation`)
- **UI Components**: Tailwind CSS, `react-day-picker` (if custom dates used), Radix UI (for dropdown/bottom sheet)

## File Structure Mapping
- `src/features/absences/screens/NewRequestScreen.tsx`
- `src/features/absences/schema/absenceRequestSchema.ts` (Zod validation)
- `src/api/mutations/useCreateAbsenceMutation.ts`
- `src/api/queries/useAbsenceTypesQuery.ts`
- `src/components/forms/DatePickerField.tsx`
- `src/components/forms/SelectField.tsx`

## Step-by-Step Implementation

1. **Phase 1: Setup & Validation**
   - [ ] Implement `absenceRequestSchema.ts` using `zod`. Define rules: `type` required, `start_date` >= today, `end_date` >= `start_date`.
   - [ ] Setup `useCreateAbsenceMutation.ts`. On success, call `queryClient.invalidateQueries({ queryKey: ['absences'] })`.
   - [ ] Setup `useAbsenceTypesQuery.ts` (stale time: 24h).

2. **Phase 2: Form Layout (`NewRequestScreen.tsx`)**
   - [ ] Initialize `useForm<z.infer<typeof absenceRequestSchema>>({ resolver: zodResolver(absenceRequestSchema) })`.
   - [ ] Build the layout using the `Default (Empty)` Figma state.
   - [ ] Implement the dynamic calculation of `duration` directly from `watch(['start_date', 'end_date'])`. Render the DurationBadge when valid.
   
3. **Phase 3: Integration & UX**
   - [ ] Map the mutation's `isPending` state to the submit button's loading state.
   - [ ] Map client `errors` and server errors (e.g. 409 Overlap) to the inline error messages and the Error Summary Banner.
   - [ ] Implement the `Success` view transition: disable fields (read-only), change submit button styling to "✓ Відправлено".

## External Dependencies
- `react-hook-form`
- `@hookform/resolvers/zod`
- `zod`

## Developer Notes
- Use controlled components (`Controller` from `react-hook-form`) for custom inputs like the Date Picker and the Select Dropdown.
- Do NOT persist the form data to `localStorage`. Let it reset if the user navigates back.
- Disable the submit button when the `formState.isValid` is false or the device is offline `!navigator.onLine`.
