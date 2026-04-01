# DAD — Data Architecture Document
# Global_Data_Layer — Larko Telegram Mini App

**Version:** 1.1  
**Date:** 2026-03-31  
**Author:** Data_Architect_TMA  
**Status:** FINAL — All open questions resolved  
**Traces to:** `ba/04_BRD_Larko_MVP.md`, `adr/ADR_SCREEN_My_Tasks.md`, `adr/ADR_SCREEN_Order_Hub.md`, `adr/ADR_SCREEN_My_Balance.md`, `adr/ADR_SCREEN_Add_Time_Log.md`, `adr/ADR_SCREEN_Profile_TimeOff_LeaveForm.md`, `tech-stack/TECH_STACK_SCREEN_My_Tasks.md`, `tech-stack/TECH_STACK_SCREEN_Order_Hub.md`, `tech-stack/TECH_STACK_SCREEN_My_Balance.md`, `tech-stack/TECH_STACK_SCREEN_Add_Time_Log.md`, `tech-stack/TECH_STACK_SCREEN_Profile_TimeOff_LeaveForm.md`, `implemented/IMPLEMENTED_SCREEN_My_Tasks.md`, `implemented/IMPLEMENTED_SCREEN_Order_Hub.md`

---

## 1. Overview

### Meta
- **Goal:** Describe how the Larko TMA stores, syncs, and caches data locally on the client, enabling offline-capable reads and reliable background sync of all worker mutations (time logs, order status, dispute responses, leave requests, photo uploads, preferences).
- **Platform:** Telegram Mini App (browser WebView — no native SQLite, no Service Worker)
- **Scope:** Client-side IndexedDB storage + background sync with Larko backend REST API

### In Scope
- Local storage technology selection
- Data model for all 9 business entities + 2 system entities (SyncQueue, CacheMetadata)
- Sync strategy: write path per mutable action, conflict resolution, retry policy
- Caching rules: TTL per entity, invalidation triggers
- Repository layer interface (contracts for implementer)
- Edge cases: first launch, offline, DB corruption, schema migration, token expiry

### Out of Scope
- Backend database schema
- Server-side sync logic
- UI components, routing, React Query configuration
- Authentication / Telegram initData verification

---

## 2. Constraints & Context

| Constraint | Detail |
|-----------|--------|
| **Platform** | Telegram Mini App (WebView — Chrome on Android, Safari on iOS) |
| **No native SQLite** | Must use browser storage APIs only |
| **Storage quota** | ~50MB+ for IndexedDB; ~5MB for localStorage |
| **Offline possible** | Field workers (solar, construction) frequently lose connectivity on job sites |
| **No Service Worker** | TMA WebView does not reliably support SW registration (confirmed in ADR-001-C) |
| **No background sync API** | Must trigger sync on app focus events (`visibilitychange` + `online`) |
| **No persistent connection** | Each TMA open is a fresh WebView session — no WebSocket maintained |
| **Security** | JWT access tokens MUST NOT be persisted; Telegram.WebApp.initData used for re-auth |
| **Multi-entity app** | 7 screens, 9+ entity types — exceeds localStorage capability |
| **Optimistic UI** | ADR-001-C, ADR-002-A, ADR-005-B all require zero-latency UI updates on writes |

---

## 3. Technology Decision

### Selected Technology: IndexedDB via Dexie.js

**Why:**
- Async API — does not block the main thread (critical for smooth TMA scrolling)
- Supports structured data, transactions, and complex queries (needed for SyncQueue + entity tables)
- Handles 50MB+ data volumes — sufficient for field workers' daily time logs, photos metadata, orders
- Dexie.js provides a clean, promise-based API over raw IndexedDB — reduces boilerplate and error surface
- Already in the JS ecosystem — no native build tools, no WASM — TMA-safe
- Confirmed viable: ADR-001-C uses static mocks today; the Repository layer will swap in Dexie with no UI changes

### Alternatives Considered

| Option | Verdict | Reason for Rejection |
|--------|---------|---------------------|
| `localStorage` | ❌ Rejected | Synchronous API blocks main thread; 5MB limit; string-only storage — unsuitable for 9 structured entity types + SyncQueue |
| `IndexedDB (raw)` | ⚠️ Possible | Verbose, error-prone API; no query helpers; Dexie.js is a strictly better developer experience wrapper |
| `idb` library | ⚠️ Possible | Lighter than Dexie.js but lacks `.where()` query helpers, table schema declaration, and built-in versioned upgrade model |
| `In-memory (Zustand only)` | ❌ Rejected | No persistence across sessions — data is lost every time the TMA is closed; incompatible with offline-first requirements |
| `SQLite via sql.js (WASM)` | ❌ Rejected | ~1.5MB bundle overhead; overkill for TMA; WASM performance in WebView is unpredictable on low-end Android devices |

---

## 4. Data Model

> All field types validated against `tech-stack/TECH_STACK_SCREEN_*.md` TypeScript interfaces.
> Source annotations are required per Data_Architect_TMA role constraints.

