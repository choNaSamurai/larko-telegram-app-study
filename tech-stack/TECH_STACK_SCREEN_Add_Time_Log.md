# TECH STACK — SCREEN_Add_Time_Log (W2.1)

**Traces to:** `scenario/SCREEN_Add_Time_Log.md` §12.1 | `adr/ADR_SCREEN_Add_Time_Log.md`
**BRD:** `ba/04_BRD_Larko_MVP.md` §2 Worker — Order Hub → Add Time Bottom Sheet
**Figma:** https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=255-11209

---

## Framework & Runtime

| Item | Value |
|------|-------|
| Framework | **React** (Vite + TypeScript) — same project as W1/W2/W3 |
| Language | TypeScript (strict mode) |
| TMA SDK | `@twa-dev/sdk` — `Telegram.WebApp.BackButton` + safe-area |
| Styling | **Tailwind CSS v3** with custom tokens (extend existing `tailwind.config.js`) |
| Icons | `@iconify/react` — exact icon IDs from Figma `data-name` attributes |
| Data fetching | `@tanstack/react-query` v5 — `queryKey: ['time-logs', orderId, date]` |
| State (form) | `useTimeLogForm` custom hook (see ADR-005-B) — no Zustand needed |
| Routing | React Router — full-screen route `/orders/:orderId/add-time` |

---

## File Structure

```
src/
├── styles/
│   └── tokens.css                                  # (existing — verify W2.1 tokens present)
├── types/
│   └── timeLog.types.ts                            # [NEW] TypeScript interfaces for TimeLog domain
├── services/
│   └── MockData.ts                                 # (existing — ADD time log mock data)
│   └── timeLogService.ts                           # [NEW] Data access layer (mock → real API)
├── hooks/
│   └── useTimeLogForm.ts                           # [NEW] Form state + time math + validation
├── utils/
│   └── timeUtils.ts                                # [NEW] calculateNetMinutes(), formatHours()
│   └── formatters.ts                               # (existing — no changes needed)
├── components/
│   └── screens/
│       └── AddTimeLog/
│           ├── AddTimeLogScreen.tsx                # [NEW] Root screen component
│           ├── TimeFormCard.tsx                    # [NEW] Date/Start/End/Break/Comment/Summary card
│           ├── TimeFieldRow.tsx                    # [NEW] Single labeled time row (Start/End/Break)
│           ├── DateFieldRow.tsx                    # [NEW] Date selector row
│           ├── BreakSection.tsx                    # [NEW] Expandable break pairs list
│           ├── BreakRow.tsx                        # [NEW] Single break pair (start + end + remove)
│           ├── CommentField.tsx                    # [NEW] Optional comment textarea
│           ├── NetHoursSummaryBar.tsx              # [NEW] "Відпрацьовано" computed footer bar
│           ├── UnitsField.tsx                      # [NEW] "Виконано N м²" row (Per-Unit variant)
│           ├── SaveButton.tsx                      # [NEW] White pill button with save icon
│           ├── TimeEntryCard.tsx                   # [NEW] History card (time range + hours + edit icon)
│           ├── TimeEntriesSection.tsx              # [NEW] Records section header + card list
│           └── EmptyEntriesState.tsx               # [NEW] "Немає записів" empty state
```

---

## TypeScript Interfaces

```typescript
// src/types/timeLog.types.ts

export interface BreakPair {
  id: string;          // local UUID for React key
  breakStart: string;  // "HH:MM"
  breakEnd: string;    // "HH:MM"
}

export interface TimeLogFormState {
  logDate: string;          // "YYYY-MM-DD"
  workStart: string;        // "HH:MM"
  workEnd: string;          // "HH:MM"
  breaks: BreakPair[];      // array of break pairs (up to 5)
  comment: string;          // optional free text
  unitsCompleted?: number;  // only for Per-Unit orders
}

export interface TimeLogEntry {
  id: string;
  orderId: string;
  workerId: string;
  logDate: string;          // "YYYY-MM-DD"
  workStart: string;        // "HH:MM"
  workEnd: string;          // "HH:MM"
  breaks: BreakPair[];
  netHours: number;         // computed: decimal hours (e.g., 8.0)
  comment?: string;
  unitsCompleted?: number;
  syncStatus: 'synced' | 'pending';
}

export interface TimeLogValidationError {
  field: 'workStart' | 'workEnd' | `break-${string}` | 'net' | 'units' | 'date';
  message: string;
}

export interface AddTimeLogScreenProps {
  orderId: string;
  orderNumber: string;       // e.g., "000445" — displayed in header
  isPerUnit: boolean;        // controls "Виконано" row visibility
  unitLabel?: string;        // e.g., "м²" — for Per-Unit orders
}
```

---

## MockData.ts

