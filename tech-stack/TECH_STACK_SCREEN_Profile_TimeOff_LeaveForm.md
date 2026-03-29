# TECH STACK — SCREEN_Profile (W4) + SCREEN_TimeOff (W5) + SCREEN_LeaveForm (W6)

**Traces to:** `scenario/SCREEN_Profile.md` §12.1 | `scenario/SCREEN_TimeOff.md` §12.1 | `scenario/SCREEN_LeaveForm.md` §12.1 | `adr/ADR_SCREEN_Profile_TimeOff_LeaveForm.md`  
**BRD:** `ba/04_BRD_Larko_MVP.md §2 Worker — Profile / My Absences`  
**Figma:** W4=node 84-7112 | W5=node 87-7730 | W6=node 90-8990

---

## Framework & Runtime

| Item | Value |
|------|-------|
| Framework | **React** (Vite + TypeScript) — same project as W1/W2/W3 |
| Language | TypeScript (strict mode) |
| TMA SDK | `@twa-dev/sdk` — `Telegram.WebApp` API |
| Styling | **Tailwind CSS v3** with custom tokens (extend existing `tailwind.config.js`) |
| Icons | `@iconify/react` — `solar:*`, `material-symbols:*`, `fluent-mdl2:*`, `si:*` sets (see ADR-003-E) |
| Data fetching | `@tanstack/react-query` v5 |
| State (UI) | `zustand` — `useUserPreferencesStore`, `useLeaveFormStore`, `useCalendarStore` |
| Routing | `react-router-dom` v6 — consistent with W1/W2/W3 |

> **Zero new npm dependencies** — all packages already installed from W1/W2/W3.

---

## File Structure

```
src/
├── types/
│   └── leave.types.ts                         # [NEW] LeaveRequest, LeaveType, CalendarDot
├── services/
│   ├── MockData.ts                            # [MODIFY] add MOCK_PROFILE, MOCK_LEAVE_REQUESTS, MOCK_LEAVE_TYPES
│   ├── profileService.ts                      # [NEW] fetchUserProfile, patchUserPreferences
│   └── leaveService.ts                        # [NEW] fetchLeaveRequests, fetchLeaveCalendar, fetchLeaveTypes, createLeaveRequest
├── stores/
│   ├── useUserPreferencesStore.ts             # [NEW] language, theme (persisted)
│   ├── useCalendarStore.ts                    # [NEW] displayedYearMonth for W5 calendar nav
│   └── useLeaveFormStore.ts                   # [NEW] W6 form state + validation
├── utils/
│   └── calendarUtils.ts                       # [NEW] buildCalendarDays(), formatDisplayDate()
├── components/
│   └── screens/
│       ├── Profile/
│       │   ├── ProfileScreen.tsx              # [NEW] Root W4 screen
│       │   ├── ProfileHeader.tsx              # [NEW] Avatar + name + company
│       │   ├── ProfileOptionsCard.tsx         # [NEW] Card container with 4 rows
│       │   ├── NavOptionRow.tsx               # [NEW] Row with icon + label + chevron
│       │   ├── LanguageToggle.tsx             # [NEW] UK/EN pill toggle
│       │   ├── ThemeToggle.tsx                # [NEW] Dark/Light pill toggle
│       │   └── ProfileSkeleton.tsx            # [NEW] Loading skeleton
│       ├── TimeOff/
│       │   ├── TimeOffScreen.tsx              # [NEW] Root W5 screen
│       │   ├── MiniCalendar.tsx               # [NEW] Custom 7-col calendar
│       │   ├── CalendarDay.tsx                # [NEW] Single day cell
│       │   ├── RequestCard.tsx                # [NEW] Single leave request card
│       │   ├── RequestsList.tsx               # [NEW] Section with header + cards
│       │   ├── StatusBadge.tsx                # [NEW] Pending/Approved/Rejected badge
│       │   ├── TimeOffSkeleton.tsx            # [NEW] Loading skeleton
│       │   ├── TimeOffEmpty.tsx               # [NEW] Empty state
│       │   └── TimeOffError.tsx               # [NEW] Error state
│       └── LeaveForm/
│           ├── LeaveFormScreen.tsx            # [NEW] Root W6 screen
│           ├── FormField.tsx                  # [NEW] Reusable label + input wrapper
│           ├── TypeDropdown.tsx               # [NEW] Absence type selector trigger
│           ├── DateField.tsx                  # [NEW] Date picker trigger field
│           ├── ReasonTextarea.tsx             # [NEW] Optional reason textarea
│           ├── DurationBadge.tsx              # [NEW] Auto-calculated duration info
│           ├── ValidationBanner.tsx           # [NEW] Error summary banner
│           └── SubmitButton.tsx               # [NEW] Primary submit button (disabled/active states)
```

---

## TypeScript Interfaces

```typescript
// src/types/leave.types.ts

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveType {
  id: string;
  label_uk: string;
  label_en: string;
}

export interface LeaveRequest {
  id: string;
  type: string;           // Display label e.g. "Лікарняний"
  startDate: string;      // "YYYY-MM-DD"
  endDate: string;        // "YYYY-MM-DD"
  durationDays: number;
  reason?: string;
  status: LeaveStatus;
}

export interface CalendarDot {
  date: string;           // "YYYY-MM-DD"
  status: LeaveStatus;
}

export interface CalendarDay {
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dot?: 'pending' | 'approved';
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  company: { name: string };
}

export interface UserPreferences {
  language: 'uk' | 'en';
  theme: 'dark' | 'light';
}
```