### Entity: Task
```typescript
// Source: TECH_STACK_SCREEN_My_Tasks.md — §TypeScript Interfaces
interface LocalTask {
  id: string                    // from Task.id — UUID, worker-assigned
  name: string                  // from Task.name — e.g. "Сонячна Станція №4"
  status: 'new' | 'in_progress' | 'overdue' | 'checking' | 'dispute' | 'done'  // from TaskStatus union
  companyName: string           // from Task.companyName
  address: string               // from Task.address
  notes?: string                // from Task.notes
  deadline: string              // from Task.deadline — ISO date "YYYY-MM-DD"
  paymentModel: 'fixed' | 'per_unit' | 'per_hour'  // from PaymentModel union
  amount: number                // from Task.amount
  amountPerUnit?: number        // from Task.amountPerUnit
  unitLabel?: string            // from Task.unitLabel
  quantity?: number             // from Task.quantity
  assignees: Array<{ id: string; initials: string; color: string }>  // from TaskAssignee[]
  hasStartButton: boolean       // from Task.hasStartButton
  hasActionButtons: boolean     // from Task.hasActionButtons
  // --- system fields ---
  updatedAt: number             // Unix timestamp (ms) — conflict resolution key
  createdAt: number             // Unix timestamp (ms)
  isSynced: boolean             // false = pending background sync
  _localVersion: number         // incremented on every local mutation
}
```

### Entity: Order
```typescript
// Source: TECH_STACK_SCREEN_Order_Hub.md — §TypeScript Interfaces (OrderDetail)
interface LocalOrder {
  id: string                    // from OrderDetail.id
  number: string                // from OrderDetail.number — e.g. "000445"
  name: string                  // from OrderDetail.name
  status: 'new' | 'in_progress' | 'overdue' | 'checking' | 'dispute' | 'done'  // reuses TaskStatus
  deadline: string              // from OrderDetail.deadline — ISO date
  amount: number                // from OrderDetail.amount
  notes: string                 // from OrderDetail.notes
  locationAddress: string       // from OrderDetail.location.address
  locationLat?: number          // from OrderDetail.location.lat
  locationLng?: number          // from OrderDetail.location.lng
  totalHours: number            // from OrderDetail.totalHours — sum of net hours
  photosAddedToday: number      // from OrderDetail.photosAddedToday — 3-per-day gate
  canAddTime: boolean           // from OrderDetail.canAddTime
  canAddPhotos: boolean         // from OrderDetail.canAddPhotos
  canReportIssue: boolean       // from OrderDetail.canReportIssue
  ctaAction: 'start' | 'complete' | null  // from OrderDetail.ctaAction
  // --- system fields ---
  updatedAt: number
  createdAt: number
  isSynced: boolean
  _localVersion: number
}
```

### Entity: TimeLogEntry
```typescript
// Source: TECH_STACK_SCREEN_Add_Time_Log.md — §TypeScript Interfaces (TimeLogEntry)
// Cross-reference: TECH_STACK_SCREEN_Order_Hub.md — TimeLog interface (merged into one entity)
interface LocalTimeLogEntry {
  id: string                    // from TimeLogEntry.id — UUID generated client-side
  orderId: string               // from TimeLogEntry.orderId — FK → orders table
  workerId: string              // from TimeLogEntry.workerId
  logDate: string               // from TimeLogEntry.logDate — "YYYY-MM-DD"
  workStart: string             // from TimeLogEntry.workStart — "HH:MM"
  workEnd: string               // from TimeLogEntry.workEnd — "HH:MM"
  breaks: Array<{ id: string; breakStart: string; breakEnd: string }>  // from BreakPair[]
  netHours: number              // computed: decimal hours e.g. 8.0
  comment?: string              // from TimeLogEntry.comment
  unitsCompleted?: number       // from TimeLogEntry.unitsCompleted (Per-Unit orders only)
  isOvertime: boolean           // computed: netHours > company daily threshold (default 8h)
  overtimeHours?: number        // computed: netHours - threshold if overtime
  isReadOnly: boolean           // from TimeLog.isReadOnly — true once synced to server
  // --- system fields ---
  updatedAt: number
  createdAt: number
  isSynced: boolean
  _localVersion: number
}
```

### Entity: OrderPhoto
```typescript
// Source: TECH_STACK_SCREEN_Order_Hub.md — §TypeScript Interfaces (OrderPhoto)
interface LocalOrderPhoto {
  id: string                    // from OrderPhoto.id — UUID assigned by server OR temp UUID
  orderId: string               // FK → orders table
  url: string                   // from OrderPhoto.url — full-size URL (or blob URL pre-sync)
  thumbnailUrl: string          // from OrderPhoto.thumbnailUrl
  uploadedAt: string            // from OrderPhoto.uploadedAt — ISO date
  workerName: string            // from OrderPhoto.workerName
  // --- system fields ---
  updatedAt: number
  createdAt: number
  isSynced: boolean             // false = waiting for upload to server
  _localVersion: number
}
```

### Entity: LeaveRequest
```typescript
// Source: TECH_STACK_SCREEN_Profile_TimeOff_LeaveForm.md — §TypeScript Interfaces (LeaveRequest)
interface LocalLeaveRequest {
  id: string                    // from LeaveRequest.id — UUID generated client-side
  type: string                  // from LeaveRequest.type — display label e.g. "Лікарняний"
  typeId: string                // leave type ID for sync payload
  startDate: string             // from LeaveRequest.startDate — "YYYY-MM-DD"
  endDate: string               // from LeaveRequest.endDate — "YYYY-MM-DD"
  durationDays: number          // from LeaveRequest.durationDays
  reason?: string               // from LeaveRequest.reason
  status: 'pending' | 'approved' | 'rejected'  // from LeaveStatus union
  // --- system fields ---
  updatedAt: number
  createdAt: number
  isSynced: boolean
  _localVersion: number
}
```