```typescript
// Add to src/services/MockData.ts

import type { TimeLogEntry } from '@/types/timeLog.types';

// Empty state — no logs yet for today
export const MOCK_TIME_LOGS_EMPTY: TimeLogEntry[] = [];

// Populated state — 4 entries for the selected day (matches Figma "Початковий екран" with entries)
export const MOCK_TIME_LOGS_POPULATED: TimeLogEntry[] = [
  {
    id: 'tl-001',
    orderId: 'order-445',
    workerId: 'worker-001',
    logDate: '2026-03-27',
    workStart: '08:00',
    workEnd: '17:00',
    breaks: [{ id: 'b1', breakStart: '12:00', breakEnd: '13:00' }],
    netHours: 8.0,
    comment: '',
    syncStatus: 'synced',
  },
  {
    id: 'tl-002',
    orderId: 'order-445',
    workerId: 'worker-001',
    logDate: '2026-03-27',
    workStart: '18:00',
    workEnd: '20:30',
    breaks: [],
    netHours: 2.5,
    comment: 'Доробляв фасад після дощу',
    syncStatus: 'synced',
  },
  {
    id: 'tl-003',
    orderId: 'order-445',
    workerId: 'worker-001',
    logDate: '2026-03-27',
    workStart: '07:00',
    workEnd: '19:30',
    breaks: [
      { id: 'b2', breakStart: '10:00', breakEnd: '10:30' },
      { id: 'b3', breakStart: '13:00', breakEnd: '14:00' },
    ],
    netHours: 11.0,
    comment: 'Перерви: 1.5 год • Важка зміна',
    syncStatus: 'synced',
  },
  {
    id: 'tl-004',
    orderId: 'order-445',
    workerId: 'worker-001',
    logDate: '2026-03-27',
    workStart: '09:00',
    workEnd: '12:00',
    breaks: [],
    netHours: 3.0,
    comment: '(Без перерв)',
    syncStatus: 'synced',
  },
];

// Per-Unit variant mock (Variant B from Figma)
export const MOCK_TIME_LOGS_PER_UNIT: TimeLogEntry[] = [
  {
    id: 'tl-pu-001',
    orderId: 'order-446',
    workerId: 'worker-001',
    logDate: '2026-03-27',
    workStart: '08:00',
    workEnd: '17:00',
    breaks: [{ id: 'b4', breakStart: '12:00', breakEnd: '13:00' }],
    netHours: 8.0,
    unitsCompleted: 130,
    syncStatus: 'synced',
  },
];
```

---

## timeLogService.ts

```typescript
// src/services/timeLogService.ts

import {
  MOCK_TIME_LOGS_EMPTY,
  MOCK_TIME_LOGS_POPULATED,
} from '@/services/MockData';
import type { TimeLogEntry, TimeLogFormState } from '@/types/timeLog.types';

const SIMULATED_DELAY_MS = 500;

/**
 * Fetch all time log entries for a given order + date.
 * TODO: Replace mock with:
 *   fetch(`/api/v1/orders/${orderId}/time-logs?date=${date}`, { ... })
 */
export async function fetchTimeLogsByDate(
  orderId: string,
  date: string
): Promise<TimeLogEntry[]> {
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY_MS));
  // Toggle to MOCK_TIME_LOGS_POPULATED to see the populated state
  return MOCK_TIME_LOGS_EMPTY;
}

/**
 * Save a new time log entry.
 * TODO: Replace mock with:
 *   fetch(`/api/v1/orders/${orderId}/time-logs`, { method: 'POST', body: JSON.stringify(form) })
 * Returns the saved entry. Throws on validation/409 conflict.
 */
export async function saveTimeLog(
  orderId: string,
  form: TimeLogFormState,
  netHours: number
): Promise<TimeLogEntry> {
  await new Promise((r) => setTimeout(r, 800));

  // Simulate 409 Conflict for duplicate entry:
  // throw Object.assign(new Error('Conflict'), { status: 409 });

  const entry: TimeLogEntry = {
    id: `tl-${Date.now()}`,
    orderId,
    workerId: 'worker-001',
    logDate: form.logDate,
    workStart: form.workStart,
    workEnd: form.workEnd,
    breaks: form.breaks,
    netHours,
    comment: form.comment || undefined,
    unitsCompleted: form.unitsCompleted,
    syncStatus: 'synced',
  };
  return entry;
}
```

---

## timeUtils.ts

```typescript
// src/utils/timeUtils.ts
// Traces to: Scenario §4 BR-TL-002, BR-TL-003

import type { BreakPair } from '@/types/timeLog.types';

/**
 * Parse "HH:MM" to total minutes from midnight.
 */
export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Calculate net worked minutes.
 * Handles midnight-crossing shifts: if end < start, adds 24*60.
 *
 * Traces to: Scenario BR-TL-002, BR-TL-003
 */
export function calculateNetMinutes(
  workStart: string,
  workEnd: string,
  breaks: BreakPair[]
): number {
  let start = parseTimeToMinutes(workStart);
  let end = parseTimeToMinutes(workEnd);

  // Midnight-crossing shift (BR-TL-003)
  if (end < start) {
    end += 24 * 60;
  }

  const grossMinutes = end - start;

  const breakMinutes = breaks.reduce((acc, b) => {
    if (!b.breakStart || !b.breakEnd) return acc;
    let bStart = parseTimeToMinutes(b.breakStart);
    let bEnd = parseTimeToMinutes(b.breakEnd);
    if (bEnd < bStart) bEnd += 24 * 60; // break spanning midnight
    return acc + Math.max(0, bEnd - bStart);
  }, 0);

  return Math.max(0, grossMinutes - breakMinutes);
}

/**
 * Format decimal hours for display: 8.0 → "8.0 год", 2.5 → "2.5 год"
 * Traces to: Scenario §12.1 Price/Number Formats
 */
export function formatHours(minutes: number): string {
  const hours = minutes / 60;
  return `${hours.toFixed(1)} год`;
}

/**
 * Format today's date as display string in Ukrainian.
 * Returns: "сьогодні, 27 березня" (for today) or "27 березня" (for other dates)
 */
export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const dayMonth = date.toLocaleString('uk', { day: 'numeric', month: 'long' });

  return isToday ? `сьогодні, ${dayMonth}` : dayMonth;
}

/**
 * Get today's date in YYYY-MM-DD format.
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Validate break pairs — no overlap, end > start.
 * Returns null if valid, or an error string.
 * Traces to: Scenario BR-TL-004
 */
export function validateBreaks(breaks: BreakPair[]): string | null {
  const parsed = breaks
    .filter((b) => b.breakStart && b.breakEnd)
    .map((b) => ({
      id: b.id,
      start: parseTimeToMinutes(b.breakStart),
      end:
        parseTimeToMinutes(b.breakEnd) < parseTimeToMinutes(b.breakStart)
          ? parseTimeToMinutes(b.breakEnd) + 24 * 60
          : parseTimeToMinutes(b.breakEnd),
    }));

  for (const b of parsed) {
    if (b.end <= b.start) return `Кінець перерви має бути після початку`;
  }

  for (let i = 0; i < parsed.length; i++) {
    for (let j = i + 1; j < parsed.length; j++) {
      const a = parsed[i], bj = parsed[j];
      if (a.start < bj.end && bj.start < a.end) {
        return `Перерви перетинаються`;
      }
    }
  }

  return null;
}

/**
 * Format units completed for display.
 * Traces to: Scenario §12.1 Price/Number Formats — "0 м²", "130 м²"
 */
export function formatUnits(value: number, label: string): string {
  return `${Math.round(value)} ${label}`;
}
```

