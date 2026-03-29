# TECH STACK — SCREEN_Order_Hub (W2)

**Traces to:** `scenario/SCREEN_Order_Hub.md` §12.1 | `adr/ADR_SCREEN_Order_Hub.md`
**BRD:** `ba/04_BRD_Larko_MVP.md` §2 Worker — Order Hub
**Figma:** https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=298-26477&m=dev

---

## Framework & Runtime

| Item | Value |
|------|-------|
| Framework | **React** (Vite + TypeScript) |
| Language | TypeScript (strict mode) |
| TMA SDK | `@twa-dev/sdk` — `Telegram.WebApp.BackButton`, `WebApp.ready()` |
| Styling | **Tailwind CSS v3** with custom tokens (from existing `tailwind.config.js`) |
| Icons | `@iconify/react` — all icons via Figma `data-name` attribute |
| Data fetching | `@tanstack/react-query` v5 |
| UI state | `useState` / `useReducer` (local component state — no Zustand needed for this screen) |

---

## File Structure

```
src/
├── types/
│   └── order.types.ts                        # TypeScript interfaces for Order Hub domain
├── mocks/
│   └── MockData.ts                           # [EXTEND] Add mock order detail + mock photos + time logs
├── services/
│   └── orderService.ts                       # Data access: fetchOrderById, submitTimeLog, uploadPhoto, etc.
├── utils/
│   └── formatters.ts                         # [REUSE] formatMoney(), formatDeadline() — already exists
├── components/
│   └── screens/
│       └── OrderHub/
│           ├── OrderHubScreen.tsx            # Root screen, routes by status
│           ├── OrderInfoCard.tsx             # Block 1: title, status badge, deadline, amount
│           ├── DescriptionPanel.tsx          # Block 2: notes, expand/collapse
│           ├── TimeTrackingCard.tsx          # Block 3: obliq hours, add/history buttons
│           ├── PhotoGalleryCard.tsx          # Block 4: photo thumbnails + add slot
│           ├── MapWidget.tsx                 # Block 5: static map + location chip
│           ├── StatusBanner.tsx              # Contextual banner (overdue/checking/locked/dispute)
│           ├── DisputeResponseForm.tsx       # Block 6b: dispute text area + Оскаржити/Погодитись
│           ├── OrderHubSkeleton.tsx          # Loading skeleton
│           └── OrderHubError.tsx             # Error state
```

---

## TypeScript Interfaces

```typescript
// src/types/order.types.ts

import type { TaskStatus } from './task.types'; // reuse existing status type

export interface TimeLog {
  id: string;
  date: string;           // ISO date "2026-03-24"
  netHours: number;       // e.g. 5.0
  workStart: string;      // "08:00"
  workEnd: string;        // "17:00"
  breaks: Array<{ start: string; end: string }>;
  isOvertime: boolean;
  overtimeHours?: number;
  unitsCompleted?: number; // Per-Unit model only
  isReadOnly: boolean;    // true once submitted
}

export interface OrderPhoto {
  id: string;
  url: string;            // Full-size URL
  thumbnailUrl: string;   // 80x80 thumbnail URL
  uploadedAt: string;     // ISO date
  workerName: string;
}

export interface OrderDispute {
  id: string;
  managerName: string;    // e.g. "Іван С."
  description: string;    // Manager's claim text
  createdAt: string;      // "2026-03-24T09:15:00Z"
  status: 'pending' | 'worker_responded' | 'resolved';
}

export interface OrderDetail {
  id: string;
  number: string;          // "000445"
  name: string;            // "Встановлення сонячної станція №4"
  status: TaskStatus;
  deadline: string;        // ISO date
  amount: number;          // 12400
  notes: string;           // Full instruction text
  location: {
    address: string;       // "Київ, вул. Будівельна 12"
    lat?: number;
    lng?: number;
  };
  timeLogs: TimeLog[];
  totalHours: number;      // Sum of all net hours
  photos: OrderPhoto[];
  photosAddedToday: number;  // count for 3-photo limit gate
  dispute?: OrderDispute;
  canAddTime: boolean;     // false when status is checking/dispute/done
  canAddPhotos: boolean;   // false when status is done
  canReportIssue: boolean; // false when status is done
  ctaAction: 'start' | 'complete' | null; // null = no CTA
}

export interface DisputeResponsePayload {
  action: 'accept' | 'contest';
  explanation?: string;    // required if action === 'contest'
}
```

---

## MockData.ts (extension — add to existing file)