### Entity: UserProfile
```typescript
// Source: TECH_STACK_SCREEN_Profile_TimeOff_LeaveForm.md — §TypeScript Interfaces (UserProfile + UserPreferences)
interface LocalUserProfile {
  id: string                    // from UserProfile.id
  name: string                  // from UserProfile.name
  avatarUrl: string | null      // from UserProfile.avatarUrl
  companyName: string           // from UserProfile.company.name
  language: 'uk' | 'en'        // from UserPreferences.language
  theme: 'dark' | 'light'      // from UserPreferences.theme
  // --- system fields ---
  updatedAt: number
  createdAt: number
  isSynced: boolean
  _localVersion: number
}
```

### Entity: BalanceSummary + BalanceHistoryItem

> **⚠️ CONFIRMED DECISION (Q2):** `BalanceSummary` and `BalanceHistoryItem` are **NOT stored in IndexedDB**.
> React Query in-memory cache is sufficient — balance data is read-only, has no offline mutation path,
> and fresh network data is always preferred. These types are defined in TypeScript only.

```typescript
// Source: TECH_STACK_SCREEN_My_Balance.md — §TypeScript Interfaces
// Runtime shape only — NOT persisted to IndexedDB
type BalanceData = {
  earned: number
  advances: number
  remaining: number
  periodLabel: string
  history: BalanceHistoryItem[]
}
type BalancePeriod = 'week' | 'month' | 'all'
```

### Entity: LeaveType (config/catalog)
```typescript
// Source: TECH_STACK_SCREEN_Profile_TimeOff_LeaveForm.md — §TypeScript Interfaces (LeaveType)
// Note: Near-static config data. Long TTL. No mutations from client.
interface LocalLeaveType {
  id: string                    // from LeaveType.id
  label_uk: string              // from LeaveType.label_uk
  label_en: string              // from LeaveType.label_en
  // --- system fields ---
  updatedAt: number
  createdAt: number
  isSynced: boolean             // always true — catalog, no mutations
  _localVersion: number
}
```

### Entity: SyncQueue (REQUIRED)
```typescript
interface SyncQueueItem {
  id: string                    // UUID generated client-side
  entityType: 'task' | 'order' | 'timeLogEntry' | 'orderPhoto' | 'leaveRequest' | 'userProfile'
  action: 'create' | 'update' | 'delete'
  payload: Record<string, unknown>  // serialized mutation data (NO sensitive credentials)
  retryCount: number            // starts at 0; max 5 before DEAD_LETTER
  createdAt: number             // Unix timestamp (ms) — determines flush order
  lastAttemptAt: number | null  // timestamp of last sync attempt
  error: string | null          // last error message if sync failed
}
```

### Entity: CacheMetadata (REQUIRED)
```typescript
interface CacheMetadata {
  key: string                   // e.g. 'tasks_list', 'order_detail_order-1', 'balance_month'
  fetchedAt: number             // Unix timestamp (ms) of last API fetch
  ttl: number                   // TTL in milliseconds (defined as constant, not inline)
}
```

### Entity Relationships

```
LocalOrder 1 ──────────── N LocalTimeLogEntry   (orderId FK)
LocalOrder 1 ──────────── N LocalOrderPhoto      (orderId FK)
LocalTask  1 ──────────── 1 LocalOrder           (shared id — same entity, different projections)
LocalBalanceSummary 1 ─── N LocalBalanceHistoryItem  (balancePeriod FK)
LocalLeaveRequest N ────── 1 LocalLeaveType      (typeId FK — catalog reference)
LocalUserProfile  1 ───── N LocalLeaveRequest    (implicit: worker owns requests)
SyncQueueItem  N ──────── 1 (any mutable entity) (entityType + payload.id)
CacheMetadata  N ──────── 1 (any cached entity)  (key maps to entity + qualifier)
```

---

## 5. Storage Structure

```
DB Name: larko_app_db
DB Version: 1

Tables:
  ├── tasks                PK: id
  │     indexes: updatedAt, isSynced, status
  ├── orders               PK: id
  │     indexes: updatedAt, isSynced, status
  ├── time_log_entries     PK: id
  │     indexes: orderId, logDate, isSynced, updatedAt
  ├── order_photos         PK: id
  │     indexes: orderId, isSynced, updatedAt
  ├── leave_requests       PK: id
  │     indexes: status, isSynced, updatedAt
  ├── leave_types          PK: id
  │     indexes: (none — small table, full scan acceptable)
  ├── user_profiles        PK: id
  │     indexes: (none — single row expected)
  ├── sync_queue           PK: id
  │     indexes: entityType, createdAt, retryCount
  └── cache_metadata       PK: key

Note: balance_summaries and balance_history are NOT stored in IndexedDB.
      Balance data lives in React Query in-memory cache only (Q2 — CONFIRMED).
```

---

## 6. Data Flow

> Exact write path for every user action that mutates data.