---

## useTimeLogForm.ts

```typescript
// src/hooks/useTimeLogForm.ts
// Traces to: Scenario §4 Main Flow, §6 Edge Cases, ADR-005-B

import { useState, useMemo, useCallback } from 'react';
import { nanoid } from 'nanoid'; // or use crypto.randomUUID()
import type { TimeLogFormState, BreakPair, TimeLogValidationError } from '@/types/timeLog.types';
import {
  calculateNetMinutes,
  validateBreaks,
  getTodayISO,
} from '@/utils/timeUtils';

const MAX_BREAKS = 5;  // BR-TL-004

interface UseTimeLogFormReturn {
  form: TimeLogFormState;
  netMinutes: number;
  isValid: boolean;
  errors: TimeLogValidationError[];
  setDate: (date: string) => void;
  setWorkStart: (time: string) => void;
  setWorkEnd: (time: string) => void;
  addBreak: () => void;
  removeBreak: (id: string) => void;
  updateBreak: (id: string, field: 'breakStart' | 'breakEnd', value: string) => void;
  setComment: (text: string) => void;
  setUnitsCompleted: (n: number) => void;
  canAddBreak: boolean;
}

export function useTimeLogForm(isPerUnit: boolean): UseTimeLogFormReturn {
  const [form, setForm] = useState<TimeLogFormState>({
    logDate: getTodayISO(),
    workStart: '08:00',
    workEnd: '17:00',
    breaks: [],
    comment: '',
    unitsCompleted: isPerUnit ? 0 : undefined,
  });

  // Derived: net minutes — recomputed on every field change
  const netMinutes = useMemo(
    () => calculateNetMinutes(form.workStart, form.workEnd, form.breaks),
    [form.workStart, form.workEnd, form.breaks]
  );

  // Derived: validation errors
  const errors = useMemo<TimeLogValidationError[]>(() => {
    const errs: TimeLogValidationError[] = [];
    if (netMinutes <= 0) {
      errs.push({ field: 'net', message: 'Час роботи має бути більше 0' });
    }
    const breakErr = validateBreaks(form.breaks);
    if (breakErr) {
      errs.push({ field: 'break-overlap', message: breakErr });
    }
    if (isPerUnit && form.unitsCompleted !== undefined && form.unitsCompleted < 0) {
      errs.push({ field: 'units', message: 'Кількість виконаних одиниць ≥ 0' });
    }
    return errs;
  }, [netMinutes, form.breaks, isPerUnit, form.unitsCompleted]);

  const isValid = errors.length === 0 && !!form.workStart && !!form.workEnd;

  const setDate = useCallback((date: string) => {
    setForm((f) => ({ ...f, logDate: date }));
  }, []);

  const setWorkStart = useCallback((time: string) => {
    setForm((f) => ({ ...f, workStart: time }));
  }, []);

  const setWorkEnd = useCallback((time: string) => {
    setForm((f) => ({ ...f, workEnd: time }));
  }, []);

  const addBreak = useCallback(() => {
    setForm((f) => ({
      ...f,
      breaks: [...f.breaks, { id: nanoid(), breakStart: '', breakEnd: '' }],
    }));
  }, []);

  const removeBreak = useCallback((id: string) => {
    setForm((f) => ({ ...f, breaks: f.breaks.filter((b) => b.id !== id) }));
  }, []);

  const updateBreak = useCallback(
    (id: string, field: 'breakStart' | 'breakEnd', value: string) => {
      setForm((f) => ({
        ...f,
        breaks: f.breaks.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
      }));
    },
    []
  );

  const setComment = useCallback((text: string) => {
    setForm((f) => ({ ...f, comment: text }));
  }, []);

  const setUnitsCompleted = useCallback((n: number) => {
    setForm((f) => ({ ...f, unitsCompleted: n }));
  }, []);

  return {
    form,
    netMinutes,
    isValid,
    errors,
    setDate,
    setWorkStart,
    setWorkEnd,
    addBreak,
    removeBreak,
    updateBreak,
    setComment,
    setUnitsCompleted,
    canAddBreak: form.breaks.length < MAX_BREAKS,
  };
}
```

---

## Design Tokens — Tailwind Config Extension