```typescript
// ADD to src/mocks/MockData.ts
import type { OrderDetail } from '@/types/order.types';

export const MOCK_ORDER_NEW: OrderDetail = {
  id: 'order-1',
  number: '000445',
  name: 'Встановлення сонячної станція №4',
  status: 'new',
  deadline: '2026-03-20',
  amount: 12400,
  notes: 'Потрібно встановити станцію.\nЗнайдеш охоронця при вході взяти ключі. Вхід з центральних воріт.\nКлючі в охоронця при вході. вхід з центральних воріт.',
  location: {
    address: 'Київ, вул. Будівельна 12',
    lat: 50.4501,
    lng: 30.5234,
  },
  timeLogs: [],
  totalHours: 0,
  photos: [],
  photosAddedToday: 0,
  dispute: undefined,
  canAddTime: true,
  canAddPhotos: true,
  canReportIssue: true,
  ctaAction: 'start',
};

export const MOCK_ORDER_IN_PROGRESS: OrderDetail = {
  ...MOCK_ORDER_NEW,
  id: 'order-2',
  status: 'in_progress',
  totalHours: 5.0,
  timeLogs: [
    {
      id: 'tl-1',
      date: '2026-03-24',
      netHours: 5.0,
      workStart: '08:00',
      workEnd: '13:30',
      breaks: [{ start: '10:00', end: '10:30' }],
      isOvertime: false,
      isReadOnly: true,
    },
  ],
  photos: [
    { id: 'p1', url: 'https://picsum.photos/seed/solar1/400/400', thumbnailUrl: 'https://picsum.photos/seed/solar1/80/80', uploadedAt: '2026-03-24', workerName: 'Worker' },
    { id: 'p2', url: 'https://picsum.photos/seed/solar2/400/400', thumbnailUrl: 'https://picsum.photos/seed/solar2/80/80', uploadedAt: '2026-03-24', workerName: 'Worker' },
  ],
  photosAddedToday: 2,
  canAddTime: true,
  canAddPhotos: true,
  canReportIssue: true,
  ctaAction: 'complete',
};

export const MOCK_ORDER_OVERDUE: OrderDetail = {
  ...MOCK_ORDER_IN_PROGRESS,
  id: 'order-3',
  status: 'overdue',
  ctaAction: 'complete',
};

export const MOCK_ORDER_CHECKING: OrderDetail = {
  ...MOCK_ORDER_IN_PROGRESS,
  id: 'order-4',
  status: 'checking',
  canAddTime: false,
  canReportIssue: false,
  ctaAction: null,
};

export const MOCK_ORDER_DONE: OrderDetail = {
  ...MOCK_ORDER_IN_PROGRESS,
  id: 'order-5',
  status: 'done',
  canAddTime: false,
  canAddPhotos: false,
  canReportIssue: false,
  ctaAction: null,
};

export const MOCK_ORDER_DISPUTE: OrderDetail = {
  ...MOCK_ORDER_IN_PROGRESS,
  id: 'order-6',
  status: 'dispute',
  totalHours: 5.0,
  dispute: {
    id: 'dispute-1',
    managerName: 'Іван С.',
    description: 'Іван С. вважає, що фактичний час роботи менший від вказаного. Перерва повинна бути 60 хв замість 30 хв.',
    createdAt: '2026-03-24T09:15:00Z',
    status: 'pending',
  },
  canAddTime: false,
  canReportIssue: true,
  ctaAction: null,
};
```

---

## orderService.ts

```typescript
// src/services/orderService.ts
import type { OrderDetail, DisputeResponsePayload } from '@/types/order.types';
import {
  MOCK_ORDER_NEW,
  MOCK_ORDER_IN_PROGRESS,
  MOCK_ORDER_OVERDUE,
  MOCK_ORDER_CHECKING,
  MOCK_ORDER_DONE,
  MOCK_ORDER_DISPUTE,
} from '@/mocks/MockData';

const SIMULATED_DELAY_MS = 600;
const delay = () => new Promise(r => setTimeout(r, SIMULATED_DELAY_MS));

// Map of mock orders by ID for demo navigation
const MOCK_ORDER_MAP: Record<string, OrderDetail> = {
  'order-1': MOCK_ORDER_NEW,
  'order-2': MOCK_ORDER_IN_PROGRESS,
  'order-3': MOCK_ORDER_OVERDUE,
  'order-4': MOCK_ORDER_CHECKING,
  'order-5': MOCK_ORDER_DONE,
  'order-6': MOCK_ORDER_DISPUTE,
};

/**
 * Fetches full order details for the Order Hub.
 * TODO: Replace with: fetch(`/api/v1/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } })
 */
export async function fetchOrderById(id: string): Promise<OrderDetail> {
  await delay();
  const order = MOCK_ORDER_MAP[id] ?? MOCK_ORDER_IN_PROGRESS; // fallback for demo
  return order;
}

/**
 * Updates order status (start → in_progress, complete → worker_done).
 * TODO: Replace with: PATCH /api/v1/orders/{id}/status
 */
export async function updateOrderStatus(
  id: string,
  action: 'start' | 'complete'
): Promise<{ status: string }> {
  await delay();
  return { status: action === 'start' ? 'in_progress' : 'checking' };
}

/**
 * Uploads a photo to the order.
 * TODO: Replace with: POST /api/v1/orders/{id}/photos (multipart/form-data)
 */
export async function uploadOrderPhoto(
  _orderId: string,
  file: File
): Promise<{ id: string; url: string; thumbnailUrl: string }> {
  await delay();
  const url = URL.createObjectURL(file);
  return { id: `p-${Date.now()}`, url, thumbnailUrl: url };
}

/**
 * Deletes a photo from the order.
 * TODO: Replace with: DELETE /api/v1/orders/{id}/photos/{photoId}
 */
export async function deleteOrderPhoto(
  _orderId: string,
  _photoId: string
): Promise<void> {
  await delay();
}

/**
 * Submits a dispute response (accept or contest).
 * TODO: Replace with: POST /api/v1/orders/{id}/dispute/response
 */
export async function submitDisputeResponse(
  _orderId: string,
  payload: DisputeResponsePayload
): Promise<void> {
  await delay();
  console.log('[Mock] Dispute response submitted:', payload);
}
```

---

## Utility Functions (reuse/extend existing)

```typescript
// src/utils/formatters.ts — ADD these to existing file

/**
 * Format hours display: 5.0 → "5.0 год"
 * Traces to: Scenario §12.1 Price/Number Formats
 */
export function formatHours(hours: number): string {
  return `${hours.toFixed(1)} год`;
}

/**
 * Format dispute timestamp: "2026-03-24T09:15:00Z" → "24 бер, 09:15"
 */