---

## MockData.ts additions

```typescript
// Add to src/services/MockData.ts

import type { UserProfile, LeaveRequest, LeaveType } from '@/types/leave.types';

export const MOCK_PROFILE: UserProfile = {
  id: 'u1',
  name: 'Павло Мельник',
  avatarUrl: null,
  company: { name: 'Larko.ai Inc' },
};

export const MOCK_LEAVE_TYPES: LeaveType[] = [
  { id: 'vacation',  label_uk: 'Відпустка',         label_en: 'Vacation' },
  { id: 'sick',      label_uk: 'Лікарняний',         label_en: 'Sick Leave' },
  { id: 'personal',  label_uk: 'Особистий день',     label_en: 'Personal Day' },
  { id: 'holiday',   label_uk: 'Вихідний',            label_en: 'Holiday' },
  { id: 'unpaid',    label_uk: 'Неоплачувана відпустка', label_en: 'Unpaid Leave' },
  { id: 'family',    label_uk: 'Сімейна відпустка',  label_en: 'Family Leave' },
  { id: 'training',  label_uk: 'Навчання',            label_en: 'Training' },
  { id: 'other',     label_uk: 'Інше',                label_en: 'Other' },
];

export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lr1',
    type: 'Лікарняний',
    startDate: '2026-03-10',
    endDate: '2026-03-11',
    durationDays: 2,
    reason: 'Застуда, потрібен відпочинок',
    status: 'pending',
  },
  {
    id: 'lr2',
    type: 'Відпустка',
    startDate: '2026-03-20',
    endDate: '2026-03-22',
    durationDays: 3,
    reason: 'Сімейна подорож',
    status: 'approved',
  },
];
```

---

## Service Files

```typescript
// src/services/profileService.ts

import { MOCK_PROFILE } from './MockData';
import type { UserProfile, UserPreferences } from '@/types/leave.types';

export async function fetchUserProfile(): Promise<UserProfile> {
  await new Promise(r => setTimeout(r, 400));
  return MOCK_PROFILE;
  // TODO: fetch('/api/v1/users/me', { headers: { Authorization: `Bearer ${token}` } })
}

export async function patchUserPreferences(prefs: Partial<UserPreferences>): Promise<void> {
  await new Promise(r => setTimeout(r, 200));
  // TODO: fetch('/api/v1/users/me', { method: 'PATCH', body: JSON.stringify(prefs) })
  console.log('[profileService] patchUserPreferences', prefs);
}
```

```typescript
// src/services/leaveService.ts

import { MOCK_LEAVE_REQUESTS, MOCK_LEAVE_TYPES } from './MockData';
import type { LeaveRequest, LeaveType, CalendarDot } from '@/types/leave.types';

export async function fetchLeaveRequests(): Promise<LeaveRequest[]> {
  await new Promise(r => setTimeout(r, 500));
  return MOCK_LEAVE_REQUESTS;
}

export async function fetchLeaveCalendar(yearMonth: string): Promise<CalendarDot[]> {
  await new Promise(r => setTimeout(r, 300));
  // Derive dots from mock requests
  return MOCK_LEAVE_REQUESTS.flatMap(req => {
    const dots: CalendarDot[] = [];
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().split('T')[0];
      if (iso.startsWith(yearMonth)) {
        dots.push({ date: iso, status: req.status });
      }
    }
    return dots;
  });
}

export async function fetchLeaveTypes(): Promise<LeaveType[]> {
  await new Promise(r => setTimeout(r, 200));
  return MOCK_LEAVE_TYPES;
}

export async function createLeaveRequest(payload: {
  typeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}): Promise<LeaveRequest> {
  await new Promise(r => setTimeout(r, 700));
  // TODO: fetch('/api/v1/leave-requests', { method: 'POST', body: JSON.stringify(payload) })
  const type = MOCK_LEAVE_TYPES.find(t => t.id === payload.typeId);
  const start = new Date(payload.startDate);
  const end = new Date(payload.endDate);
  const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  return {
    id: `lr-${Date.now()}`,
    type: type?.label_uk ?? payload.typeId,
    startDate: payload.startDate,
    endDate: payload.endDate,
    durationDays: days,
    reason: payload.reason,
    status: 'pending',
  };
}
```

---

## Zustand Stores

```typescript
// src/stores/useUserPreferencesStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPreferences } from '@/types/leave.types';

interface PreferencesState extends UserPreferences {
  setLanguage: (lang: 'uk' | 'en') => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useUserPreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      language: 'uk',
      theme: 'dark',
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
    }),
    { name: 'user-preferences' }
  )
);
```

```typescript
// src/stores/useCalendarStore.ts
import { create } from 'zustand';

interface CalendarState {
  year: number;
  month: number;           // 1-12
  prevMonth: () => void;
  nextMonth: () => void;
}

const now = new Date();
export const useCalendarStore = create<CalendarState>((set, get) => ({
  year: now.getFullYear(),
  month: now.getMonth() + 1,
  prevMonth: () => {
    const { year, month } = get();
    if (month === 1) set({ year: year - 1, month: 12 });
    else set({ month: month - 1 });
  },
  nextMonth: () => {
    const { year, month } = get();
    if (month === 12) set({ year: year + 1, month: 1 });
    else set({ month: month + 1 });
  },
}));
```