```typescript
// Extend existing tailwind.config.js — add W2.1-specific tokens:
// All values from Scenario §12.1 Color Table

theme: {
  extend: {
    colors: {
      // --- EXISTING from W1/W2/W3 (already present — verify) ---
      'bg-primary':      '#222226',   // Screen background
      'bg-card':         '#2d2d31',   // Form card, TimeEntryCard bg
      'bg-input':        '#3e3e42',   // Date/Time chips, comment textarea
      'text-primary':    '#ededed',   // Labels
      'text-secondary':  '#878787',   // Placeholders, secondary labels
      'border-subtle':   'rgba(255,255,255,0.08)',  // Dividers, card borders
      'status-success':  '#34d399',   // Net hours ≤ 8h, success entries
      'status-warning':  '#fbbf24',   // Net hours > 8h (overtime), warning entries

      // --- NEW for W2.1 ---
      'net-hours-bg':   'rgba(52,211,153,0.1)',   // "Відпрацьовано" bar background
    },
    borderRadius: {
      // --- EXISTING from W1/W2 ---
      'card':   '20px',   // Task cards, form card (Card 7)
      // --- NEW for W2.1 ---
      'chip':   '10px',   // Date/Time field chips
      'field':  '16px',   // Comment textarea, Summary bar, TimeEntryCard
      'pill':   '32px',   // Save button
      'circle': '9999px', // Close button
    },
    fontSize: {
      // --- EXISTING from W1 ---
      'screen-title': ['17px', { lineHeight: '20.4px', fontWeight: '600', letterSpacing: '-0.43px' }],
      // --- NEW for W2.1 ---
      'field-label':  ['17px', { lineHeight: '20.4px', fontWeight: '400', letterSpacing: '-0.43px' }],
      'chip-value':   ['15px', { lineHeight: '18px', fontWeight: '500', letterSpacing: '0px' }],
      'add-break':    ['17px', { lineHeight: '20.4px', fontWeight: '600', letterSpacing: '-0.43px' }],
      'net-value':    ['24px', { lineHeight: '28.8px', fontWeight: '500', letterSpacing: '0px' }],
      'records-head': ['18px', { lineHeight: '28px', fontWeight: '600', letterSpacing: '-0.44px' }],
      'entry-time':   ['15px', { lineHeight: '18px', fontWeight: '500', letterSpacing: '0px' }],
      'entry-sub':    ['11px', { lineHeight: '13.2px', fontWeight: '400', letterSpacing: '0.06px' }],
      'entry-hours':  ['15px', { lineHeight: '18px', fontWeight: '500', letterSpacing: '0px' }],
    },
  },
},
```

---

## Icon Configuration (Authoritative)

```typescript
// src/constants/timeLogIcons.ts
// Traces to: Scenario §12.1 Icon Inventory

// Icon IDs from Figma data-name attributes
export const ICON_CALENDAR = 'radix-icons:calendar';      // Date row
export const ICON_TIME     = 'mingcute:time-line';         // Start/End rows
export const ICON_SAVE     = 'fluent:save-16-regular';     // Save button
export const ICON_PENCIL   = 'material-symbols:edit-outline'; // TimeEntryCard edit (closest to PencilIcon SVG)
export const ICON_CLOCK_ENTRY = 'mingcute:time-line';      // TimeEntryCard left icon (small, 16px)
export const ICON_EMPTY_STATE = 'material-symbols:work-history-outline'; // Empty state icon

// Hours color based on overtime threshold (default: 8h)
export function getHoursColor(netHours: number, overtimeThreshold = 8): string {
  return netHours > overtimeThreshold
    ? '#fbbf24'   // warning — overtime
    : '#34d399';  // success — normal
}
```

---

## External Dependencies

| Package | Version | Purpose | Usage |
|---------|---------|---------|-------|
| `@iconify/react` | latest | All icons — exact Figma `data-name` IDs | `<Icon icon="radix-icons:calendar" width={20} />` |
| `@tanstack/react-query` | v5 | Fetch + cache time log history | `useQuery({ queryKey: ['time-logs', orderId, date] })` |
| `@twa-dev/sdk` | latest | BackButton, safe-area | `WebApp.BackButton.show()` |
| `nanoid` | v5 | Generate local IDs for break pairs | `nanoid()` in `addBreak()` |

> **All packages except `nanoid` are already installed.** Check if `nanoid` is in `package.json`; if not: `npm install nanoid`.

---

## Step-by-Step Implementation

### Step 1 — Types & Interfaces
1. Create `src/types/timeLog.types.ts` with `BreakPair`, `TimeLogFormState`, `TimeLogEntry`, `TimeLogValidationError`, `AddTimeLogScreenProps`.
2. Verify `BreakPair.id` is a string UUID (for React `key` and removal).
3. Mark `unitsCompleted?: number` as optional — only used for Per-Unit orders.

### Step 2 — Utility Functions
1. Create `src/utils/timeUtils.ts` with all functions from the code block above.
2. **Critical validation:** test `calculateNetMinutes('23:00', '07:00', [])` → must return `480` (8 hours overnight).
3. **Critical validation:** test `formatHours(480)` → must return `"8.0 год"`.
4. **Critical validation:** test `validateBreaks([{breakStart:'12:00', breakEnd:'13:00'},{breakStart:'12:30', breakEnd:'14:00'}])` → must return an overlap error string.

### Step 3 — Mock Data
1. Add `MOCK_TIME_LOGS_EMPTY` and `MOCK_TIME_LOGS_POPULATED` to `src/services/MockData.ts`.
2. Ensure populated mock has **4 entries** matching Figma: `8.0`, `2.5`, `11.0`, `3.0` hours.
3. The entry with `11.0 god` should have `netHours: 11.0` — will render in `#fbbf24` overtime color.
4. Add `MOCK_TIME_LOGS_PER_UNIT` for Variant B testing.

### Step 4 — Service Layer
1. Create `src/services/timeLogService.ts` with `fetchTimeLogsByDate()` and `saveTimeLog()`.
2. `fetchTimeLogsByDate` default return: `MOCK_TIME_LOGS_EMPTY` (so screen starts in empty state).
3. Comment in `MOCK_TIME_LOGS_POPULATED` to test populated state.

### Step 5 — Icon Constants
1. Create `src/constants/timeLogIcons.ts` with all icon IDs and `getHoursColor()` utility.
2. Verify `getHoursColor(11.0, 8)` → `'#fbbf24'` and `getHoursColor(3.0, 8)` → `'#34d399'`.

### Step 6 — Custom Form Hook
1. Create `src/hooks/useTimeLogForm.ts` per the code block above.
2. Install `nanoid` if missing: `npm install nanoid`.
3. **Critical:** ensure `netMinutes` updates live on every field change (is in `useMemo` dependencies).
4. **Critical:** `canAddBreak: form.breaks.length < MAX_BREAKS` — Save renders + button disabled if `!isValid`.

