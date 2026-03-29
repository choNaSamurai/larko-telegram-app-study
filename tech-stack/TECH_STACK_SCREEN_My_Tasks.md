# TECH STACK — SCREEN_My_Tasks (W1)

**Traces to:** `scenario/SCREEN_My_Tasks.md` §12.1 | `adr/ADR_SCREEN_My_Tasks.md`
**BRD:** `ba/04_BRD_Larko_MVP.md` §2 Worker — My Tasks
**Figma:** https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=77-5261

---

## Framework & Runtime

| Item | Value |
|------|-------|
| Framework | **React** (Vite + TypeScript) |
| Language | TypeScript (strict mode) |
| TMA SDK | `@twa-dev/sdk` — `Telegram.WebApp` API |
| Styling | **Tailwind CSS v3** with custom tokens (see Design Tokens section) |
| Icons | `@iconify/react` — all icons via Figma `data-name` attribute |
| Data fetching | `@tanstack/react-query` v5 |
| State (UI) | `zustand` |

---

## File Structure

```
src/
├── styles/
│   └── tokens.css                        # CSS custom properties — from Scenario §12.1
├── types/
│   └── task.types.ts                     # TypeScript interfaces for Task domain
├── mocks/
│   └── MockData.ts                       # Static mock task data (all 5 card variants)
├── services/
│   └── tasksService.ts                   # Data access layer (mock → real API later)
├── stores/
│   └── useTaskFilterStore.ts             # Zustand store: active filter tab state
├── utils/
│   └── formatters.ts                     # formatMoney(), formatDeadline()
├── components/
│   └── screens/
│       └── MyTasks/
│           ├── MyTasksScreen.tsx         # Root screen component
│           ├── FilterTabs.tsx            # Pill tab bar (Усі / Нові / В процесі / Виконані)
│           ├── TaskCard.tsx              # Individual task card (all variants)
│           ├── TaskCardSkeleton.tsx      # Loading skeleton card
│           ├── EmptyState.tsx            # Empty state (no tasks)
│           └── ErrorState.tsx            # Error state (load failed)
```

---

## TypeScript Interfaces

```typescript
// src/types/task.types.ts

export type TaskStatus =
  | 'new'
  | 'in_progress'
  | 'overdue'
  | 'checking'
  | 'dispute'
  | 'done';

export type PaymentModel = 'fixed' | 'per_unit' | 'per_hour';

export interface TaskAssignee {
  id: string;
  initials: string;             // e.g. "П", "C"
  color: string;                // bubble bg color hex
}

export interface Task {
  id: string;
  name: string;                 // "Сонячна Станція №4"
  status: TaskStatus;
  companyName: string;          // "ТОВ «СонцеДах»"
  address: string;              // "вул. Київська, 5"
  notes?: string;               // Optional instruction text
  deadline: string;             // ISO date string "2026-03-25"
  paymentModel: PaymentModel;
  amount: number;               // 12400 (raw number, formatted by formatMoney)
  amountPerUnit?: number;       // 400 if per_unit
  unitLabel?: string;           // "шт" if per_unit
  quantity?: number;            // 12 if per_unit
  assignees: TaskAssignee[];
  hasStartButton: boolean;      // true → shows "▶ Почати роботу"
  hasActionButtons: boolean;    // true → shows "+ Додати" + "✓ Завершити"
}

export type FilterTab = 'all' | 'new' | 'in_progress' | 'done';
```

---

## MockData.ts