```typescript
// src/stores/useLeaveFormStore.ts
import { create } from 'zustand';

export interface LeaveFormErrors {
  typeId?: string;
  startDate?: string;
  endDate?: string;
}

interface LeaveFormState {
  typeId: string | null;
  startDate: string | null;
  endDate: string | null;
  reason: string;
  errors: LeaveFormErrors;
  isSubmitting: boolean;
  isSuccess: boolean;
  // Derived
  durationDays: number | null;
  isValid: boolean;
  // Actions
  setTypeId: (id: string) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setReason: (text: string) => void;
  validate: () => boolean;
  reset: () => void;
  setSubmitting: (v: boolean) => void;
  setSuccess: (v: boolean) => void;
}

const calcDuration = (start: string | null, end: string | null): number | null => {
  if (!start || !end) return null;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return diff >= 0 ? Math.round(diff / 86400000) + 1 : null;
};

export const useLeaveFormStore = create<LeaveFormState>((set, get) => ({
  typeId: null,
  startDate: null,
  endDate: null,
  reason: '',
  errors: {},
  isSubmitting: false,
  isSuccess: false,
  durationDays: null,
  isValid: false,

  setTypeId: (typeId) => set((s) => ({
    typeId,
    errors: { ...s.errors, typeId: undefined },
    isValid: !!(typeId && s.startDate && s.endDate && calcDuration(s.startDate, s.endDate) !== null),
  })),

  setStartDate: (startDate) => set((s) => ({
    startDate,
    durationDays: calcDuration(startDate, s.endDate),
    errors: { ...s.errors, startDate: undefined },
    isValid: !!(s.typeId && startDate && s.endDate && calcDuration(startDate, s.endDate) !== null),
  })),

  setEndDate: (endDate) => set((s) => ({
    endDate,
    durationDays: calcDuration(s.startDate, endDate),
    errors: { ...s.errors, endDate: undefined },
    isValid: !!(s.typeId && s.startDate && endDate && calcDuration(s.startDate, endDate) !== null),
  })),

  setReason: (reason) => set({ reason }),

  validate: () => {
    const { typeId, startDate, endDate } = get();
    const errors: LeaveFormErrors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!typeId) errors.typeId = 'Оберіть тип відсутності';
    if (!startDate) {
      errors.startDate = 'Оберіть дату початку';
    } else if (startDate < today) {
      errors.startDate = 'Не можна вибрати минулу дату';
    }
    if (!endDate) {
      errors.endDate = 'Оберіть дату закінчення';
    } else if (startDate && endDate < startDate) {
      errors.endDate = 'Дата закінчення повинна бути після дати початку';
    }

    const isValid = Object.keys(errors).length === 0;
    set({ errors, isValid });
    return isValid;
  },

  reset: () => set({
    typeId: null, startDate: null, endDate: null, reason: '',
    errors: {}, isSubmitting: false, isSuccess: false, durationDays: null, isValid: false,
  }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setSuccess: (isSuccess) => set({ isSuccess }),
}));
```

---

## Utility Functions

```typescript
// src/utils/calendarUtils.ts

export interface CalendarDayCell {
  dayNum: number;
  isCurrentMonth: boolean;
  isoDate: string;
}

export function buildCalendarDays(year: number, month: number): CalendarDayCell[] {
  const firstDay = new Date(year, month - 1, 1);
  const startDow = (firstDay.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  const cells: CalendarDayCell[] = [];

  // Leading days (prev month)
  for (let d = startDow; d > 0; d--) {
    const dayNum = prevMonthDays - d + 1;
    const [py, pm] = month === 1 ? [year - 1, 12] : [year, month - 1];
    cells.push({ dayNum, isCurrentMonth: false, isoDate: `${py}-${String(pm).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}` });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      dayNum: d,
      isCurrentMonth: true,
      isoDate: `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`,
    });
  }

  // Trailing days (next month) — fill to 42
  let next = 1;
  const [ny, nm] = month === 12 ? [year + 1, 1] : [year, month + 1];
  while (cells.length < 42) {
    cells.push({ dayNum: next, isCurrentMonth: false, isoDate: `${ny}-${String(nm).padStart(2,'0')}-${String(next).padStart(2,'0')}` });
    next++;
  }

  return cells;
}

const UK_MONTHS: Record<number, string> = {
  1: 'Січень', 2: 'Лютий', 3: 'Березень', 4: 'Квітень',
  5: 'Травень', 6: 'Червень', 7: 'Липень', 8: 'Серпень',
  9: 'Вересень', 10: 'Жовтень', 11: 'Листопад', 12: 'Грудень',
};

const UK_MONTH_ABBR: Record<number, string> = {
  1: 'січ', 2: 'лют', 3: 'бер', 4: 'квіт', 5: 'трав', 6: 'черв',
  7: 'лип', 8: 'серп', 9: 'вер', 10: 'жовт', 11: 'лист', 12: 'груд',
};

export function formatMonthLabel(year: number, month: number): string {
  return `${UK_MONTHS[month]} ${year}`;
}

export function formatDateDisplay(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${d} ${UK_MONTH_ABBR[m]} ${y}`;
}

export function formatDateRange(startDate: string, endDate: string, days: number): string {
  const [, sm, sd] = startDate.split('-').map(Number);
  const [, em, ed] = endDate.split('-').map(Number);
  if (sm === em) {
    return `${sd}–${ed} ${UK_MONTH_ABBR[sm]} · ${days} ${pluralizeDays(days)}`;
  }
  return `${sd} ${UK_MONTH_ABBR[sm]}–${ed} ${UK_MONTH_ABBR[em]} · ${days} ${pluralizeDays(days)}`;
}