### Step 7 — Tailwind Tokens
1. Add W2.1-specific tokens to `tailwind.config.js` per the config block above.
2. Key new tokens: `'bg-input'`, `'net-hours-bg'`, `'chip'`, `'field'`, `'pill'` border-radius, `'field-label'`, `'net-value'`, `'records-head'`, `'entry-time'`, `'entry-sub'` font sizes.

### Step 8 — DateFieldRow Component

```tsx
// src/components/screens/AddTimeLog/DateFieldRow.tsx
// Traces to: Scenario §7 UI Elements — Date Row, node 255:11098

import { Icon } from '@iconify/react';
import { ICON_CALENDAR } from '@/constants/timeLogIcons';
import { formatDateDisplay } from '@/utils/timeUtils';

interface DateFieldRowProps {
  date: string;       // "YYYY-MM-DD"
  onChange: (date: string) => void;
}

export function DateFieldRow({ date, onChange }: DateFieldRowProps) {
  return (
    <div className="flex items-center justify-between h-[32px] w-full">
      {/* Label */}
      <div className="flex items-center gap-[12px]">
        <Icon icon={ICON_CALENDAR} width={20} color="#ededed" />
        <span className="text-field-label text-text-primary">Дата</span>
      </div>
      {/* Native date input hidden behind chip */}
      <div className="relative">
        <div className="bg-bg-input rounded-chip px-[12px] py-[8px] text-chip-value text-text-primary whitespace-nowrap">
          {formatDateDisplay(date)}
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
          // Native date picker opens on tap (ADR-005-C)
        />
      </div>
    </div>
  );
}
```

### Step 9 — TimeFieldRow Component

```tsx
// src/components/screens/AddTimeLog/TimeFieldRow.tsx
// Traces to: Scenario §7 UI Elements — Start/End rows, nodes 255:11108, 255:11121

import { Icon } from '@iconify/react';
import { ICON_TIME } from '@/constants/timeLogIcons';

interface TimeFieldRowProps {
  label: string;      // "Початок" | "Кінець"
  value: string;      // "HH:MM"
  onChange: (time: string) => void;
}

export function TimeFieldRow({ label, value, onChange }: TimeFieldRowProps) {
  return (
    <div className="flex items-center justify-between h-[32px] w-full">
      <div className="flex items-center gap-[12px]">
        <Icon icon={ICON_TIME} width={20} color="#ededed" />
        <span className="text-field-label text-text-primary">{label}</span>
      </div>
      <div className="relative">
        <div className="bg-bg-input rounded-chip px-[12px] py-[8px] text-chip-value text-text-primary min-w-[76px] text-center">
          {value || '--:--'}
        </div>
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
```

### Step 10 — BreakRow Component

```tsx
// src/components/screens/AddTimeLog/BreakRow.tsx
// Traces to: Scenario §5.3, BR-TL-004

import type { BreakPair } from '@/types/timeLog.types';

interface BreakRowProps {
  breakPair: BreakPair;
  onUpdate: (id: string, field: 'breakStart' | 'breakEnd', value: string) => void;
  onRemove: (id: string) => void;
  error?: string;
}

export function BreakRow({ breakPair, onUpdate, onRemove, error }: BreakRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-text-secondary text-[13px]">Перерва</span>
        <div className="relative flex-1">
          <div className="bg-bg-input rounded-chip px-[12px] py-[8px] text-chip-value text-text-primary text-center">
            {breakPair.breakStart || '--:--'}
          </div>
          <input
            type="time"
            value={breakPair.breakStart}
            onChange={(e) => onUpdate(breakPair.id, 'breakStart', e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        <span className="text-text-secondary">—</span>
        <div className="relative flex-1">
          <div className="bg-bg-input rounded-chip px-[12px] py-[8px] text-chip-value text-text-primary text-center">
            {breakPair.breakEnd || '--:--'}
          </div>
          <input
            type="time"
            value={breakPair.breakEnd}
            onChange={(e) => onUpdate(breakPair.id, 'breakEnd', e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        <button
          onClick={() => onRemove(breakPair.id)}
          className="text-text-secondary text-[20px] leading-none px-2"
          aria-label="Видалити перерву"
        >
          ✕
        </button>
      </div>
      {error && (
        <p className="text-[12px] text-status-warning pl-2">{error}</p>
      )}
    </div>
  );
}
```

### Step 11 — NetHoursSummaryBar Component

```tsx
// src/components/screens/AddTimeLog/NetHoursSummaryBar.tsx
// Traces to: Scenario §7 UI Elements — "Відпрацьовано" row, node 255:11134

import { formatHours } from '@/utils/timeUtils';

interface NetHoursSummaryBarProps {
  netMinutes: number;
  isPerUnit?: boolean;
  unitsCompleted?: number;
  unitLabel?: string;
}

export function NetHoursSummaryBar({
  netMinutes,
  isPerUnit,
  unitsCompleted,
  unitLabel = 'м²',
}: NetHoursSummaryBarProps) {
  const hours = netMinutes / 60;
  const hoursStr = `${hours.toFixed(1)} год`;
  const valueStr = isPerUnit
    ? `${hoursStr} • ${Math.round(unitsCompleted ?? 0)} ${unitLabel}`
    : hoursStr;

  return (
    <div
      className="flex items-center justify-between px-[16px] rounded-field h-[56px] w-full"
      style={{ background: 'rgba(52,211,153,0.1)' }}
    >
      {/* Left: label */}
      <span className="text-field-label text-white">
        {isPerUnit ? 'Підсумок' : 'Відпрацьовано'}
      </span>
      {/* Right: value — Space Grotesk, green, 24px */}
      <span
        className="font-['Space_Grotesk',sans-serif] font-medium text-[24px] leading-[28.8px] text-status-success"
      >
        {valueStr}
      </span>
    </div>
  );
}
```

### Step 12 — TimeEntryCard Component