### Action: Worker submits a time log (Add Time Log screen)
```
Trigger: Worker taps "Save" on AddTimeLogScreen
  1. Client-side validation via useTimeLogForm.isValid (net > 0, no overlapping breaks, no duplicate for today)
  2. Generate id = crypto.randomUUID(), set createdAt = updatedAt = Date.now(), isSynced = false, _localVersion = 1
  3. Compute netHours from calculateNetMinutes(workStart, workEnd, breaks)
  4. Write LocalTimeLogEntry to time_log_entries table via TimeLogRepository.save()
  5. Invalidate CacheMetadata key: 'time_logs_order_{orderId}'
  6. Push SyncQueueItem { entityType: 'timeLogEntry', action: 'create', payload: entry }
  7. UI updates immediately: history list shows new entry with syncStatus 'pending' badge
  8. SyncService (background, on next flush trigger):
     a. POST /api/v1/orders/{orderId}/time-logs with payload
     b. On 2xx: mark entry.isSynced = true, _localVersion unchanged, remove from SyncQueue, update CacheMetadata
     c. On 409 Conflict (duplicate): mark SyncQueue item as DEAD_LETTER, show inline error
     d. On 5xx / timeout: increment retryCount, schedule retry with exponential backoff
```

### Action: Worker changes order status (Start / Complete)
```
Trigger: Worker taps "▶ Почати роботу" or "✓ Завершити"
  1. No client-side validation needed — button presence is the gate
  2. Update LocalOrder.status = newStatus, isSynced = false, updatedAt = Date.now(), _localVersion++
  3. Push SyncQueueItem { entityType: 'order', action: 'update', payload: { id, status: newStatus } }
  4. UI reflects new status immediately (optimistic) — card border/badge color changes
  5. SyncService:
     a. PATCH /api/v1/orders/{id}/status with { action: 'start' | 'complete' }
     b. On 2xx: mark isSynced = true
     c. On 4xx: revert LocalOrder.status to previous value, remove from SyncQueue, show toast
```

### Action: Worker uploads a photo
```
Trigger: Worker picks image from camera/gallery on PhotoGalleryCard
  1. Gate: photosAddedToday < 3 AND file.size <= 10MB — enforced client-side
  2. Create blob URL via URL.createObjectURL(file) for immediate preview
  3. Generate id = crypto.randomUUID() (temp local ID), set isSynced = false
  4. Write LocalOrderPhoto to order_photos table, update order.photosAddedToday++
  5. Push SyncQueueItem { entityType: 'orderPhoto', action: 'create', payload: { orderId, file } }
  6. UI shows thumbnail immediately in gallery
  7. SyncService:
     a. POST /api/v1/orders/{orderId}/photos (multipart/form-data)
     b. On 2xx: receive real server photo id, replace temp id in local DB, isSynced = true
     c. On error: remove from gallery UI, show "Upload failed" toast, delete from order_photos table
```

### Action: Worker deletes a photo
```
Trigger: Worker taps [×] on photo thumbnail
  1. Remove LocalOrderPhoto from order_photos table immediately
  2. Decrement order.photosAddedToday in local DB
  3. Push SyncQueueItem { entityType: 'orderPhoto', action: 'delete', payload: { orderId, photoId } }
  4. UI removes thumbnail immediately
  5. SyncService:
     a. DELETE /api/v1/orders/{orderId}/photos/{photoId}
     b. On 2xx: remove from SyncQueue
     c. On 404 (already deleted): also remove from SyncQueue — idempotent
```

### Action: Worker submits dispute response (accept or contest)
```
Trigger: Worker taps "Погодитись" or "Оскаржити" on DisputeResponseForm
  1. Validation: if action === 'contest', explanation text must be present
  2. Update LocalOrder.status = 'checking' (optimistic, dispute resolved from worker's side)
  3. Push SyncQueueItem { entityType: 'order', action: 'update', payload: { id, disputeAction: action, explanation } }
  4. UI hides DisputeResponseForm, shows checking banner
  5. SyncService: POST /api/v1/orders/{id}/dispute/response
```

### Action: Worker creates a leave request
```
Trigger: Worker taps "Зберегти" on LeaveFormScreen (W6)
  1. Validate via useLeaveFormStore.validate(): typeId required, startDate ≥ today, endDate ≥ startDate
  2. Generate id = crypto.randomUUID(), status = 'pending', createdAt = updatedAt = Date.now(), isSynced = false
  3. Write LocalLeaveRequest to leave_requests table
  4. Invalidate CacheMetadata key: 'leave_requests_list'
  5. Push SyncQueueItem { entityType: 'leaveRequest', action: 'create', payload: { typeId, startDate, endDate, reason } }
  6. UI navigates to W5 TimeOff screen; new request appears with 'pending' status
  7. SyncService: POST /api/v1/leave-requests
```

### Action: Worker updates user preferences (language / theme)
```
Trigger: Worker toggles language or theme on ProfileScreen (W4)
  1. Update useUserPreferencesStore immediately (Zustand persisted to localStorage via 'user-preferences' key)
  2. Apply CSS change: document.documentElement.setAttribute('data-theme', theme) — instant visual feedback
  3. Update LocalUserProfile.language/theme in user_profiles table, isSynced = false
  4. Push SyncQueueItem { entityType: 'userProfile', action: 'update', payload: { language?, theme? } }
  5. UI reflects change immediately (< 100ms) — fire-and-forget pattern
  6. SyncService: PATCH /api/v1/users/me
     On failure: revert store + local DB; do NOT show error for preferences (silent retry only)
```

---

## 7. Sync Strategy

### Type: Optimistic UI + Background Sync

**Write trigger (local):** User action → validate → write to IndexedDB → push SyncQueueItem → update UI immediately (no waiting for API)