function pluralizeDays(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'день';
  if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return 'дні';
  return 'днів';
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}
```

---

## Design Tokens (Tailwind Extension)

```typescript
// Add to tailwind.config.js theme.extend — W4/W5/W6 tokens
// All values from Scenario §12.1 Color Tables

colors: {
  // Existing (W1/W2/W3 — already present, do NOT duplicate)
  'bg-screen':      '#222226',
  'bg-card':        '#2d2d31',
  'bg-input':       '#3e3e42',
  'text-primary':   '#ededed',
  'text-secondary': '#9d9d9d',
  'text-muted':     '#525252',
  'status-success': '#34d399',
  'status-warning': '#fbbf24',

  // NEW for W4/W5/W6
  'text-dim':           '#878787',   // Month label, calendar secondary text
  'status-error':       '#ef4444',   // Rejected badge text
  'badge-pending-bg':   'rgba(245,158,11,0.1)',
  'badge-approved-bg':  'rgba(16,185,129,0.1)',
  'badge-rejected-bg':  'rgba(239,68,68,0.1)',
  'btn-new-bg':         '#fafafa',   // "+ Нова" button
  'btn-submit-dis-bg':  '#f4f4f5',   // Submit button disabled
  'nav-bg':             'rgba(45,45,49,0.85)',
  'row-separator':      'rgba(255,255,255,0.05)',
  'chip-active-bg':     'rgba(255,255,255,0.05)',
  'icon-row-bg':        'rgba(255,255,255,0.15)',
}
```

---

## Step-by-Step Implementation

### PHASE 1 — Foundation (types, mocks, services, stores, utils)

**Step 1 — Types**
1. Create `src/types/leave.types.ts` with all interfaces above.
2. Verify `LeaveStatus = 'pending' | 'approved' | 'rejected'`.

**Step 2 — MockData**
1. Add `MOCK_PROFILE`, `MOCK_LEAVE_TYPES`, `MOCK_LEAVE_REQUESTS` to `src/services/MockData.ts`.
2. Ensure mock requests cover both `'pending'` and `'approved'` statuses.

**Step 3 — Services**
1. Create `src/services/profileService.ts` — `fetchUserProfile`, `patchUserPreferences`.
2. Create `src/services/leaveService.ts` — `fetchLeaveRequests`, `fetchLeaveCalendar`, `fetchLeaveTypes`, `createLeaveRequest`.

**Step 4 — Stores**
1. Create `src/stores/useUserPreferencesStore.ts` with `persist` middleware.
2. Create `src/stores/useCalendarStore.ts` — init to current month.
3. Create `src/stores/useLeaveFormStore.ts` — full form state with `validate()`.

**Step 5 — Utils**
1. Create `src/utils/calendarUtils.ts` — `buildCalendarDays`, `formatMonthLabel`, `formatDateRange`, `formatDateDisplay`, `getTodayISO`.
2. Test: `buildCalendarDays(2026, 3)` should return 42 cells; first cell = Mon 23-Feb (muted); 23-Mar = isToday.

---

### PHASE 2 — W4 Profile Screen

**Step 6 — ProfileHeader Component**

```tsx
// src/components/screens/Profile/ProfileHeader.tsx
import { Icon } from '@iconify/react';
import type { UserProfile } from '@/types/leave.types';

interface ProfileHeaderProps {
  profile: UserProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center pt-10 pb-6 px-5">
      {/* Avatar */}
      <div className="relative w-20 mb-0">
        <div className="w-20 h-20 rounded-full border border-[rgba(255,255,255,0.25)] overflow-hidden">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-bg-input flex items-center justify-center">
              <span className="text-text-primary text-xl font-bold">
                {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <h1 className="mt-3 text-[20px] font-bold leading-7 tracking-[-0.5px] text-text-primary">
        {profile.name}
      </h1>

      {/* Company */}
      <div className="flex items-center gap-2 mt-1">
        <div className="w-4 h-4 bg-[#141415] border border-[rgba(255,255,255,0.05)] rounded-[12px] flex items-center justify-center">
          <Icon icon="heroicons:building-office-2-solid" width={10} className="text-text-primary" />
        </div>
        <span className="text-[14px] font-medium leading-5 text-white">{profile.company.name}</span>
        <Icon icon="solar:alt-arrow-down-bold" width={12} className="text-text-secondary" />
      </div>
    </div>
  );
}
```

**Step 7 — LanguageToggle & ThemeToggle**

```tsx
// src/components/screens/Profile/LanguageToggle.tsx
import { Icon } from '@iconify/react';
import { useUserPreferencesStore } from '@/stores/useUserPreferencesStore';
import { patchUserPreferences } from '@/services/profileService';