```tsx
// src/components/screens/AddTimeLog/TimeEntryCard.tsx
// Traces to: Scenario §7 UI Elements — TimeEntryCard, node 265:11607

import { Icon } from '@iconify/react';
import { ICON_CLOCK_ENTRY, ICON_PENCIL, getHoursColor } from '@/constants/timeLogIcons';
import type { TimeLogEntry } from '@/types/timeLog.types';

interface TimeEntryCardProps {
  entry: TimeLogEntry;
  onEdit?: (entry: TimeLogEntry) => void;
}

export function TimeEntryCard({ entry, onEdit }: TimeEntryCardProps) {
  const subtitle = entry.comment || '';
  const hoursColor = getHoursColor(entry.netHours);
  const hoursStr = `${entry.netHours.toFixed(1)} год`;

  return (
    <div
      className="bg-bg-card border border-[rgba(255,255,255,0.08)] rounded-field h-[74px] w-full flex items-center justify-between px-[17px]"
    >
      {/* Left: time + subtitle */}
      <div className="flex flex-col gap-[4px] flex-1 min-w-0">
        <div className="flex items-center gap-[6px] h-[20px]">
          <Icon icon={ICON_CLOCK_ENTRY} width={16} color="#ededed" />
          <span
            className="font-['Space_Grotesk',sans-serif] font-medium text-[15px] leading-[18px] text-text-primary"
          >
            {entry.workStart} - {entry.workEnd}
          </span>
        </div>
        {subtitle && (
          <p className="text-entry-sub text-text-secondary pl-[22px] truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: hours + edit button */}
      <div className="flex items-center gap-[12px] shrink-0">
        <span
          className="font-['Space_Grotesk',sans-serif] font-medium text-[15px] leading-[18px]"
          style={{ color: hoursColor }}
        >
          {hoursStr}
        </span>
        <button
          onClick={() => onEdit?.(entry)}
          className="size-[24px] flex items-center justify-center"
          aria-label="Редагувати запис"
        >
          <Icon icon={ICON_PENCIL} width={24} color="#ededed" />
        </button>
      </div>
    </div>
  );
}
```

### Step 13 — EmptyEntriesState Component

```tsx
// src/components/screens/AddTimeLog/EmptyEntriesState.tsx
// Traces to: Scenario §8 State "Empty", node 261:11397

import { Icon } from '@iconify/react';
import { ICON_EMPTY_STATE } from '@/constants/timeLogIcons';

export function EmptyEntriesState() {
  return (
    <div className="bg-bg-card rounded-field flex flex-col items-center justify-center py-8 px-4 gap-3 w-full">
      <div
        className="rounded-full flex items-center justify-center"
        style={{ width: 64, height: 64, background: '#3e3e42' }}
      >
        <Icon icon={ICON_EMPTY_STATE} width={32} color="#878787" />
      </div>
      <p className="text-[15px] font-medium text-text-primary leading-5">Немає записів</p>
      <p className="text-[13px] text-text-secondary text-center leading-5">
        За обраний день ще нічого не додано
      </p>
    </div>
  );
}
```

### Step 14 — TimeEntriesSection Component

```tsx
// src/components/screens/AddTimeLog/TimeEntriesSection.tsx
// Traces to: Scenario §7 — Records section, node 255:11140

import { TimeEntryCard } from './TimeEntryCard';
import { EmptyEntriesState } from './EmptyEntriesState';
import type { TimeLogEntry } from '@/types/timeLog.types';
import { formatDateDisplay } from '@/utils/timeUtils';

interface TimeEntriesSectionProps {
  date: string;
  entries: TimeLogEntry[];
  onEdit?: (entry: TimeLogEntry) => void;
}

export function TimeEntriesSection({ date, entries, onEdit }: TimeEntriesSectionProps) {
  const totalHours = entries.reduce((sum, e) => sum + e.netHours, 0);
  const totalStr = totalHours > 0 ? `${totalHours.toFixed(1)} год` : undefined;

  return (
    <div className="flex flex-col gap-[16px] px-[16px] w-full">
      {/* Section header */}
      <div className="flex items-center justify-between h-[28px] px-[4px]">
        <span className="text-records-head text-accent-primary">
          Записи за {formatDateDisplay(date).replace('сьогодні, ', '')}
        </span>
        {totalStr && (
          <span className="text-[15px] text-text-secondary leading-[18px]">
            {totalStr}
          </span>
        )}
      </div>

      {/* Entry cards or empty state */}
      {entries.length === 0 ? (
        <EmptyEntriesState />
      ) : (
        <div className="flex flex-col gap-[12px]">
          {entries.map((entry) => (
            <TimeEntryCard key={entry.id} entry={entry} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 15 — TimeFormCard Component

```tsx
// src/components/screens/AddTimeLog/TimeFormCard.tsx
// Traces to: Scenario §7 — Card 7 (form card), node 255:11097

import { useTimeLogForm } from '@/hooks/useTimeLogForm';
import { DateFieldRow } from './DateFieldRow';
import { TimeFieldRow } from './TimeFieldRow';
import { BreakRow } from './BreakRow';
import { NetHoursSummaryBar } from './NetHoursSummaryBar';
import { UnitsField } from './UnitsField';

interface TimeFormCardProps {
  hook: ReturnType<typeof useTimeLogForm>;
  isPerUnit: boolean;
  unitLabel?: string;
  onSave: () => void;
  isSaving: boolean;
}