export function formatDisputeDate(isoString: string): string {
  const date = new Date(isoString);
  const months = ['січ','лют','бер','квіт','трав','чер','лип','серп','вер','жовт','лист','груд'];
  return `${date.getDate()} ${months[date.getMonth()]}, ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
}

// REUSE existing: formatMoney(), formatDeadline() from formatters.ts
```

---

## Design Tokens — Tailwind Config Extension

```javascript
// tailwind.config.js — ADD to existing extend.colors (if not already present):
// All values from Scenario §12.1 Color Table

// Already present from W1 (verify these keys exist):
// 'bg-screen': '#222226', 'bg-card': '#2d2d31', 'bg-input': '#3e3e42'
// 'text-primary': '#ededed', 'text-secondary': '#9d9d9d', 'text-muted': '#878787'
// 'status-info': '#60a5fa', 'status-warning': '#fbbf24', 'status-error': '#f87171'
// 'status-success': '#34d399', 'status-pending': '#fdba74'

// NEW tokens for Order Hub (add if missing):
colors: {
  'bg-dispute': 'rgba(253,186,116,0.1)',   // Dispute banner bg
  'bg-map-chip': 'rgba(31,31,34,0.8)',     // Map location chip
  'border-subtle': 'rgba(255,255,255,0.08)', // All-side card borders
  'btn-error': '#f87171',                   // Оскаржити button
  'btn-success': '#34d399',                 // Погодитись button
},

// NEW border radius tokens:
borderRadius: {
  // Already exist from W1: 'card': '20px', 'badge': '9999px', 'btn': '32px'
  'chip-sm': '12px',  // Map location chip
  'card-sm': '16px',  // Description panel, text area
},
```

---

## Status Configuration (reuse existing + extend)

```typescript
// src/components/screens/OrderHub/OrderInfoCard.tsx
// (or import from existing constants file if STATUS_BORDER_COLOR already exists from W1)

// These MUST already exist from W1 implementation:
// STATUS_BORDER_COLOR, STATUS_BADGE_BG, STATUS_BADGE_TEXT, STATUS_BADGE_TEXT_COLOR
// Import them from wherever they live in the W1 implementation.

// If they are in TaskCard.tsx, extract to src/constants/statusConfig.ts for reuse:
export { STATUS_BORDER_COLOR, STATUS_BADGE_BG, STATUS_BADGE_TEXT, STATUS_BADGE_TEXT_COLOR }
  from '../MyTasks/TaskCard'; // adjust import path
```

---

## External Dependencies

| Package | Version | Purpose | Usage |
|---------|---------|---------|-------|
| `@iconify/react` | already installed | All Figma icons via `data-name` | `<Icon icon="majesticons:note-text" width={20} />` |
| `@tanstack/react-query` | already installed | Order data fetching + cache | `useQuery({ queryKey: ['order', id], queryFn })` |
| `@twa-dev/sdk` | already installed | Back button, WebApp.ready | `WebApp.BackButton.show()` |
| _(no new packages required)_ | | | |

---

## Step-by-Step Implementation

### Step 1 — Types & Interfaces
1. Create `src/types/order.types.ts` with all interfaces above.
2. Check that `TaskStatus` in `task.types.ts` already includes: `'new' | 'in_progress' | 'overdue' | 'checking' | 'dispute' | 'done'`.
3. If not, extend it with missing values.

### Step 2 — Mock Data
1. Add all 6 `MOCK_ORDER_*` entries to `src/mocks/MockData.ts` (or create `src/mocks/OrderMockData.ts`).
2. Cover all 6 status states: New, InProgress, Overdue, Checking, Done, Dispute.
3. Dispute mock must include `dispute.description`, `dispute.managerName`, `dispute.createdAt`.

### Step 3 — Service Layer
1. Create `src/services/orderService.ts` with the 5 functions above.
2. Each function has a `// TODO: Replace with:` comment showing the real API call.
3. `fetchOrderById('order-1')` returns `MOCK_ORDER_NEW` synchronously after 600ms.

### Step 4 — Utility Functions
1. Add `formatHours()` and `formatDisputeDate()` to existing `src/utils/formatters.ts`.
2. Verify existing `formatMoney(12400)` returns `"₴12,400"` (smoke test in console).

### Step 5 — Tailwind Token Audit
1. Open `tailwind.config.js` and verify all tokens listed in "Design Tokens" section above exist.
2. Add any missing tokens (especially `bg-dispute`, `bg-map-chip`, `border-subtle`).

### Step 6 — OrderHubSkeleton Component
1. Create `src/components/screens/OrderHub/OrderHubSkeleton.tsx`.
2. Render pulse skeletons for: header, order info card (h-28), description card (h-36), time card (h-24), photo card (h-24).
3. Use `animate-pulse` + `bg-bg-card rounded-card`.

### Step 7 — StatusBanner Component

```tsx
// src/components/screens/OrderHub/StatusBanner.tsx
// Traces to: Scenario §5 Alternative Flows, §7 UI Elements

import { Icon } from '@iconify/react';
import type { TaskStatus } from '@/types/task.types';
import type { OrderDispute } from '@/types/order.types';

type BannerVariant = 'overdue' | 'checking' | 'locked' | 'dispute';

interface StatusBannerProps {
  variant: BannerVariant;
  daysOverdue?: number;  // for 'overdue' variant
}

const BANNER_CONFIG: Record<BannerVariant, {
  icon: string;
  iconColor: string;
  bg: string;
  border: string;
  label: string;
}> = {
  overdue: {
    icon: 'solar:danger-triangle-bold',
    iconColor: '#f87171',
    bg: 'rgba(248,113,113,0.1)',
    border: '#f87171',
    label: 'Прострочено на {days} дні',  // interpolated by parent
  },
  checking: {
    icon: 'solar:info-circle-bold',
    iconColor: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    border: '#60a5fa',
    label: 'Менеджер повинен підтвердити виконання замовлення',
  },
  locked: {
    icon: 'solar:lock-bold',
    iconColor: '#34d399',
    bg: 'rgba(52,211,153,0.1)',
    border: '#34d399',
    label: 'Замовлення завершено. Дані доступні лише для перегляду.',
  },
  dispute: {
    // Dispute banner is more complex — handled by DisputeBanner sub-component
    icon: 'solar:danger-triangle-bold',
    iconColor: '#fdba74',
    bg: 'rgba(253,186,116,0.1)',
    border: '#fdba74',
    label: 'Менеджер оскаржив замовлення',
  },
};

export function StatusBanner({ variant, daysOverdue }: StatusBannerProps) {
  const config = BANNER_CONFIG[variant];
  const label = variant === 'overdue' && daysOverdue
    ? `Прострочено на ${daysOverdue} дні`
    : config.label;

  return (
    <div
      className="mx-4 rounded-[32px] px-4 py-3 flex items-center gap-3"
      style={{ background: config.bg, border: `1px solid ${config.border}` }}
    >
      <Icon icon={config.icon} width={18} color={config.iconColor} />
      <p className="text-text-primary text-[15px] font-normal leading-[18px]">{label}</p>
    </div>
  );
}
```

### Step 8 — OrderInfoCard Component

```tsx
// src/components/screens/OrderHub/OrderInfoCard.tsx
// Traces to: Scenario §4 Step 3 Block 1, §7 UI Elements, §12.1 Card Border Style

import { Icon } from '@iconify/react';
import { formatMoney, formatDeadline } from '@/utils/formatters';
import type { OrderDetail } from '@/types/order.types';
import { STATUS_BORDER_COLOR, STATUS_BADGE_BG, STATUS_BADGE_TEXT, STATUS_BADGE_TEXT_COLOR } from '@/constants/statusConfig';

interface OrderInfoCardProps {
  order: Pick<OrderDetail, 'name' | 'status' | 'deadline' | 'amount'>;
}

export function OrderInfoCard({ order }: OrderInfoCardProps) {
  const { label: deadlineLabel, isOverdue } = formatDeadline(order.deadline);

  return (
    // CRITICAL: border-left ONLY. NOT all 4 sides.
    // border-l = left border only in Tailwind
    <div
      className="mx-4 bg-bg-card rounded-card flex flex-col gap-3 pl-[17px] pr-4 py-4"
      style={{ borderLeft: `1px solid ${STATUS_BORDER_COLOR[order.status]}` }}
    >
      {/* Row 1: Name + Status badge */}
      <div className="flex items-start justify-between gap-2">
        {/* Order name — Inter SemiBold 17px — Traces to §12.1 Typography Table */}
        <h4 className="text-text-primary font-semibold text-[17px] leading-[20.4px] tracking-[-0.43px] flex-1">
          {order.name}
        </h4>
        {/* Status badge — pill, left border dot for New/Checking */}
        <span
          className="rounded-full px-[10px] py-[2px] text-[12px] font-medium whitespace-nowrap shrink-0 flex items-center gap-1"
          style={{
            background: STATUS_BADGE_BG[order.status],
            color: STATUS_BADGE_TEXT_COLOR[order.status],
          }}
        >
          {/* Dot indicator for non-checkmark statuses */}
          {order.status !== 'done' && (
            <span className="w-[6px] h-[6px] rounded-full bg-current shrink-0" />
          )}
          {STATUS_BADGE_TEXT[order.status]}
        </span>
      </div>

      {/* Row 2: Deadline + Amount */}
      <div className="flex items-center justify-between">
        {/* Deadline — calendar icon + date text */}
        <div className="flex items-center gap-2">
          {/* Calendar icon is a custom SVG in Figma; use solar:calendar-date-bold as closest @iconify match */}
          <Icon
            icon="solar:calendar-date-bold"
            width={16}
            className={isOverdue ? 'text-status-error' : 'text-text-primary'}
          />
          <span
            className={`text-[13px] font-medium leading-[15.6px] tracking-[-0.08px] ${isOverdue ? 'text-status-error' : 'text-text-primary'}`}
          >
            до {deadlineLabel.replace('До ', '')}
          </span>
        </div>
        {/* Amount — Space Grotesk Medium 24px */}
        {/* CRITICAL: font-['Space_Grotesk',sans-serif] not Inter */}
        <span className="font-['Space_Grotesk','Noto_Sans',sans-serif] font-medium text-[24px] leading-[28.8px] text-text-primary">
          {formatMoney(order.amount)}
        </span>
      </div>
    </div>
  );
}
```

### Step 9 — DescriptionPanel Component

```tsx
// src/components/screens/OrderHub/DescriptionPanel.tsx
// Traces to: Scenario §4 Step 3 Block 2, §7 UI Elements

import { useState } from 'react';
import { Icon } from '@iconify/react';

interface DescriptionPanelProps {
  notes: string;
}

export function DescriptionPanel({ notes }: DescriptionPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const MAX_COLLAPSED_CHARS = 150;
  const isLong = notes.length > MAX_COLLAPSED_CHARS;
  const displayText = expanded || !isLong ? notes : notes.slice(0, MAX_COLLAPSED_CHARS) + '...';

  return (
    // bg-bg-input = #3e3e42, rounded-card-sm = 16px
    <div className="mx-4 bg-bg-input rounded-[16px] p-4 flex flex-col gap-2 overflow-hidden">
      {/* Description text + note icon */}
      <div className="flex gap-2 items-start">
        {/* majesticons:note-text — exact from Figma data-name, 20px */}
        <Icon icon="majesticons:note-text" width={20} className="text-text-primary shrink-0 mt-[1px]" />
        {/* Italic body text — Inter Regular 15px italic */}
        <p className="text-text-primary text-[15px] font-normal italic leading-[18px] tracking-[-0.23px] whitespace-pre-wrap flex-1">
          {displayText}
        </p>
      </div>
      {/* "Детальніше" expand trigger */}
      {isLong && (
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="flex items-center gap-2 justify-center w-full mt-1"
        >
          {/* material-symbols:expand-all-rounded — exact from Figma data-name, 14px */}
          <Icon
            icon="material-symbols:expand-all-rounded"
            width={14}
            className="text-text-primary"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          />
          <span className="text-text-primary text-[11px] font-normal leading-[13.2px] tracking-[0.06px]">
            {expanded ? 'Згорнути' : 'Детальніше'}
          </span>
        </button>
      )}
    </div>
  );
}
```

### Step 10 — TimeTrackingCard Component

```tsx
// src/components/screens/OrderHub/TimeTrackingCard.tsx
// Traces to: Scenario §4 Step 3 Block 3, §5.2 (disabled), §5.3 (locked), §7, §12.1

import { Icon } from '@iconify/react';
import { formatHours } from '@/utils/formatters';
import type { OrderDetail } from '@/types/order.types';

interface TimeTrackingCardProps {
  totalHours: number;
  canAddTime: boolean;
  isDone: boolean;          // locked state — shows "Історія" button only
  onAddTime: () => void;
  onViewHistory: () => void;
}

export function TimeTrackingCard({
  totalHours,
  canAddTime,
  isDone,
  onAddTime,
  onViewHistory,
}: TimeTrackingCardProps) {
  return (
    // bg-bg-card = #2d2d31, border all sides rgba(255,255,255,0.08), rounded-card = 20px
    <div
      className="mx-4 bg-bg-card rounded-card p-[17px] flex flex-col gap-3"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header: clock icon + "Облік" */}
      <div className="flex items-center gap-2">
        {/* majesticons:clock-line — exact from Figma data-name, 20px */}
        <Icon icon="majesticons:clock-line" width={20} className="text-text-primary" />
        <span className="text-text-primary font-semibold text-[17px] leading-[20.4px] tracking-[-0.43px]">
          Облік
        </span>
      </div>

      {/* Total hours — Space Grotesk 24px */}
      <span className="font-['Space_Grotesk','Noto_Sans',sans-serif] font-medium text-[24px] leading-[28.8px] text-text-primary">
        {formatHours(totalHours)}
      </span>

      {/* Action buttons row */}
      {isDone ? (
        // Locked state: only show "Історія" read-only button
        <button
          onClick={onViewHistory}
          className="w-full h-8 bg-bg-input rounded-[32px] flex items-center justify-center gap-2"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Icon icon="majesticons:clock-line" width={20} className="text-text-secondary" />
          <span className="text-text-secondary text-[15px] font-normal">Історія</span>
        </button>
      ) : (
        <div className="flex gap-3">
          {/* History icon button — 72px wide */}
          <button
            onClick={onViewHistory}
            className="h-8 w-[72px] bg-text-muted rounded-[32px] flex items-center justify-center shrink-0"
          >
            <Icon icon="majesticons:clock-line" width={20} className="text-text-primary" />
          </button>
          {/* "+ Додати" button — disabled when canAddTime=false */}
          <button
            onClick={canAddTime ? onAddTime : undefined}
            disabled={!canAddTime}
            className={`flex-1 h-8 rounded-[32px] flex items-center justify-center gap-2 transition-opacity ${
              canAddTime
                ? 'bg-text-muted'            // active: #525252
                : 'bg-[rgba(82,82,82,0.3)]'  // disabled: dimmed
            }`}
          >
            <span
              className={`text-[15px] font-normal ${canAddTime ? 'text-[#fafafa]' : 'text-text-secondary'}`}
            >
              + Додати
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
```

### Step 11 — PhotoGalleryCard Component

```tsx
// src/components/screens/OrderHub/PhotoGalleryCard.tsx
// Traces to: Scenario §4 Step 3 Block 4, §6 Edge Cases 3-4, §9 BR-W2-04

import { useRef } from 'react';
import { Icon } from '@iconify/react';
import type { OrderPhoto } from '@/types/order.types';

const MAX_PHOTOS_PER_DAY = 3;

interface PhotoGalleryCardProps {
  photos: OrderPhoto[];
  photosAddedToday: number;
  canAddPhotos: boolean;
  onAddPhoto: (file: File) => Promise<void>;
  onRemovePhoto: (photoId: string) => Promise<void>;
}

export function PhotoGalleryCard({
  photos,
  photosAddedToday,
  canAddPhotos,
  onAddPhoto,
  onRemovePhoto,
}: PhotoGalleryCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canAdd = canAddPhotos && photosAddedToday < MAX_PHOTOS_PER_DAY;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Size check: 10MB = 10 * 1024 * 1024
    if (file.size > 10 * 1024 * 1024) {
      alert('Файл занадто великий (max 10MB)');
      return;
    }
    await onAddPhoto(file);
    e.target.value = ''; // reset input for re-pick
  };

  return (
    <div
      className="mx-4 bg-bg-card rounded-card p-[17px] flex flex-col gap-4"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header: camera icon + "Фото роботи" */}
      <div className="flex items-center gap-2">
        {/* majesticons:camera-line — exact from Figma data-name, 20px */}
        <Icon icon="majesticons:camera-line" width={20} className="text-text-primary" />
        <span className="text-text-primary font-semibold text-[17px] leading-[20.4px] tracking-[-0.43px]">
          Фото роботи
        </span>
      </div>

      {/* Photo grid or single add button */}
      {photos.length === 0 && !canAdd ? null : (
        <div className="flex gap-2 flex-wrap">
          {/* Existing photo thumbnails */}
          {photos.map(photo => (
            <div
              key={photo.id}
              className="relative w-[80px] h-[80px] rounded-[20px] overflow-hidden shrink-0"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <img
                src={photo.thumbnailUrl}
                alt="Фото роботи"
                className="w-full h-full object-cover opacity-80"
              />
              {/* Remove button — only visible when canAddPhotos (not locked) */}
              {canAddPhotos && (
                <button
                  onClick={() => onRemovePhoto(photo.id)}
                  className="absolute top-[3px] right-[3.73px] w-[20px] h-[20px] rounded-full bg-[rgba(10,10,11,0.8)] flex items-center justify-center"
                  aria-label="Видалити фото"
                >
                  <Icon icon="mdi:close" width={10} className="text-text-primary" />
                </button>
              )}
            </div>
          ))}

          {/* Dashed Add slot — shown when limit not reached */}
          {canAdd && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-[75px] h-[80px] rounded-[20px] flex flex-col gap-1 items-center justify-center shrink-0"
              style={{ border: '2px dashed #9d9d9d' }}
              aria-label="Додати фото"
            >
              <Icon icon="solar:camera-add-bold" width={20} className="text-text-secondary" />
              <span className="text-text-secondary text-[15px] font-normal">Додати</span>
            </button>
          )}
        </div>
      )}

      {/* When no photos and canAdd: full-width button */}
      {photos.length === 0 && canAdd && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-8 bg-text-muted rounded-[32px] flex items-center justify-center gap-2"
        >
          <Icon icon="solar:camera-add-bold" width={20} className="text-[#fafafa]" />
          <span className="text-[#fafafa] text-[15px] font-normal">Додати</span>
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
```

### Step 12 — MapWidget Component

```tsx
// src/components/screens/OrderHub/MapWidget.tsx
// Traces to: Scenario §4 Step 3 Block 5, ADR Decision 3

interface MapWidgetProps {
  address: string;
  lat?: number;
  lng?: number;
}

export function MapWidget({ address, lat, lng }: MapWidgetProps) {
  // Build static map URL if coordinates available
  const mapUrl = lat && lng
    ? `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=358x100&maptype=osm`
    : null;

  return (
    <div className="mx-4 h-[100px] rounded-card relative overflow-hidden shrink-0">
      {/* Map background */}
      {mapUrl ? (
        <img src={mapUrl} alt="Map" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        // Placeholder gradient when no coordinates
        <div className="absolute inset-0 bg-gradient-to-br from-[#2d2d31] to-[#1a1a1e]" />
      )}

      {/* Dark gradient overlay (bottom half) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0f] via-transparent to-transparent" />

      {/* Location chip — bottom left, blurred */}
      <div
        className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-[12px]"
        style={{ background: 'rgba(31,31,34,0.8)', backdropFilter: 'blur(6px)' }}
      >
        {/* Pin icon — using solar:map-point-bold as @iconify closest match */}
        <svg width="9.33" height="11.67" viewBox="0 0 10 12" fill="none" className="shrink-0">
          <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 7 5 7s5-3.25 5-7c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 5 3.5a1.5 1.5 0 0 1 0 3z" fill="#e7e5e8"/>
        </svg>
        <span className="text-[#e7e5e8] text-[11px] font-normal leading-[13.2px] tracking-[0.06px] whitespace-nowrap">
          {address}
        </span>
      </div>
    </div>
  );
}
```

### Step 13 — DisputeResponseForm Component

```tsx
// src/components/screens/OrderHub/DisputeResponseForm.tsx
// Traces to: Scenario §5.4, §7, §9 BR-W2-09

import { useState } from 'react';
import { Icon } from '@iconify/react';
import type { OrderDispute, DisputeResponsePayload } from '@/types/order.types';
import { formatDisputeDate } from '@/utils/formatters';

interface DisputeResponseFormProps {
  dispute: OrderDispute;
  onSubmit: (payload: DisputeResponsePayload) => Promise<void>;
  isSubmitting?: boolean;
}

export function DisputeResponseForm({ dispute, onSubmit, isSubmitting }: DisputeResponseFormProps) {
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');

  const handleContest = async () => {
    if (!explanation.trim()) {
      setError('Необхідно написати пояснення');
      return;
    }
    setError('');
    await onSubmit({ action: 'contest', explanation: explanation.trim() });
  };

  const handleAccept = async () => {
    await onSubmit({ action: 'accept' });
  };

  return (
    <>
      {/* Dispute Banner */}
      <div
        className="mx-4 rounded-[20px] relative overflow-hidden"
        style={{ background: 'rgba(253,186,116,0.1)', border: '1px solid #fdba74', minHeight: '140px' }}
      >
        {/* Title row */}
        <div className="absolute top-4 left-4 right-4 flex items-center gap-2">
          {/* Alert icon — using SVG from Figma imgFrame */}
          <Icon icon="solar:danger-triangle-bold" width={16} className="text-[#fdba74] shrink-0" />
          <span className="text-[#fdba74] text-[15px] font-normal leading-[18px]">
            Менеджер оскаржив замовлення
          </span>
        </div>
        {/* Description */}
        <div className="absolute top-[44px] left-4 right-4">
          <p className="text-text-primary text-[15px] font-normal leading-[18px]">
            {dispute.description}
          </p>
        </div>
        {/* Timestamp */}
        <div className="absolute top-[106.5px] left-4 right-4 flex justify-end">
          <span className="text-text-secondary text-[11px] font-normal leading-[13.2px] tracking-[0.06px]">
            Створено: {formatDisputeDate(dispute.createdAt)}
          </span>
        </div>
      </div>

      {/* Response Form */}
      <div
        className="mx-4 bg-bg-card rounded-[20px] p-[17px] flex flex-col gap-3"
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Form header */}
        <div className="flex items-center gap-2">
          {/* mdi:think-outline — exact from Figma data-name, 20px */}
          <Icon icon="mdi:thought-bubble-outline" width={20} className="text-text-primary" />
          <span className="text-text-primary font-semibold text-[17px] leading-[20.4px] tracking-[-0.43px]">
            Ваша відповідь
          </span>
        </div>

        {/* Text area */}
        <textarea
          value={explanation}
          onChange={e => { setExplanation(e.target.value); setError(''); }}
          placeholder="Напишіть пояснення..."
          className="w-full h-[80px] bg-bg-input rounded-[16px] p-[13px] text-text-primary text-[15px] font-normal leading-[18px] resize-none placeholder:text-[#878787] focus:outline-none"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        />
        {error && <p className="text-status-error text-[12px]">{error}</p>}

        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Оскаржити — red, contest */}
          <button
            onClick={handleContest}
            disabled={isSubmitting}
            className="flex-1 h-[42px] rounded-[32px] flex items-center justify-center font-semibold text-[17px] text-white"
            style={{ background: '#f87171', border: '1px solid #f87171', boxShadow: '0 10px 15px -3px rgba(248,113,113,0.2), 0 4px 6px -4px rgba(248,113,113,0.2)' }}
          >
            Оскаржити
          </button>
          {/* Погодитись — green, accept */}
          <button
            onClick={handleAccept}
            disabled={isSubmitting}
            className="flex-1 h-[42px] rounded-[32px] flex items-center justify-center font-semibold text-[17px] text-white"
            style={{ background: '#34d399', border: '1px solid #34d399', boxShadow: '0 10px 15px -3px rgba(52,211,153,0.2), 0 4px 6px -4px rgba(52,211,153,0.2)' }}
          >
            Погодитись
          </button>
        </div>
      </div>
    </>
  );
}
```

### Step 14 — OrderHubScreen Root

```tsx
// src/components/screens/OrderHub/OrderHubScreen.tsx
// Traces to: Scenario §4 Full Flow, §8 Screen States

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import WebApp from '@twa-dev/sdk';
import { fetchOrderById, updateOrderStatus, uploadOrderPhoto, deleteOrderPhoto, submitDisputeResponse } from '@/services/orderService';
import { OrderInfoCard } from './OrderInfoCard';
import { DescriptionPanel } from './DescriptionPanel';
import { TimeTrackingCard } from './TimeTrackingCard';
import { PhotoGalleryCard } from './PhotoGalleryCard';
import { MapWidget } from './MapWidget';
import { StatusBanner } from './StatusBanner';
import { DisputeResponseForm } from './DisputeResponseForm';
import { OrderHubSkeleton } from './OrderHubSkeleton';
import { OrderHubError } from './OrderHubError';
import { Icon } from '@iconify/react';

interface OrderHubScreenProps {
  orderId: string;
  onBack: () => void;
}

export function OrderHubScreen({ orderId, onBack }: OrderHubScreenProps) {
  const queryClient = useQueryClient();

  // TMA Back Button integration
  useEffect(() => {
    WebApp.BackButton.show();
    WebApp.BackButton.onClick(onBack);
    return () => {
      WebApp.BackButton.hide();
      WebApp.BackButton.offClick(onBack);
    };
  }, [onBack]);

  // Server state
  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderById(orderId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: (action: 'start' | 'complete') => updateOrderStatus(orderId, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order', orderId] }),
  });

  // Dispute mutation
  const disputeMutation = useMutation({
    mutationFn: (payload: Parameters<typeof submitDisputeResponse>[1]) =>
      submitDisputeResponse(orderId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order', orderId] }),
  });

  if (isLoading) return <OrderHubSkeleton />;
  if (isError || !order) return <OrderHubError onRetry={refetch} />;

  const { status } = order;
  const isLocked = status === 'done';
  const isDispute = status === 'dispute';
  const isOverdue = status === 'overdue';
  const isChecking = status === 'checking';

  return (
    <div
      className="flex flex-col h-full bg-bg-screen overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Fixed Header */}
      <div className="flex items-center gap-3 px-4 py-4 shrink-0">
        {/* Back button — circle with rotated chevron */}
        <button
          onClick={onBack}
          className="bg-bg-card border rounded-full w-[40px] h-[40px] flex items-center justify-center shrink-0"
          style={{ borderColor: '#3e3e42' }}
          aria-label="Назад"
        >
          <Icon icon="solar:alt-arrow-right-bold" width={24} className="text-text-primary rotate-180" />
        </button>
        <h1 className="text-text-primary font-semibold text-[17px] leading-[20.4px] tracking-[-0.43px]">
          Замовлення №{order.number}
        </h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3 pb-4">
          {/* Block 1: Order Info Card */}
          <OrderInfoCard order={order} />

          {/* Contextual banners — only ONE appears at a time based on status */}
          {isOverdue && (
            <StatusBanner variant="overdue" daysOverdue={3} />
          )}
          {isChecking && (
            <StatusBanner variant="checking" />
          )}
          {isLocked && (
            <StatusBanner variant="locked" />
          )}
          {/* Dispute Banner + Response Form (compound) */}
          {isDispute && order.dispute && (
            <DisputeResponseForm
              dispute={order.dispute}
              onSubmit={payload => disputeMutation.mutateAsync(payload)}
              isSubmitting={disputeMutation.isPending}
            />
          )}

          {/* Block 2: Description */}
          <DescriptionPanel notes={order.notes} />

          {/* Block 3: Time Tracking */}
          <TimeTrackingCard
            totalHours={order.totalHours}
            canAddTime={order.canAddTime}
            isDone={isLocked}
            onAddTime={() => { /* TODO: open Add Time bottom sheet */ }}
            onViewHistory={() => { /* TODO: open History bottom sheet */ }}
          />

          {/* Block 4: Photos */}
          <PhotoGalleryCard
            photos={order.photos}
            photosAddedToday={order.photosAddedToday}
            canAddPhotos={order.canAddPhotos}
            onAddPhoto={async (file) => {
              await uploadOrderPhoto(orderId, file);
              queryClient.invalidateQueries({ queryKey: ['order', orderId] });
            }}
            onRemovePhoto={async (photoId) => {
              await deleteOrderPhoto(orderId, photoId);
              queryClient.invalidateQueries({ queryKey: ['order', orderId] });
            }}
          />

          {/* Block 5: Map */}
          <MapWidget
            address={order.location.address}
            lat={order.location.lat}
            lng={order.location.lng}
          />

          {/* Block 6: Report Issue — visible except when Done */}
          {order.canReportIssue && (
            <button
              className="mx-4 h-[42px] rounded-[32px] flex items-center justify-center gap-2"
              style={{ background: 'rgba(248,113,113,0.2)' }}
            >
              <Icon icon="solar:danger-triangle-bold" width={20} className="text-status-error" />
              <span className="text-status-error text-[15px] font-normal">Повідомити про проблему</span>
            </button>
          )}
        </div>
      </div>

      {/* Sticky Footer CTA — only for New and InProgress/Overdue */}
      {order.ctaAction && (
        <div
          className="shrink-0 px-4 pt-4"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 32px)' }}
        >
          <button
            onClick={() => order.ctaAction && statusMutation.mutate(order.ctaAction)}
            disabled={statusMutation.isPending}
            className="w-full h-[56px] bg-[#fafafa] rounded-[32px] flex items-center justify-center font-semibold text-[16px] text-[#222226] leading-[24px]"
          >
            {statusMutation.isPending
              ? 'Оновлення...'
              : order.ctaAction === 'start'
              ? 'Почати роботу'
              : '✓ Завершити роботу'}
          </button>
        </div>
      )}
    </div>
  );
}
```

### Step 15 — App.tsx Routing Integration

```tsx
// In src/App.tsx — ADD Order Hub route alongside existing screens
// (Pattern: extend existing router logic)

// Add state for selected order
const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

// In render: if selectedOrderId is set, show OrderHubScreen
if (selectedOrderId) {
  return (
    <OrderHubScreen
      orderId={selectedOrderId}
      onBack={() => setSelectedOrderId(null)}
    />
  );
}

// In MyTasksScreen — pass onTaskSelect prop:
// <TaskCard task={task} onClick={() => setSelectedOrderId(task.id)} />
```

---

## Verification Gate

After implementation, verify ALL of the following before marking as done:

| Gate | Check | How to Verify |
|------|-------|---------------|
| **Status State Check** | All 6 status states render correctly (New, InProgress, Overdue, Checking, Done, Dispute) | Create test navigation to each mock order ID |
| **Figma Icon Extraction Check** | All 5 icons use `@iconify/react` with exact Figma `data-name` values | Search codebase for `<svg` — must be 0 hand-drawn SVGs (map pin is allowed exception) |
| **Color Token Check** | No raw hex values outside `tailwind.config.js` / `statusConfig.ts` | `grep -r "#[0-9a-fA-F]" src/components/screens/OrderHub` |
| **Border Left-Only Check** | `OrderInfoCard` uses `style={{ borderLeft }}` not `className="border"` | Code review |
| **Price Format Check** | Amount shows `₴12,400` (comma, no decimal, hryvnia sign) | Render mock order, inspect text |
| **Hours Format Check** | Hours shows `5.0 год` (one decimal, Space Grotesk font) | Render mock, inspect font family |
| **Border Subtle Check** | Cards (time, photos, dispute form) use `rgba(255,255,255,0.08)` border | Inspect computed style |
| **Photo Limit Gate** | After 3 photos, dashed add slot disappears | Add 3 photos in InProgress mock, verify |
| **Dispute Form Validation** | `Оскаржити` with empty text shows error; `Погодитись` works without text | User action test |
| **Safe-Area Check** | Header has `env(safe-area-inset-top)`, CTA has `env(safe-area-inset-bottom)` | Test on iOS or simulator |
| **BackButton Check** | `Telegram.WebApp.BackButton` shown on mount, hidden on unmount | TMA TestMode or Telegram Desktop |
| **Locked State Check** | When status=Done: no report-issue btn, no photo add, time shows "Історія" only | Render `MOCK_ORDER_DONE` |
| **Sticky CTA Check** | CTA button is fixed at bottom, does not scroll away | Scroll test with long notes |
| **Map Fallback Check** | When no lat/lng, gradient placeholder renders without errors | Use mock without coordinates |

---

## Verification Gate Result

> ✅ Tech Stack document passes workflow validation gate:
> - [x] Contains `## File Structure`
> - [x] Contains `## Step-by-Step Implementation`
> - [x] Contains `## TypeScript Interfaces`
> - [x] Contains `Traces to:` references
> - [x] Contains `MockData.ts`