export function LanguageToggle() {
  const { language, setLanguage } = useUserPreferencesStore();

  const toggle = async (lang: 'uk' | 'en') => {
    const prev = language;
    setLanguage(lang); // Optimistic
    try { await patchUserPreferences({ language: lang }); }
    catch { setLanguage(prev); } // Revert on failure
  };

  return (
    <div className="bg-bg-input border border-[rgba(255,255,255,0.08)] rounded-[16px] flex p-[5px]">
      {(['uk', 'en'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => toggle(lang)}
          className={`rounded-[12px] px-3 py-1 text-[12px] font-semibold leading-4 whitespace-nowrap transition-all ${
            language === lang
              ? 'bg-[rgba(255,255,255,0.05)] text-text-primary shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
              : 'text-text-dim'
          }`}
        >
          {lang === 'uk' ? '🇺🇦 UK' : '🇬🇧 EN'}
        </button>
      ))}
    </div>
  );
}
```

```tsx
// src/components/screens/Profile/ThemeToggle.tsx
import { Icon } from '@iconify/react';
import { useUserPreferencesStore } from '@/stores/useUserPreferencesStore';
import { patchUserPreferences } from '@/services/profileService';

export function ThemeToggle() {
  const { theme, setTheme } = useUserPreferencesStore();

  const toggle = async (t: 'dark' | 'light') => {
    const prev = theme;
    setTheme(t);
    try { await patchUserPreferences({ theme: t }); }
    catch { setTheme(prev); }
  };

  return (
    <div className="bg-bg-input border border-[rgba(255,255,255,0.08)] rounded-[16px] flex p-[5px] w-[122px]">
      {(['dark', 'light'] as const).map((t) => (
        <button
          key={t}
          onClick={() => toggle(t)}
          className={`rounded-[12px] px-3 py-1 flex items-center justify-center flex-1 transition-all ${
            theme === t
              ? 'bg-[rgba(255,255,255,0.05)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
              : ''
          }`}
        >
          <Icon
            icon={t === 'dark' ? 'fluent-mdl2:clear-night' : 'si:clear-day-line'}
            width={16}
            className="text-text-primary"
          />
        </button>
      ))}
    </div>
  );
}
```

**Step 8 — NavOptionRow**

```tsx
// src/components/screens/Profile/NavOptionRow.tsx
import { Icon } from '@iconify/react';
import type { ReactNode } from 'react';

interface NavOptionRowProps {
  icon: string;
  label: string;
  onClick?: () => void;
  rightContent?: ReactNode;
  hasBorderBottom?: boolean;
}

export function NavOptionRow({ icon, label, onClick, rightContent, hasBorderBottom = true }: NavOptionRowProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-4 pt-4 pb-[17px] ${hasBorderBottom ? 'border-b border-[rgba(255,255,255,0.05)]' : ''} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.15)] flex items-center justify-center shrink-0">
          <Icon icon={icon} width={16} className="text-text-primary" />
        </div>
        <span className="text-[14px] font-semibold leading-5 text-text-primary">{label}</span>
      </div>
      {rightContent ?? (
        <Icon icon="solar:alt-arrow-right-bold" width={18} className="text-text-dim" />
      )}
    </div>
  );
}
```

**Step 9 — ProfileOptionsCard**

```tsx
// src/components/screens/Profile/ProfileOptionsCard.tsx
import { useNavigate } from 'react-router-dom';
import { NavOptionRow } from './NavOptionRow';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { Icon } from '@iconify/react';

export function ProfileOptionsCard() {
  const navigate = useNavigate();
  return (
    <div className="mx-4 bg-bg-card border border-[rgba(255,255,255,0.08)] rounded-[20px] overflow-hidden">
      <NavOptionRow
        icon="solar:calendar-bold"
        label="Вихідні та відпустки"
        onClick={() => navigate('/time-off')}
      />
      <NavOptionRow
        icon="heroicons:globe-alt"
        label="Мова"
        rightContent={<LanguageToggle />}
        hasBorderBottom
      />
      <NavOptionRow
        icon="material-symbols:style-outline"
        label="Тема"
        rightContent={<ThemeToggle />}
        hasBorderBottom
      />
      <NavOptionRow
        icon="solar:question-circle-bold"
        label="Підтримка та FAQ"
        onClick={() => navigate('/support')}
        hasBorderBottom={false}
      />
    </div>
  );
}
```

**Step 10 — ProfileScreen Root**

```tsx
// src/components/screens/Profile/ProfileScreen.tsx
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import WebApp from '@twa-dev/sdk';
import { fetchUserProfile } from '@/services/profileService';
import { ProfileHeader } from './ProfileHeader';
import { ProfileOptionsCard } from './ProfileOptionsCard';

export function ProfileScreen() {
  useEffect(() => {
    WebApp.ready();
    WebApp.BackButton.hide();
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchUserProfile,
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div
      className="flex flex-col bg-bg-screen min-h-screen"
      style={{ paddingTop: 'env(safe-area-inset-top, 16px)' }}
    >
      {isLoading || !profile ? (
        <ProfileSkeleton />
      ) : (
        <>
          <ProfileHeader profile={profile} />
          <div className="flex-1 py-6">
            <ProfileOptionsCard />
          </div>
        </>
      )}
    </div>
  );
}
```

---

### PHASE 3 — W5 TimeOff Screen

**Step 11 — StatusBadge Component**

```tsx
// src/components/screens/TimeOff/StatusBadge.tsx
import type { LeaveStatus } from '@/types/leave.types';

const STATUS_CONFIG: Record<LeaveStatus, { bg: string; text: string; label: string; dot?: string; prefix?: string }> = {
  pending:  { bg: 'rgba(245,158,11,0.1)',  text: '#fbbf24', label: 'На розгляді', dot: '#fbbf24' },
  approved: { bg: 'rgba(16,185,129,0.1)',  text: '#34d399', label: 'Затверджено', prefix: '✓ ' },
  rejected: { bg: 'rgba(239,68,68,0.1)',   text: '#ef4444', label: 'Відхилено' },
};

export function StatusBadge({ status }: { status: LeaveStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div
      className="flex items-center gap-1 px-[10px] py-[2px] rounded-full text-[12px] font-medium leading-4"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {cfg.dot && <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: cfg.dot }} />}
      <span>{cfg.prefix ?? ''}{cfg.label}</span>
    </div>
  );
}
```

**Step 12 — RequestCard Component**

```tsx
// src/components/screens/TimeOff/RequestCard.tsx
import { StatusBadge } from './StatusBadge';
import { formatDateRange } from '@/utils/calendarUtils';
import type { LeaveRequest } from '@/types/leave.types';