export function TimeFormCard({ hook, isPerUnit, unitLabel, onSave, isSaving }: TimeFormCardProps) {
  const {
    form, netMinutes, isValid, errors,
    setDate, setWorkStart, setWorkEnd,
    addBreak, removeBreak, updateBreak,
    setComment, setUnitsCompleted,
    canAddBreak,
  } = hook;

  const breakError = errors.find((e) => e.field.startsWith('break'))?.message;

  return (
    <div className="bg-bg-card rounded-card p-[16px] flex flex-col gap-[12px] w-[358px]">
      {/* Date row */}
      <DateFieldRow date={form.logDate} onChange={setDate} />

      {/* Divider */}
      <div className="h-px w-full bg-border-subtle" />

      {/* Start time */}
      <TimeFieldRow label="Початок" value={form.workStart} onChange={setWorkStart} />

      {/* End time */}
      <TimeFieldRow label="Кінець" value={form.workEnd} onChange={setWorkEnd} />

      {/* Break pairs */}
      {form.breaks.map((bp) => (
        <BreakRow
          key={bp.id}
          breakPair={bp}
          onUpdate={updateBreak}
          onRemove={removeBreak}
          error={breakError}
        />
      ))}

      {/* Add break link */}
      {canAddBreak && (
        <button
          onClick={addBreak}
          className="text-add-break text-text-secondary text-center w-full"
        >
          + Додати перерву
        </button>
      )}

      {/* Separator for units field (Per-Unit variant) */}
      {isPerUnit && <div className="h-px w-full bg-border-subtle" />}

      {/* Units field — only for Per-Unit orders */}
      {isPerUnit && (
        <UnitsField
          value={form.unitsCompleted ?? 0}
          unitLabel={unitLabel ?? 'м²'}
          onChange={setUnitsCompleted}
        />
      )}

      {/* Comment textarea */}
      <textarea
        value={form.comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Додайте коментар (необов'язково)"
        className="bg-bg-input border border-border-subtle rounded-field px-[13px] py-[13px] text-[15px] font-normal text-text-primary placeholder:text-text-secondary leading-[18px] resize-none h-[48px] w-full focus:outline-none"
      />

      {/* Net hours summary bar */}
      <NetHoursSummaryBar
        netMinutes={netMinutes}
        isPerUnit={isPerUnit}
        unitsCompleted={form.unitsCompleted}
        unitLabel={unitLabel}
      />

      {/* Save button */}
      <button
        onClick={onSave}
        disabled={!isValid || isSaving}
        className={`
          flex items-center justify-center gap-[8px] h-[48px] w-full rounded-pill
          font-['Inter',sans-serif] font-semibold text-[17px] leading-[20.4px] tracking-[-0.43px]
          transition-opacity
          ${isValid && !isSaving ? 'bg-white text-[#222226]' : 'bg-white/30 text-[#222226]/50'}
        `}
        aria-label="Зберегти запис"
      >
        {/* Save icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {/* fluent:save-16-regular equivalent */}
          <path d="M5 4h11l3 3v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="#222226" strokeWidth="1.5"/>
          <rect x="8" y="13" width="8" height="6" rx="1" stroke="#222226" strokeWidth="1.5"/>
          <path d="M8 4v5h7V4" stroke="#222226" strokeWidth="1.5"/>
        </svg>
        {isSaving ? 'Збереження...' : 'Зберегти'}
      </button>
    </div>
  );
}
```

> **Note on Save icon:** The Figma Save button uses `fluent:save-16-regular` (captured from MCP output). Use `<Icon icon="fluent:save-16-regular" width={24} />` from `@iconify/react` if available, OR the inline SVG above as a fallback.

### Step 16 — AddTimeLogScreen Root

```tsx
// src/components/screens/AddTimeLog/AddTimeLogScreen.tsx
// Traces to: Scenario §3, §4, §8, ADR-005-A, ADR-005-B

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import WebApp from '@twa-dev/sdk';

import { useTimeLogForm } from '@/hooks/useTimeLogForm';
import { fetchTimeLogsByDate, saveTimeLog } from '@/services/timeLogService';
import { TimeFormCard } from './TimeFormCard';
import { TimeEntriesSection } from './TimeEntriesSection';

// Props injected by router or parent component
interface AddTimeLogScreenProps {
  orderNumber?: string;    // "000445" — fallback if not in route
  isPerUnit?: boolean;
  unitLabel?: string;
}

export function AddTimeLogScreen({
  orderNumber = '000000',
  isPerUnit = false,
  unitLabel = 'м²',
}: AddTimeLogScreenProps) {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const formHook = useTimeLogForm(isPerUnit);
  const { form } = formHook;

  // Register TMA BackButton — navigate back to Order Hub
  useEffect(() => {
    WebApp.BackButton.show();
    const handleBack = () => navigate(`/orders/${orderId}`);
    WebApp.BackButton.onClick(handleBack);
    return () => {
      WebApp.BackButton.offClick(handleBack);
      WebApp.BackButton.hide();
    };
  }, [orderId, navigate]);

  // Fetch existing time entries for this date
  const { data: entries = [] } = useQuery({
    queryKey: ['time-logs', orderId, form.logDate],
    queryFn: () => fetchTimeLogsByDate(orderId!, form.logDate),
    enabled: !!orderId,
  });

  // Save mutation
  const { mutate: handleSave, isPending: isSaving } = useMutation({
    mutationFn: () => saveTimeLog(orderId!, form, formHook.netMinutes / 60),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-logs', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      navigate(`/orders/${orderId}`);
    },
    onError: (err: Error & { status?: number }) => {
      if (err.status === 409) {
        alert('Запис на цей день вже існує'); // TODO: replace with toast component
      } else {
        alert('Помилка збереження. Спробуйте ще раз.');
      }
    },
  });

  return (
    <div
      className="bg-bg-primary min-h-screen flex flex-col"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-[16px] h-[68px] shrink-0">
        <span className="text-screen-title text-text-primary">
          Додати облік • №{orderNumber}
        </span>
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="bg-bg-card border border-bg-input rounded-circle size-[40px] flex items-center justify-center"
          aria-label="Закрити"
        >
          {/* ✕ Close icon — CrossIcon from Figma, rendered as text */}
          <span className="text-text-primary text-[18px] leading-none">✕</span>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex flex-col gap-[24px] px-[16px] pb-[32px] overflow-y-auto">
        {/* Form card */}
        <TimeFormCard
          hook={formHook}
          isPerUnit={isPerUnit}
          unitLabel={unitLabel}
          onSave={() => handleSave()}
          isSaving={isSaving}
        />

        {/* Records section */}
        <TimeEntriesSection
          date={form.logDate}
          entries={entries}
          onEdit={(entry) => {
            // TODO: Open Edit BottomSheet (planned per Figma annotation §12 Q3)
            console.log('Edit entry:', entry.id);
          }}
        />
      </div>
    </div>
  );
}
```

### Step 17 — Router Registration
1. Add route to your router config:
```tsx
// In App.tsx or router.ts — alongside other Worker routes
<Route path="/orders/:orderId/add-time" element={<AddTimeLogScreen />} />
```
2. From Order Hub (W2), the `[+ Add Time]` button should navigate to:
```tsx
navigate(`/orders/${order.id}/add-time`, {
  state: {
    orderNumber: order.number,
    isPerUnit: order.paymentModel === 'per-unit',
    unitLabel: order.unitLabel ?? 'м²',
  }
});
```
3. Extract `orderNumber`, `isPerUnit`, `unitLabel` from `location.state` in `AddTimeLogScreen` (use `useLocation()` hook).

### Step 18 — UnitsField Component (Variant B only)

```tsx
// src/components/screens/AddTimeLog/UnitsField.tsx
// Only rendered when isPerUnit === true (ADR-005 Variant B)
// Traces to: Scenario §5.1, node 307:48128

import { Icon } from '@iconify/react';

interface UnitsFieldProps {
  value: number;
  unitLabel: string;
  onChange: (n: number) => void;
}

export function UnitsField({ value, unitLabel, onChange }: UnitsFieldProps) {
  return (
    <div className="flex items-center justify-between h-[32px] w-full">
      <div className="flex items-center gap-[12px]">
        <Icon icon="material-symbols:check-circle-outline" width={20} color="#ededed" />
        <span className="text-field-label text-text-primary">Виконано</span>
      </div>
      <div className="relative">
        <div className="bg-bg-input rounded-chip px-[12px] py-[8px] text-chip-value text-text-primary min-w-[76px] text-center">
          {value} {unitLabel}
        </div>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
```

---

## Verification Gate — Implementation Checklist

After implementation, verify each item before marking screen as done:

### ✅ Visual Fidelity Check (against Figma screenshots)
- [ ] Screen background matches `#222226`
- [ ] Form card uses `bg-bg-card (#2d2d31)`, `rounded-card (20px)`, padding `16px`
- [ ] Date/Time chips: `bg-bg-input (#3E3E42)`, `rounded-chip (10px)`, Space Grotesk 15px Medium
- [ ] Comment textarea: `bg-bg-input`, `rounded-field (16px)`, 1px border `rgba(255,255,255,0.08)`
- [ ] "Відпрацьовано" bar: `rgba(52,211,153,0.1)` bg, `rounded-field (16px)`, green value 24px Space Grotesk
- [ ] Save button: white bg, `rounded-pill (32px)`, Inter SemiBold 17px, dark text `#222226`
- [ ] Empty state: `material-symbols:work-history-outline` present, correct subtitle text
- [ ] TimeEntryCard: `bg-card`, `rounded-field`, border, height 74px, correct font sizes

### ✅ Figma Icon Extraction Check
- [ ] `radix-icons:calendar` icon in Date row (20px, #ededed)
- [ ] `mingcute:time-line` icon in Start and End rows (20px, #ededed)
- [ ] `material-symbols:work-history-outline` in empty state (32px)
- [ ] Save button icon renders correctly (fluent:save-16-regular or SVG equivalent)
- [ ] Pencil/Edit icon in TimeEntryCard (24px)
- [ ] NO raw SVG paths or emoji used instead of Iconify icons

### ✅ Color Token Check
- [ ] No raw hex values in JSX outside of `style={{}}` one-off expressions
- [ ] All colors reference Tailwind tokens or CSS custom properties from Scenario §12.1
- [ ] Hours ≤ 8h → `#34d399` (success), hours > 8h → `#fbbf24` (warning) — verified visually

### ✅ Spacing Fidelity Check
- [ ] Screen horizontal padding: `px-[16px]` on form card area
- [ ] Card internal padding: `p-[16px]` (not p-4 = 16px, OK)
- [ ] Gap between form rows: `gap-[12px]`
- [ ] Gap between form card and records section: `gap-[24px]`
- [ ] Gap between TimeEntryCards: `gap-[12px]`
- [ ] TimeEntryCard px-[17px] padding verified

### ✅ Business Logic Check
- [ ] `calculateNetMinutes('08:00', '17:00', [{breakStart:'12:00',breakEnd:'13:00'}])` = 480 min (8.0 god)
- [ ] `calculateNetMinutes('23:00', '07:00', [])` = 480 min (midnight shift)
- [ ] Validation blocks save when netMinutes ≤ 0
- [ ] Max 5 breaks — "Додати перерву" hidden when 5 breaks present
- [ ] Break overlap detection triggers error message
- [ ] Save button disabled when `!isValid`
- [ ] Entries list re-fetches after successful save (`queryClient.invalidateQueries`)

### ✅ TMA Integration Check
- [ ] `Telegram.WebApp.BackButton.show()` called on screen mount
- [ ] BackButton click navigates back to Order Hub
- [ ] BackButton hidden on screen unmount
- [ ] `padding-top: env(safe-area-inset-top)` applied to root container (NOT hardcoded px)

### ✅ Verification Gate Result
**PASS** when all checkboxes above are green.
**FAIL** → identify failing checks, fix, re-verify.

---

*End of TECH_STACK_SCREEN_Add_Time_Log.md. Reviewed against: `scenario/SCREEN_Add_Time_Log.md` v1.0, `adr/ADR_SCREEN_Add_Time_Log.md` v1.0*