```typescript
// src/mocks/MockData.ts
import type { Task } from '@/types/task.types';

export const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    name: 'Сонячна Станція №4',
    status: 'new',
    companyName: 'ТОВ «СонцеДах»',
    address: 'вул. Київська, 5',
    notes: 'Ключі в охоронця при вході. Вхід з воріт ззаду',
    deadline: '2026-03-25',
    paymentModel: 'fixed',
    amount: 12400,
    assignees: [
      { id: 'a1', initials: 'П', color: '#34d399' },
      { id: 'a2', initials: 'C', color: '#fbbf24' },
    ],
    hasStartButton: true,
    hasActionButtons: false,
  },
  {
    id: 'task-2',
    name: 'Ремонт електропроводки',
    status: 'in_progress',
    companyName: 'ТОВ «СонцеДах»',
    address: 'вул. Київська, 5',
    notes: 'Ключі в охоронця при вході. Вхід з воріт ззаду',
    deadline: '2026-03-22',
    paymentModel: 'fixed',
    amount: 12400,
    assignees: [],
    hasStartButton: false,
    hasActionButtons: true,
  },
  {
    id: 'task-3',
    name: 'Ремонт електропроводки',
    status: 'overdue',
    companyName: 'ТОВ «СонцеДах»',
    address: 'вул. Київська, 5',
    notes: 'Ключі в охоронця при вході. Вхід з воріт ззаду',
    deadline: '2026-03-22',
    paymentModel: 'fixed',
    amount: 12400,
    assignees: [],
    hasStartButton: false,
    hasActionButtons: true,
  },
  {
    id: 'task-4',
    name: 'Ремонт електропроводки',
    status: 'checking',
    companyName: 'ТОВ «СонцеДах»',
    address: 'вул. Київська, 5',
    notes: 'Ключі в охоронця при вході. Вхід з воріт ззаду',
    deadline: '2026-03-22',
    paymentModel: 'fixed',
    amount: 12400,
    assignees: [],
    hasStartButton: false,
    hasActionButtons: false,
  },
  {
    id: 'task-5',
    name: 'Підключення лічильника',
    status: 'dispute',
    companyName: 'ТОВ «СонцеДах»',
    address: 'вул. Київська, 5',
    notes: 'Ключі в охоронця при вході. Вхід з воріт ззаду',
    deadline: '2026-03-20',
    paymentModel: 'per_unit',
    amount: 400,
    amountPerUnit: 400,
    unitLabel: 'шт',
    quantity: 12,
    assignees: [],
    hasStartButton: false,
    hasActionButtons: false,
  },
  {
    id: 'task-6',
    name: 'Аудит лічильників',
    status: 'new',
    companyName: 'ТОВ «СонцеДах»',
    address: 'вул. Київська, 5',
    notes: 'Ключі в охоронця при вході. Вхід з воріт ззаду',
    deadline: '2026-03-20',
    paymentModel: 'per_unit',
    amount: 400,
    amountPerUnit: 400,
    unitLabel: 'шт',
    quantity: 12,
    assignees: [],
    hasStartButton: false,
    hasActionButtons: false,
  },
];
```

---

## tasksService.ts

```typescript
// src/services/tasksService.ts
import { MOCK_TASKS } from '@/mocks/MockData';
import type { Task, FilterTab } from '@/types/task.types';

// Simulated API delay — remove when connecting real backend
const SIMULATED_DELAY_MS = 600;

/**
 * Fetches all tasks for the authenticated worker.
 * TODO: Replace mock with: fetch('/api/v1/tasks?workerId=me', { headers: { Authorization: `Bearer ${token}` } })
 */
export async function fetchWorkerTasks(): Promise<Task[]> {
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY_MS));

  // Simulate occasional error for testing error state:
  // if (Math.random() < 0.1) throw new Error('Simulated network error');

  return MOCK_TASKS;
}
```

---

## useTaskFilterStore.ts

```typescript
// src/stores/useTaskFilterStore.ts
import { create } from 'zustand';
import type { FilterTab } from '@/types/task.types';

interface TaskFilterState {
  activeFilter: FilterTab;
  setFilter: (tab: FilterTab) => void;
}

export const useTaskFilterStore = create<TaskFilterState>((set) => ({
  activeFilter: 'all',
  setFilter: (tab) => set({ activeFilter: tab }),
}));
```

---

## Utility Functions