**Flush trigger (background):** Two events trigger SyncService.flush():
1. `window.addEventListener('online', flush)` — device reconnects to internet
2. `document.addEventListener('visibilitychange', () => { if (!document.hidden) flush() })` — app comes to foreground in TMA

### Conflict Resolution Policy

**Selected:** `last-write-wins` by `updatedAt` timestamp

```
Rule: The entity with the higher updatedAt timestamp is authoritative.

If localEntity.updatedAt > serverEntity.updatedAt:
  → Local version wins: PATCH server with local payload
If serverEntity.updatedAt > localEntity.updatedAt:
  → Server version wins: overwrite local DB with server data, discard local SyncQueue entry
If updatedAt timestamps are equal:
  → Server wins (tie-break): treat as server-priority to prevent infinite sync loops
```

**Rejected alternatives:**
- `server-priority (always)`: Discards valid offline work without user visibility — unacceptable for time logs submitted offline in the field
- `merge-fields`: Requires complex field-level diff logic — overkill for MVP, deferred to Phase 2

**Exception — Time Logs:** Time log entries are immutable once created (BRD BR-TL-001: one log per day). Conflict resolution is not needed — 409 Conflict from server triggers DEAD_LETTER, not overwrite.

**Exception — Photos:** Photos use server-assigned IDs. No conflict is possible — upload either succeeds (isSynced = true) or fails (removed from local DB).

**Exception — Preferences:** Preferences are `server-priority` — the server's stored preferences are authoritative after login. Local Zustand store is seeded from server on first profile fetch.

### Retry Strategy

```
retryCount:   0 → wait 1 * 1000 = 1s
retryCount:   1 → wait 2 * 1000 = 2s
retryCount:   2 → wait 4 * 1000 = 4s
retryCount:   3 → wait 8 * 1000 = 8s
retryCount:   4 → wait 16 * 1000 = 16s
retryCount: ≥ 5 → mark DEAD_LETTER (error = last error message), stop retrying, notify user
```

Formula: `Math.min(Math.pow(2, retryCount) * 1000, 32000)` ms

### SyncService Lock (race condition prevention)

```javascript
// Prevents concurrent SyncService flush runs (e.g., 'online' + 'visibilitychange' firing simultaneously)
navigator.locks.request('larko_sync_lock', async () => {
  await flushSyncQueue()
})
```

---

## 8. Caching Strategy

### Cache Read Logic (applied in each Repository.getAll())

```
1. Look up CacheMetadata by key
2. If record exists AND fetchedAt + ttl > Date.now():
   → Cache HIT: return data from local DB table immediately
3. If record missing OR fetchedAt + ttl <= Date.now():
   → Cache MISS: fetch from API → write to DB → upsert CacheMetadata { fetchedAt: Date.now(), ttl }
   → Return freshly fetched data
```

### TTL per Entity

| Entity | Cache Key | TTL | Rationale | Invalidation Trigger |
|--------|-----------|-----|-----------|---------------------|
| `tasks_list` | `tasks_list` | `5 * 60 * 1000` (5 min) | Read frequently; status changes are infrequent | On order status update, on new task assignment push |
| `order_detail_{id}` | `order_detail_{orderId}` | `5 * 60 * 1000` (5 min) | Order data changes on status transitions and time log submit | On any order mutation (status, timelog, photo) |
| `time_logs_{orderId}` | `time_logs_order_{orderId}` | `5 * 60 * 1000` (5 min) | Workers check history multiple times per day | On saveTimeLog() or deleteTimeLog() |
| `balance_{period}` ⚠️ | React Query `staleTime: 5 * 60 * 1000` only | `5 * 60 * 1000` (5 min) | Read-only; no offline mutation; React Query in-memory cache is sufficient (Q2 CONFIRMED) | On `useBalancePeriodStore` period change → `invalidateQueries(['balance', period])` |
| `leave_requests_list` | `leave_requests_list` | `2 * 60 * 1000` (2 min) | Status can change (manager approval); fresher data preferred | On createLeaveRequest() |
| `leave_calendar_{YYYY-MM}` | `leave_calendar_{yearMonth}` | `5 * 60 * 1000` (5 min) | Calendar dots derived from leave requests | On createLeaveRequest() |
| `leave_types` | `leave_types` | `60 * 60 * 1000` (1 hour) | Near-static config catalog | On company settings change (future) |
| `user_profile` | `user_profile` | `10 * 60 * 1000` (10 min) | Rarely changes; name/avatar updates are infrequent | On patchUserPreferences() success |

> ⚠️ Balance rows use React Query `staleTime` only — they do NOT use Dexie CacheMetadata. Polling is via `refetchInterval: 60 * 1000` with `refetchIntervalInBackground: false` (Q3 CONFIRMED).

### Invalidation Implementation

```typescript
// On local mutation:
await cacheMetadataRepo.delete('tasks_list')  // Delete entry → next read triggers API fetch

// On explicit user refresh (pull-to-refresh or retry button):
await cacheMetadataRepo.clearAll()  // Force-invalidate everything → full refetch on next read
```

---

## 9. Data Layer Architecture