export function RequestCard({ req }: { req: LeaveRequest }) {
  const dateLabel = formatDateRange(req.startDate, req.endDate, req.durationDays);
  return (
    <div className="bg-bg-card border border-[rgba(255,255,255,0.08)] rounded-[20px] relative" style={{ height: 99 }}>
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <span className="text-[14px] font-semibold leading-5 text-text-primary">{req.type}</span>
        <StatusBadge status={req.status} />
      </div>
      <div className="absolute left-4 right-4" style={{ top: 45 }}>
        <p className="text-[12px] font-normal leading-4 text-text-dim">{dateLabel}</p>
      </div>
      {req.reason && (
        <div className="absolute left-4 right-4" style={{ top: 65 }}>
          <p className="text-[12px] font-normal leading-4 text-text-dim truncate">{req.reason}</p>
        </div>
      )}
    </div>
  );
}
```

**Step 13 — MiniCalendar Component**

```tsx
// src/components/screens/TimeOff/MiniCalendar.tsx
import { Icon } from '@iconify/react';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { buildCalendarDays, formatMonthLabel, getTodayISO } from '@/utils/calendarUtils';
import type { CalendarDot } from '@/types/leave.types';

const DOW = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

interface MiniCalendarProps {
  dots: CalendarDot[];
}