```typescript
// src/utils/formatters.ts

/**
 * Format monetary amount with Ukrainian Hryvnia symbol.
 * MUST match Figma format: ₴12,400 (comma thousands separator, no decimal)
 * Traces to: Scenario §12.1 Price/Number Formats
 */
export function formatMoney(amount: number, currency = '₴'): string {
  return `${currency}${Math.floor(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Format per-unit price: ₴400/шт
 * Traces to: Scenario §12.1 Price/Number Formats
 */
export function formatPerUnitPrice(amount: number, unit: string, currency = '₴'): string {
  return `${currency}${Math.floor(amount)}/${unit}`;
}

/**
 * Format deadline date to Ukrainian short format: "До 25 березня"
 * Returns date text + isOverdue flag + isTomorrow flag.
 * Traces to: Scenario §9 BR-W1-04 — "tomorrow" triggers yellow highlight
 */
export function formatDeadline(isoDate: string): {
  label: string;
  isOverdue: boolean;
  isTomorrow: boolean;
} {
  const deadline = new Date(isoDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const diffDays = Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const months = [
    'січня','лютого','березня','квітня','травня','червня',
    'липня','серпня','вересня','жовтня','листопада','грудня',
  ];

  const label = `До ${deadline.getDate()} ${months[deadline.getMonth()]}`;

  return {
    label,
    isOverdue: diffDays < 0,
    isTomorrow: diffDays === 1,  // Q1 answer: tomorrow triggers yellow
  };
}
```

---

## Design Tokens — Tailwind Config Extension

```typescript
// tailwind.config.ts extension (add to existing config)
// All values from Scenario §12.1 Color Table
theme: {
  extend: {
    colors: {
      // Screen backgrounds
      'bg-screen':   '#222226',   // dark/color/bg/primary
      'bg-card':     '#2d2d31',   // dark/color/bg/card
      'bg-input':    '#3e3e42',   // dark/color/bg/input
      'bg-button':   '#fafafa',   // light/color/bg/primary

      // Text
      'text-primary':   '#ededed',  // dark/color/content/primary
      'text-secondary': '#9d9d9d',  // dark/color/content/secondary
      'text-muted':     '#878787',  // filter tab labels
      'text-dark':      '#222226',  // button text on light bg

      // Status colors — for badges AND card border-left
      'status-info':    '#60a5fa',  // New, Checking
      'status-warning': '#fbbf24',  // In Progress — also "tomorrow" deadline
      'status-error':   '#f87171',  // Overdue — also overdue deadline text
      'status-success': '#34d399',  // Done
      'status-pending': '#fdba74',  // Dispute

      // Accent
      'accent-primary': '#ffffff',  // "+ Додати" border + text
    },
    borderRadius: {
      'card':   '20px',    // Task card
      'chip':   '16px',    // Notes chip
      'badge':  '9999px',  // Status badge, filter tabs, avatar
      'btn':    '32px',    // CTA buttons
    },
    fontSize: {
      'screen-title': ['18px', { lineHeight: '28px', fontWeight: '600', letterSpacing: '-0.5px' }],
      'card-title':   ['16px', { lineHeight: '20px', fontWeight: '700' }],
      'meta':         ['12px', { lineHeight: '20px', fontWeight: '400' }],
      'meta-medium':  ['12px', { lineHeight: '15px', fontWeight: '500' }],
      'notes':        ['11px', { lineHeight: '20px', fontWeight: '400' }],
      'deadline':     ['12px', { lineHeight: '16px', fontWeight: '400' }],
      'amount':       ['14px', { lineHeight: '20px', fontWeight: '700' }],
      'tab':          ['14px', { lineHeight: '20px', fontWeight: '500' }],
      'btn-label':    ['14px', { lineHeight: '24px', fontWeight: '600' }],
    },
    boxShadow: {
      'card':     '0px 4px 24px 0px rgba(0,0,0,0.4)',
      'card-inner': 'inset 0px 1px 0px 0px rgba(255,255,255,0.05)',
      'btn-light': '0px 5px 20px 0px rgba(255,255,255,0.2)',
      'btn-ghost': '0px 5px 15px -3px rgba(255,255,255,0.2), 0px 4px 6px -4px rgba(255,255,255,0.2)',
    },
  },
},
```

---

## Status Configuration (authoritative mapping)

```typescript
// src/components/screens/MyTasks/TaskCard.tsx (or constants file)
// Traces to: Scenario §7 Status badge + §12.1 Color Table

import type { TaskStatus } from '@/types/task.types';

export const STATUS_BORDER_COLOR: Record<TaskStatus, string> = {
  new:        '#60a5fa',  // --status-info
  in_progress:'#fbbf24',  // --status-warning
  overdue:    '#f87171',  // --status-error
  checking:   '#60a5fa',  // --status-info
  dispute:    '#fdba74',  // --status-pending
  done:       '#34d399',  // --status-success (if shown)
};

export const STATUS_BADGE_BG: Record<TaskStatus, string> = {
  new:         'rgba(96,165,250,0.1)',
  in_progress: 'rgba(245,158,11,0.1)',
  overdue:     'rgba(248,113,113,0.1)',
  checking:    'rgba(96,165,250,0.1)',
  dispute:     'rgba(253,186,116,0.1)',
  done:        'rgba(16,185,129,0.1)',
};

export const STATUS_BADGE_TEXT: Record<TaskStatus, string> = {
  new:         'Новий',
  in_progress: 'В процесі',
  overdue:     'Прострочено',
  checking:    'Перевіряється',
  dispute:     'Диспут',
  done:        '✓ Готово',
};

export const STATUS_BADGE_TEXT_COLOR: Record<TaskStatus, string> = {
  new:         '#60a5fa',
  in_progress: '#fbbf24',
  overdue:     '#f87171',
  checking:    '#60a5fa',
  dispute:     '#fdba74',
  done:        '#34d399',
};
```

---

## External Dependencies

| Package | Version | Purpose | Usage |
|---------|---------|---------|-------|
| `@iconify/react` | latest | All Figma icons via `data-name` | `<Icon icon="solar:route-bold" width={24} />` |
| `@tanstack/react-query` | v5 | Data fetching + cache + states | `useQuery({ queryKey: ['tasks'], queryFn })` |
| `zustand` | v5 | Filter tab state — persists across nav | `useTaskFilterStore()` |
| `@twa-dev/sdk` | latest | `Telegram.WebApp` API | `WebApp.openLink()`, `WebApp.ready()` |

---

## Step-by-Step Implementation

### Step 1 — Project Setup (if greenfield)
1. `npm create vite@latest . -- --template react-ts`
2. Install dependencies:
   ```bash
   npm install @iconify/react @tanstack/react-query zustand @twa-dev/sdk
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
3. Configure `tailwind.config.ts` with token extensions from the Design Tokens section above.
4. Add to `src/index.css`: `@tailwind base; @tailwind components; @tailwind utilities;`
5. Set `bg-bg-screen` as the root `body` background.

### Step 2 — Types & Interfaces
1. Create `src/types/task.types.ts` with TypeScript interfaces defined above.
2. Ensure `TaskStatus` union covers all 6 statuses from Figma.

### Step 3 — Mock Data
1. Create `src/mocks/MockData.ts` with all 6 `MOCK_TASKS` entries.
2. Cover all card variants: `new` (start button), `in_progress` (two-button), `overdue`, `checking`, `dispute`, `per_unit`.
3. Include at least one task with `isTomorrow: true` deadline for deadline highlight testing.

### Step 4 — Service Layer
1. Create `src/services/tasksService.ts` with `fetchWorkerTasks()` returning `MOCK_TASKS` after 600ms delay.
2. The function signature must match the shape a real `fetch()` call would return — same return type `Promise<Task[]>`.

### Step 5 — Utility Functions
1. Create `src/utils/formatters.ts`:
   - `formatMoney(n)` → `₴12,400` (comma thousands separator)
   - `formatPerUnitPrice(n, unit)` → `₴400/шт`
   - `formatDeadline(iso)` → `{ label: "До 25 березня", isOverdue: boolean, isTomorrow: boolean }`
2. **Validate `formatMoney`**: `formatMoney(12400)` must return `"₴12,400"` (not `"₴12 400"` or `"₴12.400"`).

### Step 6 — Zustand Filter Store
1. Create `src/stores/useTaskFilterStore.ts` per the code above.
2. Default: `activeFilter = 'all'`.

### Step 7 — React Query Provider
1. In `src/main.tsx`, wrap `<App>` with `<QueryClientProvider client={queryClient}>`.
2. `queryClient` config: `defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 2 } }`.

### Step 8 — TMA Init
1. In `src/main.tsx` or `src/App.tsx` (before render):
   ```typescript
   import WebApp from '@twa-dev/sdk';
   WebApp.ready();
   WebApp.expand();
   ```
2. Apply safe-area-inset-top to root container:
   ```css
   .tma-root { padding-top: env(safe-area-inset-top, 0px); }
   ```

### Step 9 — FilterTabs Component
1. Create `src/components/screens/MyTasks/FilterTabs.tsx`.
2. Props: `tasks: Task[]` (for computing tab counts). Uses `useTaskFilterStore`.
3. Compute counts:
   ```typescript
   const counts = {
     all:        tasks.length,
     new:        tasks.filter(t => t.status === 'new').length,
     in_progress:tasks.filter(t => ['in_progress','overdue','checking','dispute'].includes(t.status)).length,
     done:       tasks.filter(t => t.status === 'done').length,
   };
   ```
4. Render pill tabs:
   - Active: `bg-white text-[#222226]`
   - Inactive: `border border-[#878787] text-[#878787]`
   - Padding: `px-4 py-1.5`, border-radius `rounded-full`, font `text-tab font-medium`
5. Horizontal scroll container (`overflow-x-auto`) with `pl-4` padding, height `34px`.

### Step 10 — TaskCard Component
1. Create `src/components/screens/MyTasks/TaskCard.tsx`.

**Card shell:**
```tsx
<div
  className="relative rounded-card overflow-hidden shadow-card"
  style={{ borderLeft: `1px solid ${STATUS_BORDER_COLOR[task.status]}` }}
>
  {/* Background layer */}
  <div className="absolute inset-0 bg-bg-card rounded-card" />
  {/* Inner glow */}
  <div className="absolute inset-0 rounded-[inherit] shadow-card-inner pointer-events-none" />
  {/* Content */}
  <div className="relative pl-[17px] pr-4 py-4 flex flex-col gap-3"> {/* pl=17 for border clearance */}
    {/* Row 1: Title + Badge */}
    {/* Row 2: Company/Address + Route icon */}
    {/* Row 3: Notes chip (if notes exist) */}
    {/* Row 4: Deadline + Assignees + Amount */}
    {/* Row 5: CTA buttons */}
  </div>
</div>
```

**Critical implementation rules:**
- `border-left` only — NOT `border` (all sides). Use `style={{ borderLeft }}` not `className="border"`.
- `pl-[17px]` left padding (1px extra for visual clearance from border).
- Use `<Icon icon="mdi:company" width={16} className="text-text-secondary" />` via `@iconify/react`.
- Route icon taps → `WebApp.openLink(`https://maps.google.com/?q=${encodeURIComponent(task.address)}`)`.

**Status badge:**
```tsx
<span
  className="rounded-full px-[10px] py-[2px] text-[12px] font-medium whitespace-nowrap"
  style={{
    background: STATUS_BADGE_BG[task.status],
    color: STATUS_BADGE_TEXT_COLOR[task.status],
  }}
>
  {task.status === 'new' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1" />}
  {STATUS_BADGE_TEXT[task.status]}
</span>
```

**Deadline row:**
```tsx
const { label, isOverdue, isTomorrow } = formatDeadline(task.deadline);
<span className={
  isOverdue   ? 'text-status-error' :
  isTomorrow  ? 'text-status-warning' :  // Q1 answer: tomorrow = yellow
  'text-text-primary'
}>
  {label}
</span>
```

**Amount display:**
```tsx
{task.paymentModel === 'per_unit' ? (
  <>
    <Icon icon="solar:layers-linear" width={16} className="text-text-secondary" />
    <span className="text-text-secondary text-[14px]">{task.quantity} од.</span>
    <span className="font-['JetBrains_Mono'] font-bold text-[14px] text-text-primary">
      {formatPerUnitPrice(task.amountPerUnit!, task.unitLabel!)}
    </span>
  </>
) : (
  <span className="font-['JetBrains_Mono'] font-bold text-[14px] text-text-primary">
    {formatMoney(task.amount)}
  </span>
)}
```

**CTA buttons:**
```tsx
{task.hasStartButton && (
  <button className="w-full h-8 bg-bg-button rounded-btn shadow-btn-light font-semibold text-text-dark text-[12px]">
    ▶ Почати роботу
  </button>
)}
{task.hasActionButtons && (
  <div className="flex gap-4">
    <button className="flex-1 h-8 border border-accent-primary rounded-btn shadow-btn-ghost text-accent-primary font-semibold text-[12px]">
      + Додати
    </button>
    <button className="flex-1 h-8 bg-bg-button rounded-btn shadow-btn-light text-text-dark font-semibold text-[14px]">
      ✓ Завершити
    </button>
  </div>
)}
```

### Step 11 — TaskCardSkeleton Component
1. Create `src/components/screens/MyTasks/TaskCardSkeleton.tsx`.
2. Three skeleton cards shown during loading (matches Figma loading frames).
3. Use animated pulse: `animate-pulse bg-bg-card rounded-card`.
4. Replicate inner structure with `rounded-md bg-[#3e3e42]` placeholder divs:
   - Title bar: `h-4 w-2/3`
   - Subtitle: `h-3 w-1/2`
   - CTA bar: `h-8 w-full`
5. `TaskCardSkeleton` height: `122px` (matches Figma loading skeleton dimensions).

### Step 12 — EmptyState Component
1. Create `src/components/screens/MyTasks/EmptyState.tsx`.
2. Layout: `flex flex-col items-center justify-center flex-1`.
3. Icon: 64×64px illustration placeholder (`w-16 h-16 rounded-full bg-bg-input flex items-center justify-center`).
4. Title: `text-screen-title font-medium text-text-primary text-center`.
5. Subtitle: `text-[13px] text-text-secondary text-center max-w-[242px]`.
6. Button: `w-[108px] h-10 bg-bg-input rounded-full text-text-primary` → calls `refetch()` from React Query.

### Step 13 — ErrorState Component
1. Create `src/components/screens/MyTasks/ErrorState.tsx`.
2. Similar to EmptyState but with error icon and "Спробувати знову" button (175×40px).
3. Button calls `refetch()`.

### Step 14 — MyTasksScreen Root
1. Create `src/components/screens/MyTasks/MyTasksScreen.tsx`.

```tsx
export function MyTasksScreen() {
  const { activeFilter } = useTaskFilterStore();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchWorkerTasks,
    staleTime: 5 * 60 * 1000,
  });

  const filteredTasks = useMemo(() => {
    if (!data) return [];
    switch (activeFilter) {
      case 'new':        return data.filter(t => t.status === 'new');
      case 'in_progress':return data.filter(t => ['in_progress','overdue','checking','dispute'].includes(t.status));
      case 'done':       return data.filter(t => t.status === 'done');
      default:           return data;
    }
  }, [data, activeFilter]);

  return (
    <div className="flex flex-col h-full bg-bg-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Header — always visible */}
      <MyTasksHeader />

      {/* Loading: show skeleton */}
      {isLoading && (
        <div className="flex flex-col gap-3 p-4 overflow-auto flex-1">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      )}

      {/* Error state */}
      {isError && <ErrorState onRetry={refetch} />}

      {/* Populated or empty */}
      {!isLoading && !isError && data && (
        <>
          {/* Filter tabs — only after data loads. Q6 answer */}
          <FilterTabs tasks={data} />

          {filteredTasks.length === 0 ? (
            <EmptyState onRefresh={refetch} />
          ) : (
            <div className="flex flex-col gap-3 p-4 overflow-auto flex-1">
              {filteredTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Bottom navigation — always visible */}
      <BottomNav activeTab="tasks" />
    </div>
  );
}
```

### Step 15 — Verification Gate

After implementation, verify all of the following before marking as done:

| Gate | Check | Command / Visual |
|------|-------|-----------------|
| **Figma Icon Extraction Check** | All 5 icons use `@iconify/react` with exact `data-name` values from Scenario §7 | Search codebase for `<svg` — must find 0 hand-drawn SVGs |
| **Color Token Check** | No raw hex values outside `tailwind.config.ts` (except `STATUS_BORDER_COLOR` record) | `grep -r "#[0-9a-fA-F]" src/components` → only in constants file |
| **Spacing Fidelity Check** | Card `pl-[17px]` (not `pl-4`), header `p-4` (16px), feed `gap-3` (12px) | Dev tools ruler: measure against Figma |
| **Border Left-Only Check** | Cards use `style={{ borderLeft }}` — not `className="border"` | Code review |
| **Price Format Check** | `formatMoney(12400)` === `"₴12,400"` | Unit test or console log |
| **Deadline Color Check** | Overdue → `#f87171`, Tomorrow → `#fbbf24`, Normal → `#ededed` | Render test card with each deadline |
| **Filter Tabs After Data Check** | Filter tabs NOT visible during skeleton loading state | Toggle loading simulation |
| **Safe-Area Check** | Header has `env(safe-area-inset-top)` padding | Test on iOS device or simulator |
| **Route Icon Check** | Tap `solar:route-bold` calls `WebApp.openLink('https://maps.google.com/?q=...')` | Console log or mock test |
| **Empty State Button** | `[Оновити]` triggers `refetch()` — NO pull-to-refresh | Confirm no swipe-down handler |
| **Font Family Amount** | Amount text uses `font-['JetBrains_Mono']` — not Inter | Inspect rendered element font |

---

## Verification Gate Result

> ✅ Tech Stack document passes workflow validation gate:
> - [x] Contains `## File Structure`
> - [x] Contains `## Step-by-Step Implementation`
> - [x] Contains `## TypeScript Interfaces`
> - [x] Contains `Traces to:` references
> - [x] Contains `MockData.ts`