```
┌──────────────────────────────────────────────────────────┐
│               UI Components (React)                      │
│  MyTasksScreen / OrderHubScreen / MyBalanceScreen /      │
│  AddTimeLogScreen / ProfileScreen / TimeOffScreen        │
└──────────────────────┬───────────────────────────────────┘
                       │  JSX renders from hook data
┌──────────────────────▼───────────────────────────────────┐
│      Hooks + React Query Cache                           │
│  useQuery(['tasks'], fetchWorkerTasks, staleTime: 5min)  │
│  useQuery(['order', id], fetchOrderById, staleTime: 5min)│
│  useMutation(saveTimeLog, { onSuccess: invalidate })     │
│  Zustand: useTaskFilterStore / useBalancePeriodStore /   │
│           useUserPreferencesStore / useLeaveFormStore    │
└──────────────────────┬───────────────────────────────────┘
                       │  calls service functions
┌──────────────────────▼───────────────────────────────────┐
│              Service Layer (transitional)                │
│  tasksService / orderService / balanceService /          │
│  timeLogService / profileService / leaveService          │
│  (currently mock — will delegate to Repository)         │
└──────────────────────┬───────────────────────────────────┘
                       │  delegates via Repository interface
┌──────────────────────▼───────────────────────────────────┐
│              Repository Layer                            │
│  TaskRepository / OrderRepository / TimeLogRepository /  │
│  OrderPhotoRepository / LeaveRequestRepository /         │
│  UserProfileRepository / BalanceSummaryRepository /      │
│  CacheMetadataRepository                                │
│  getAll(), getById(), save(), delete(),                  │
│  getPendingSync(), markSynced()                          │
└────────────┬───────────────────────────┬─────────────────┘
             │ reads/writes              │ enqueues
┌────────────▼──────────────┐  ┌────────▼─────────────────┐
│  Local DB (Dexie.js)      │  │   Sync Queue             │
│  IndexedDB                │  │   (sync_queue table)     │
│  larko_app_db v1          │  └────────────┬─────────────┘
│  10 tables (see §5)       │               │ reads on flush
└───────────────────────────┘  ┌────────────▼─────────────┐
                               │  Sync Service             │
                               │  (background, lock-based) │
                               │  flush() / retry() /      │
                               │  handleConflict()         │
                               └────────────┬─────────────┘
                                            │ HTTP
                               ┌────────────▼─────────────┐
                               │  Backend REST API         │
                               │  /api/v1/* endpoints      │
                               └──────────────────────────┘
```

### Repository Interface (contract for implementer)

```typescript
// All repositories implement this base interface
interface BaseRepository<T> {
  getAll(filter?: Partial<T>): Promise<T[]>
  getById(id: string): Promise<T | null>
  save(entity: T): Promise<void>            // upsert (insert or update by id)
  delete(id: string): Promise<void>
  clearAll(): Promise<void>                 // for DB reset / first-launch
}

// Sync-aware repositories additionally implement:
interface SyncableRepository<T> extends BaseRepository<T> {
  getPendingSync(): Promise<T[]>            // where isSynced === false
  markSynced(id: string): Promise<void>     // set isSynced = true
  getBySyncStatus(synced: boolean): Promise<T[]>
}
```

---

## 10. Offline Behavior

| Scenario | Behavior |
|----------|---------|
| **Read while offline** | Return local DB data from cache (HIT path in Repository.getAll()); React Query returns stale data with `isStale: true`; show "Офлайн — показані кешовані дані" banner |
| **Write while offline** | Write to local DB → push SyncQueueItem → UI updates optimistically; no error shown to user; SyncQueue grows until reconnection |
| **App comes online** | SyncService.flush() triggered via `window.online` event; processes SyncQueue in `createdAt` order (oldest first) |
| **Offline at first launch** | DB is empty — no local data; React Query fetch fails; show empty state + "Немає з'єднання" error banner; do NOT crash |
| **Long offline period (>10 min)** | All CacheMetadata TTLs will be expired; on reconnect, force-invalidate all CacheMetadata keys → refetch all entities |
| **Worker submits time log offline** | Writes to time_log_entries, pushed to SyncQueue; shown in history with "Очікує синхронізації" indicator |
| **Multiple pending writes** | SyncQueue processes in FIFO order; each item retried independently; one DEAD_LETTER does not block others |

---

## 11. Migrations

### Strategy: Dexie.js versioned upgrades

```typescript
const db = new Dexie('larko_app_db')

// Version 1 — initial schema (8 entity tables + 2 system tables)
// Note: balance_summaries and balance_history are intentionally OMITTED
//       — balance data uses React Query in-memory cache only (Q2 CONFIRMED)
db.version(1).stores({
  tasks:             'id, updatedAt, isSynced, status',
  orders:            'id, updatedAt, isSynced, status',
  time_log_entries:  'id, orderId, logDate, isSynced, updatedAt',
  order_photos:      'id, orderId, isSynced, updatedAt',
  leave_requests:    'id, status, isSynced, updatedAt',
  leave_types:       'id',
  user_profiles:     'id',
  sync_queue:        'id, entityType, createdAt, retryCount',
  cache_metadata:    'key',
})

// Version 2 example — adding a new field to time_log_entries (for future)
// db.version(2).stores({ ... }).upgrade(tx => {
//   return tx.time_log_entries.toCollection().modify(entry => {
//     entry.newField = 'default_value'
//   })
// })
```

### Rules
- Each schema change increments DB version (never skip version numbers)
- `.upgrade()` callback provides data migration for existing rows
- Old version data is preserved unless explicitly migrated
- Never remove a version block from the code (Dexie needs full version history)
- Migration scripts stored in `src/db/migrations/v[N].ts` for documentation purposes