export function MiniCalendar({ dots }: MiniCalendarProps) {
  const { year, month, prevMonth, nextMonth } = useCalendarStore();
  const today = getTodayISO();
  const cells = buildCalendarDays(year, month);
  const dotMap = new Map(dots.map(d => [d.date, d.status]));

  return (
    <div className="bg-bg-card border border-[rgba(255,255,255,0.08)] rounded-[20px] mx-4" style={{ minHeight: 290, padding: '16px 16px 0' }}>
      {/* Header nav */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={prevMonth} className="w-8 h-8 rounded-full flex items-center justify-center">
          <Icon icon="solar:alt-arrow-left-bold" width={18} className="text-text-primary" />
        </button>
        <span className="text-[14px] font-semibold leading-5 text-text-primary">{formatMonthLabel(year, month)}</span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full flex items-center justify-center">
          <Icon icon="solar:alt-arrow-right-bold" width={18} className="text-text-primary" />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-x-1 mb-1">
        {DOW.map(d => (
          <span key={d} className="text-[12px] font-normal text-text-dim text-center leading-4">{d}</span>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1 pb-4">
        {cells.map((cell, idx) => {
          const isToday = cell.isCurrentMonth && cell.isoDate === today;
          const dot = dotMap.get(cell.isoDate);
          return (
            <div key={idx} className="flex flex-col items-center py-[6px] relative">
              <span
                className={`text-[12px] leading-4 text-center w-full rounded-[16px] ${
                  isToday
                    ? 'bg-white text-[#222226] font-semibold'
                    : cell.isCurrentMonth
                      ? 'text-text-primary'
                      : 'text-text-dim'
                }`}
              >
                {cell.dayNum}
              </span>
              {dot && (
                <span
                  className="absolute bottom-[2px] w-1 h-1 rounded-full"
                  style={{ background: dot === 'approved' ? '#34d399' : '#fbbf24' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 14 — TimeOffScreen Root**

```tsx
// src/components/screens/TimeOff/TimeOffScreen.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import WebApp from '@twa-dev/sdk';
import { Icon } from '@iconify/react';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { fetchLeaveRequests, fetchLeaveCalendar } from '@/services/leaveService';
import { formatMonthLabel } from '@/utils/calendarUtils';
import { MiniCalendar } from './MiniCalendar';
import { RequestCard } from './RequestCard';

export function TimeOffScreen() {
  const navigate = useNavigate();
  const { year, month } = useCalendarStore();
  const yearMonth = `${year}-${String(month).padStart(2, '0')}`;

  useEffect(() => {
    WebApp.BackButton.show();
    const handler = () => navigate(-1);
    WebApp.BackButton.onClick(handler);
    return () => { WebApp.BackButton.offClick(handler); WebApp.BackButton.hide(); };
  }, [navigate]);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['leave-requests'],
    queryFn: fetchLeaveRequests,
    staleTime: 2 * 60 * 1000,
  });

  const { data: dots = [] } = useQuery({
    queryKey: ['leave-calendar', yearMonth],
    queryFn: () => fetchLeaveCalendar(yearMonth),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div
      className="flex flex-col bg-bg-screen min-h-screen pb-[136px]"
      style={{ paddingTop: 'env(safe-area-inset-top, 16px)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-[68px]">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-bg-card border border-bg-input flex items-center justify-center shrink-0"
        >
          <Icon icon="solar:arrow-left-bold" width={18} className="text-text-primary" />
        </button>
        <span className="text-[18px] font-semibold leading-7 tracking-[-0.5px] text-text-primary">
          Вихідні та відпустки
        </span>
      </div>

      {/* Month label */}
      <p className="px-4 pt-2 pb-0 text-[14px] font-normal leading-5 text-text-dim">
        {formatMonthLabel(year, month)}
      </p>

      {/* Calendar */}
      <div className="py-4">
        <MiniCalendar dots={dots} />
      </div>

      {/* Requests */}
      <div className="px-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold leading-5 text-text-primary">Мої заявки</span>
          <button
            onClick={() => navigate('/time-off/new')}
            className="h-8 w-20 bg-btn-new-bg rounded-[32px] text-[12px] font-semibold text-[#222226]"
          >
            + Нова
          </button>
        </div>

        {isLoading ? (
          [0, 1].map(i => <div key={i} className="h-[99px] bg-bg-card rounded-[20px] animate-pulse" />)
        ) : requests.length === 0 ? (
          <TimeOffEmpty onNew={() => navigate('/time-off/new')} />
        ) : (
          requests.map(req => <RequestCard key={req.id} req={req} />)
        )}
      </div>
    </div>
  );
}
```

---

### PHASE 4 — W6 LeaveForm Screen

**Step 15 — FormField (reusable wrapper)**

```tsx
// src/components/screens/LeaveForm/FormField.tsx
import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  labelSuffix?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, labelSuffix, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[12px] font-medium leading-4">
        <span className="text-text-dim">{label}</span>
        {labelSuffix && <span className="text-text-muted"> {labelSuffix}</span>}
      </label>
      {children}
      {error && <p className="text-[12px] leading-4 text-status-error">{error}</p>}
    </div>
  );
}
```

**Step 16 — LeaveFormScreen Root**

```tsx
// src/components/screens/LeaveForm/LeaveFormScreen.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import WebApp from '@twa-dev/sdk';
import { Icon } from '@iconify/react';
import { useLeaveFormStore } from '@/stores/useLeaveFormStore';
import { createLeaveRequest, fetchLeaveTypes } from '@/services/leaveService';
import { FormField } from './FormField';
import { pluralizeDays } from '@/utils/calendarUtils';

export function LeaveFormScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    typeId, startDate, endDate, reason, errors,
    isSubmitting, isSuccess, durationDays, isValid,
    setTypeId, setStartDate, setEndDate, setReason,
    validate, reset, setSubmitting, setSuccess,
  } = useLeaveFormStore();

  useEffect(() => {
    reset();
    WebApp.BackButton.show();
    const handler = () => navigate(-1);
    WebApp.BackButton.onClick(handler);
    return () => { WebApp.BackButton.offClick(handler); WebApp.BackButton.hide(); };
  }, [navigate, reset]);

  const { data: leaveTypes = [] } = useQuery({
    queryKey: ['leave-types'],
    queryFn: fetchLeaveTypes,
    staleTime: 60 * 60 * 1000,
  });

  const selectedType = leaveTypes.find(t => t.id === typeId);

  const mutation = useMutation({
    mutationFn: createLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
      setSuccess(true);
      setTimeout(() => navigate('/time-off', { replace: true }), 600);
    },
    onError: () => setSubmitting(false),
  });

  const handleSubmit = () => {
    if (!validate() || !typeId || !startDate || !endDate) return;
    setSubmitting(true);
    mutation.mutate({ typeId, startDate, endDate, reason: reason || undefined });
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div
      className="flex flex-col bg-bg-screen min-h-screen"
      style={{ paddingTop: 'env(safe-area-inset-top, 16px)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-[68px] shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-bg-card border border-bg-input flex items-center justify-center shrink-0"
        >
          <Icon icon="solar:arrow-left-bold" width={18} className="text-text-primary" />
        </button>
        <span className="text-[18px] font-semibold leading-7 tracking-[-0.5px] text-text-primary">
          Нова заявка
        </span>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col items-center px-4 gap-4 pt-0">

        {/* Absence type */}
        <FormField label="Тип відсутності" error={errors.typeId}>
          <div className="bg-bg-input border border-[rgba(255,255,255,0.08)] rounded-[16px] h-12 flex items-center justify-between px-[17px]">
            <select
              className="flex-1 bg-transparent text-[14px] leading-5 appearance-none outline-none cursor-pointer"
              style={{ color: selectedType ? '#ededed' : '#525252' }}
              value={typeId ?? ''}
              onChange={(e) => setTypeId(e.target.value)}
            >
              <option value="" disabled>Оберіть тип</option>
              {leaveTypes.map(t => (
                <option key={t.id} value={t.id}>{t.label_uk}</option>
              ))}
            </select>
            <Icon icon="solar:alt-arrow-down-bold" width={16} className="text-text-muted shrink-0" />
          </div>
        </FormField>

        {/* Start date */}
        <FormField label="Дата початку" error={errors.startDate}>
          <div className="bg-bg-input border border-[rgba(255,255,255,0.08)] rounded-[16px] h-12 flex items-center justify-between px-[17px]">
            <input
              type="date"
              className="flex-1 bg-transparent text-[14px] leading-5 outline-none appearance-none"
              style={{ color: startDate ? '#ededed' : '#525252', colorScheme: 'dark' }}
              value={startDate ?? ''}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Оберіть дату"
            />
            <Icon icon="solar:calendar-bold" width={16} className="text-text-muted shrink-0" />
          </div>
        </FormField>

        {/* End date */}
        <FormField label="Дата закінчення" error={errors.endDate}>
          <div className="bg-bg-input border border-[rgba(255,255,255,0.08)] rounded-[16px] h-12 flex items-center justify-between px-[17px]">
            <input
              type="date"
              className="flex-1 bg-transparent text-[14px] leading-5 outline-none appearance-none"
              style={{ color: endDate ? '#ededed' : '#525252', colorScheme: 'dark' }}
              value={endDate ?? ''}
              min={startDate ?? undefined}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Icon icon="solar:calendar-bold" width={16} className="text-text-muted shrink-0" />
          </div>
        </FormField>

        {/* Duration badge */}
        {durationDays !== null && (
          <div className="w-full flex items-center gap-3 bg-bg-input border border-[rgba(255,255,255,0.08)] rounded-[16px] px-[17px] h-[46px]">
            <Icon icon="solar:info-circle-bold" width={16} className="text-text-dim shrink-0" />
            <span className="text-[14px] leading-5 text-text-primary">
              Тривалість: {durationDays} {pluralizeDays(durationDays)}
            </span>
          </div>
        )}

        {/* Reason */}
        <FormField label="Причина" labelSuffix="(необов'язково)">
          <textarea
            className="bg-bg-input border border-[rgba(255,255,255,0.08)] rounded-[16px] h-24 p-[13px] text-[14px] leading-5 outline-none resize-none w-full"
            style={{ color: reason ? '#ededed' : '#525252' }}
            placeholder="Опишіть причину..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </FormField>

        {/* Validation banner */}
        {hasErrors && (
          <div className="w-full flex items-center gap-3 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-[16px] px-4 py-3">
            <Icon icon="solar:danger-triangle-bold" width={16} className="text-status-error shrink-0" />
            <span className="text-[14px] leading-5 text-text-dim">Виправте помилки перед надсиланням</span>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="px-4 pt-4 pb-8 shrink-0">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-14 rounded-[32px] text-[16px] font-semibold leading-6 transition-all"
          style={{
            background: isValid ? '#ffffff' : '#f4f4f5',
            color: isValid ? '#222226' : '#878787',
          }}
        >
          {isSubmitting ? 'Надсилання...' : 'Надіслати заявку'}
        </button>
      </div>
    </div>
  );
}
```

---

### PHASE 5 — Routing & Navigation Integration

**Step 17 — Add routes to App.tsx**

```tsx
// Add to existing App.tsx routes:
import { ProfileScreen } from '@/components/screens/Profile/ProfileScreen';
import { TimeOffScreen } from '@/components/screens/TimeOff/TimeOffScreen';
import { LeaveFormScreen } from '@/components/screens/LeaveForm/LeaveFormScreen';

// Inside <Routes>:
<Route path="/profile" element={<ProfileScreen />} />
<Route path="/time-off" element={<TimeOffScreen />} />
<Route path="/time-off/new" element={<LeaveFormScreen />} />
```

**Step 18 — Update BottomNav**

In `src/components/BottomNav.tsx`, ensure tab index `2` (Profile) links to `/profile`.

---

## External Dependencies

| Package | Version | Purpose | Usage |
|---------|---------|---------|-------|
| `@iconify/react` | latest | All icons | `<Icon icon="solar:calendar-bold" width={16} />` |
| `@tanstack/react-query` | v5 | Data fetching + cache + mutations | `useQuery`, `useMutation`, `useQueryClient` |
| `zustand` | v5 | UI state (preferences, calendar, form) | 3 new stores |
| `@twa-dev/sdk` | latest | TMA BackButton, WebApp.ready() | All screens |
| `react-router-dom` | v6 | Navigation | `useNavigate`, `<Route>` |

> **All already installed** — zero new `npm install` required.

---

## Visual Fidelity Checklist (Pre-merge gate)

- [ ] W4: Avatar circle has `rgba(255,255,255,0.25)` border — verified in DevTools
- [ ] W4: Options card bg `#2d2d31`, border `rgba(255,255,255,0.08)`, radius `20px`
- [ ] W4: Row separator inside card is `rgba(255,255,255,0.05)` — 1px bottom
- [ ] W4: Language toggle active chip bg `rgba(255,255,255,0.05)` with shadow
- [ ] W4: Theme toggle uses exact Iconify IDs `fluent-mdl2:clear-night` + `si:clear-day-line`
- [ ] W5: Calendar card bg `#2d2d31`, min-height 290px, radius `20px`
- [ ] W5: Today cell bg `white`, text `#222226`, semibold, radius `16px`
- [ ] W5: Absence dot `#fbbf24` (pending) / `#34d399` (approved), 4px, absolute `bottom-2px`
- [ ] W5: Request card height `99px`, positions via absolute top values (16, 45, 65)
- [ ] W5: "+ Нова" button bg `#fafafa`, text `#222226`, `80×32px`, radius `32px`
- [ ] W6: All form fields bg `#3e3e42`, height `48px`, radius `16px`, border `rgba(255,255,255,0.08)`
- [ ] W6: Submit button disabled: bg `#f4f4f5`, text color `#878787`
- [ ] W6: Submit button active: bg `#ffffff`, text `#222226`
- [ ] W6: Submit button `height: 56px`, `radius: 32px`
- [ ] All screens: `paddingTop: env(safe-area-inset-top, 16px)`
- [ ] W5+W6: Telegram BackButton shown on mount, hidden on unmount