---

## 12. Error Handling

> Runtime errors only. Lifecycle scenarios (first launch, upgrade) belong in §14 Edge Cases.

| Error Type | Handling Strategy |
|-----------|------------------|
| **DB open failure** | Catch Dexie `open()` error → log with `console.error` → attempt `Dexie.delete('larko_app_db')` → re-initialize v1 schema → notify user with toast "Локальна база даних скинута" |
| **DB write failure** | Retry write up to 3 times (immediate retry, no backoff) → on 3rd failure, fall back to in-memory state only → log error + show toast |
| **DB read failure** | Return empty array ([]) → trigger API fetch → log error |
| **Sync HTTP 4xx (400, 409, 422)** | Log error, mark SyncQueue item with error message, do NOT retry (client errors require user action) — except 409 on time logs which triggers DEAD_LETTER |
| **Sync HTTP 4xx (401 Unauthorized)** | Pause entire SyncQueue processing → trigger re-auth flow (Telegram.WebApp.initData) → resume after token refreshed |
| **Sync HTTP 5xx / network timeout** | Increment SyncQueue.retryCount → schedule retry with exponential backoff (see §7) |
| **DEAD_LETTER item (retryCount ≥ 5)** | Show persistent sticky toast: "X змін не вдалося синхронізувати" + "Повторити" button → on tap, reset retryCount = 0 and re-flush |
| **Quota exceeded (QuotaExceededError)** | Detect `DOMException: QuotaExceededError` → prompt user: "Сховище повне. Очистити кеш?" → on confirm, `cacheMetadataRepo.clearAll()` + evict old balance_history |
| **Conflict detected on sync** | Apply last-write-wins policy (see §7) → log which version won → update local DB if server wins |

---

## 13. Security

### ❌ NEVER store in IndexedDB (larko_app_db) or localStorage

- JWT access tokens → keep in **memory only** (Zustand store without `persist` middleware for auth tokens)
- Refresh tokens → use `Telegram.WebApp.initData` for re-authentication (Telegram manages token lifecycle)
- Payment card numbers, CVV codes, PINs
- Raw password hashes or salts
- Full bank account numbers or IBAN

### ✅ Safe to store in IndexedDB

- Task data, order details, time logs (business entities without financial credentials)
- User display name, avatar URL, language/theme preferences
- Leave requests and leave types
- Balance summaries and history (amounts are display values, not transaction credentials)
- SyncQueue payloads (must not contain tokens or raw credentials — only business entity data)
- CacheMetadata timestamps

### ✅ Safe to store in localStorage (via Zustand persist middleware)

- `user-preferences`: `{ language: 'uk'|'en', theme: 'dark'|'light' }` — no sensitive data
- Nothing else

### Token Handling on Sync Error

```
If SyncService receives HTTP 401 during flush:
  1. Pause SyncQueue processing immediately (do NOT retry with same expired token)
  2. Call Telegram.WebApp.initData to get fresh Telegram authorization
  3. Re-authenticate with backend using initData hash
  4. On re-auth success: resume SyncQueue from the failed item
  5. On re-auth failure: clear SyncQueue items (they cannot be synced), redirect to onboarding
```

---

## 14. Edge Cases

> Lifecycle scenarios only. Runtime errors belong in §12 Error Handling.

| Edge Case | Behavior |
|-----------|---------|
| **First launch (empty DB)** | All Repository.getAll() calls return [] from DB → API fetch is triggered immediately (cache MISS on empty CacheMetadata) → populate DB → set CacheMetadata.fetchedAt |
| **DB corruption / open error** | Catch Dexie `open()` or `VersionError` → `Dexie.delete('larko_app_db')` → re-initialize with version 1 schema → notify user "Дані скинуті — оновлення даних..." → trigger fresh API fetch |
| **Schema version upgrade (app update)** | Dexie detects version mismatch on open → runs `.upgrade()` callback → migration applied to existing data → app continues normally |
| **Offline at first launch** | DB is empty, API fetch fails → show empty state screens with "Немає з'єднання" banner → do NOT crash or throw unhandled rejection |
| **SyncQueue DEAD_LETTER** | Show persistent toast at bottom of screen: "⚠️ X змін не синхронізовано" + "Повторити" button → manual retry resets retryCount = 0 |
| **Duplicate SyncQueue entries** | SyncService deduplicates by `entityType + payload.id` before flush — keeps only the most recent `createdAt` entry per entity |
| **Token expiry during sync** | Pause SyncQueue → re-auth → resume → do NOT discard queue items (data integrity is critical for time logs) |
| **App upgrade clears WebView cache** | Re-fetch all data on first open post-upgrade; Dexie migration runs if DB version changed |
| **User manually clears browser data** | Same as first launch — DB is empty, CacheMetadata is gone; graceful fresh-start behavior |
| **Multiple TMA windows / tabs** | `navigator.locks.request('larko_sync_lock', ...)` prevents parallel SyncService flush runs across tabs |
| **Clock skew between client and server** | `updatedAt` timestamps are generated client-side; advise backend to accept server time if delta > 5 minutes (noted as NON-BLOCKING in §15) |

---

## 15. Open Questions

> All questions answered. Impact tags use the required [NON-BLOCKING] format.
> fallback: for Q1 remains in section 16 until API spec is delivered.

| # | Question | Impact | Answer |
|---|---------|--------|--------|
| Q1 | What are the exact REST API endpoint paths for time log creation, order status update, and dispute response? | [NON-BLOCKING] | Open — mocks sufficient. fallback: use *Service.ts mock as contract; swap when backend delivers spec |
| Q2 | Should BalanceSummary and BalanceHistoryItem be stored in IndexedDB, or is React Query in-memory cache sufficient? | [NON-BLOCKING] | CONFIRMED: React Query in-memory only. No balance_summaries or balance_history Dexie tables. |
| Q3 | Is there a server-side push mechanism for balance advance notifications, or does the app rely purely on polling? | [NON-BLOCKING] | CONFIRMED: Polling only. refetchInterval: 60 * 1000, refetchIntervalInBackground: false. |
| Q4 | Should DEAD_LETTER SyncQueue items be persisted indefinitely or expire after N days? | [NON-BLOCKING] | CONFIRMED: Persist indefinitely. No auto-purge. |
| Q5 | Is multi-device support required for MVP? | [NON-BLOCKING] | CONFIRMED: Single-device per worker. Multi-device deferred to Phase 2. |

---

## 16. Developer Notes

> This section is for the **implementer** (TMA_Implementer role). Contains fallback assumptions for all Open Questions plus integration hints.

### Confirmed Implementation Decisions

> All questions resolved. These are **binding decisions**, not fallbacks.

- **Q1:** API endpoints TBD — use `src/services/*Service.ts` mocks as the implementation contract. The Repository injection point means zero UI changes when real API arrives.
- **Q2 ✅ CONFIRMED:** Do **NOT** create `balance_summaries` or `balance_history` Dexie tables. Do **NOT** implement `BalanceSummaryRepository` or `BalanceHistoryRepository`. Balance data is managed entirely by React Query (`staleTime: 5 * 60 * 1000` on `useQuery(['balance', period])`).
- **Q3 ✅ CONFIRMED:** Configure `useQuery(['balance', period])` with `refetchInterval: 60 * 1000` and `refetchIntervalInBackground: false`. No WebSocket or Telegram bot integration.
- **Q4 ✅ CONFIRMED:** DEAD_LETTER items persist in `sync_queue` table **indefinitely**. Do NOT add any auto-purge logic. Show persistent toast UI for all items where `retryCount >= 5`.
- **Q5 ✅ CONFIRMED:** MVP is single-device per worker. Implement last-write-wins without multi-device guards. Add `// TODO: Multi-device conflict resolution — Phase 2` in `SyncService.ts`.

### Integration Notes for Implementer

- **DB name:** `larko_app_db` (do NOT use a placeholder — this is the production name)
- **DB version at time of writing:** `1`
- **Next migration will be version `2`** — never skip version numbers in Dexie `.version()` calls
- **Install Dexie.js:** `npm install dexie` — verify it is not already in `package.json` before installing
- **File structure to create:**
  ```
  src/db/
  ├── AppDB.ts                              # Dexie instance + schema declaration (9 tables)
  ├── migrations/                           # Empty for v1; placeholder for future
  └── repositories/
      ├── index.ts                          # Re-exports all repositories
      ├── TaskRepository.ts
      ├── OrderRepository.ts
      ├── TimeLogRepository.ts
      ├── OrderPhotoRepository.ts
      ├── LeaveRequestRepository.ts
      ├── LeaveTypeRepository.ts
      ├── UserProfileRepository.ts          # (no balance repos — Q2 CONFIRMED)
      └── CacheMetadataRepository.ts
  src/services/
  └── SyncService.ts                        # Background flush + conflict resolution
  src/constants/
  └── cache.ts                              # CACHE_TTL object with all TTL constants
  ```
- **Service integration pattern:** Each `*Service.ts` currently returns mock data. Add a feature flag `USE_LOCAL_DB = true` to redirect calls through Repository instead. Example:
  ```typescript
  // tasksService.ts
  export async function fetchWorkerTasks(): Promise<Task[]> {
    if (USE_LOCAL_DB) {
      return taskRepository.getAll()  // Repository handles TTL check + API fallback
    }
    await delay(600)
    return MOCK_TASKS
  }
  ```
- **Zustand `user-preferences` key:** Already in use by `useUserPreferencesStore` with `persist` middleware. This stores ONLY `{ language, theme }`. Do NOT add token or auth data to this store.
- **Photo uploads:** The SyncQueue payload for `orderPhoto` must contain the `orderId` and a reference to the `File` blob. Since `File` cannot be serialized to JSON for IndexedDB, store the blob separately using `URL.createObjectURL()` and include the blob URL in the payload. **Alternative:** store the raw `ArrayBuffer` in IndexedDB directly (Dexie supports binary storage).
- **navigator.locks availability:** Available in Chrome 69+ and Safari 15.4+. Verify TMA WebView versions support this API. Fallback: use a module-level `let isSyncing = false` flag as a simpler alternative.
- **React Query integration:** The Repository layer is called from `*Service.ts` functions, which are the `queryFn` for React Query hooks. React Query's in-memory cache acts as the L1 cache (staleTime); Dexie IndexedDB acts as the L2 cache (CacheMetadata TTL).

---

*End of DAD. Version 1.0. Reviewed against: `tech-stack/`, `adr/`, `ba/`, `implemented/` artifacts.*  
*Validated with: `.agents/skills/SKILL_DATA_ARCH_DAD/scripts/validate_dad.sh`*
