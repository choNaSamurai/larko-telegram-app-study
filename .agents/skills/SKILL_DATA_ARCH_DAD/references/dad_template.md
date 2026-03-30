# DAD — Data Architecture Document
# [PROJECT / SCOPE NAME]

**Version:** 1.0  
**Date:** [YYYY-MM-DD]  
**Author:** Data_Architect_TMA  
**Status:** DRAFT  
**Traces to:** `ba/[BRD_FILE].md`, `adr/ADR_SCREEN_[NAME].md`, `tech-stack/TECH_STACK_SCREEN_[NAME].md`, `implemented/IMPLEMENTED_SCREEN_[NAME].md`

---

## 1. Overview

### Meta
- **Goal:** Describe how the app stores, syncs, and caches data locally on the client.
- **Platform:** Telegram Mini App (browser environment — no native SQLite)
- **Scope:** Client-side storage + sync with backend REST API

### In Scope
- Local storage technology selection
- Data model (entities + relationships)
- Sync strategy (write path, conflict resolution, retry)
- Caching rules (TTL, invalidation)
- Repository layer interface
- Edge cases (first launch, migration, offline)

### Out of Scope
- Backend database schema
- Server-side sync logic
- UI components
- Authentication flow

---

## 2. Constraints & Context

| Constraint | Detail |
|-----------|--------|
| **Platform** | Telegram Mini App (WebView — Chrome/Safari engine) |
| **No native SQLite** | Must use browser storage APIs only |
| **Storage quota** | ~50MB+ for IndexedDB; ~5MB for localStorage |
| **Offline possible** | Network may be unstable or absent |
| **No Service Worker** | TMA WebView does not reliably support SW registration |
| **No background sync API** | Must trigger sync on app focus events |
| **Security** | Sensitive tokens must NOT be persisted to disk |

---

## 3. Technology Decision

### Selected Technology: [e.g., IndexedDB via Dexie.js]

**Why:**
- Async API — does not block the main thread
- Supports structured data, transactions, and complex queries
- Handles large data volumes (50MB+) reliably
- Dexie.js provides a clean, promise-based API over raw IndexedDB

### Alternatives Considered

| Option | Verdict | Reason for Rejection |
|--------|---------|---------------------|
| `localStorage` | ❌ Rejected | Sync API, string-only, 5MB limit — unsuitable for structured entities |
| `IndexedDB (raw)` | ⚠️ Possible | Verbose API, error-prone — Dexie.js is a better DX wrapper |
| `idb` library | ⚠️ Possible | Lighter than Dexie.js, but less feature-rich (no query helpers) |
| In-memory (Zustand only) | ❌ Rejected | No persistence across sessions — data lost on app close |
| SQLite (via WASM) | ❌ Rejected | Overkill for TMA, significant bundle size increase |

---

## 4. Data Model

> All field types MUST be validated against `tech-stack/TECH_STACK_SCREEN_*.md` TypeScript interfaces.
> Annotate with source reference.

### Entity: [EntityName]
```typescript
// Source: TECH_STACK_SCREEN_[Name].md — §TypeScript Interfaces
interface [EntityName] {
  id: string                  // UUID — generated client-side on creation
  // --- business fields ---
  field1: string
  field2: number
  status: '[status1]' | '[status2]'  // from Scenario §X.X
  // --- system fields ---
  updatedAt: number            // Unix timestamp (ms) — used for conflict resolution
  createdAt: number            // Unix timestamp (ms)
  isSynced: boolean            // false = pending background sync
  _localVersion: number        // incremented on every local mutation
}
```

### Entity: SyncQueue (REQUIRED — always present)
```typescript
interface SyncQueueItem {
  id: string                   // UUID
  entityType: '[Entity1]' | '[Entity2]'   // all mutable entity types
  action: 'create' | 'update' | 'delete'
  payload: Record<string, unknown>        // serialized mutation data
  retryCount: number           // starts at 0; max retries: 5
  createdAt: number            // Unix timestamp (ms)
  lastAttemptAt: number | null
  error: string | null         // last error message if sync failed
}
```

### Entity: CacheMetadata (REQUIRED — cache TTL tracking)
```typescript
interface CacheMetadata {
  key: string                  // e.g., 'tasks_list', 'user_profile'
  fetchedAt: number            // Unix timestamp (ms) of last API fetch
  ttl: number                  // TTL in milliseconds
}
```

### Entity Relationships

```
[EntityA] 1 ────── N [EntityB]
[EntityA] 1 ────── 1 [EntityC]
```

---

## 5. Storage Structure

```
DB Name: [app_name]_db
DB Version: 1

Tables:
  ├── [entity1_plural]       PK: id
  │     indexes: updatedAt, isSynced, status
  ├── [entity2_plural]       PK: id
  │     indexes: updatedAt, isSynced, [foreignKey]
  ├── sync_queue             PK: id
  │     indexes: entityType, createdAt, retryCount
  └── cache_metadata         PK: key
```

---

## 6. Data Flow

> Document the exact write path for EVERY user action that mutates data.

### Action: [User creates a new X]

```
1. User submits form
2. Client-side validation (required fields, format)
3. Generate id = uuid(), set createdAt = Date.now(), isSynced = false
4. Write entity to local DB (IndexedDB via Dexie.js)
5. Push SyncQueueItem { entityType: '[X]', action: 'create', payload: entity }
6. UI updates immediately (optimistic — no waiting for API)
7. SyncService (background) detects new SyncQueue entry:
   a. POST /api/[entities] with payload
   b. On 2xx: mark entity.isSynced = true, remove from SyncQueue
   c. On error: increment retryCount, schedule retry with backoff
```

### Action: [User updates X]

```
1. User changes field
2. Update entity in local DB (isSynced = false, updatedAt = Date.now())
3. Push SyncQueueItem { action: 'update', payload: { id, ...changedFields } }
4. UI reflects change immediately
5. SyncService: PATCH /api/[entities]/:id
```

### Action: [User deletes X]

```
1. User confirms deletion
2. Soft-delete: set entity.deletedAt = Date.now() (or hard-delete from table)
3. Push SyncQueueItem { action: 'delete', payload: { id } }
4. UI removes item immediately
5. SyncService: DELETE /api/[entities]/:id
```

---

## 7. Sync Strategy

### Type: Optimistic UI + Background Sync

**Write trigger:** User action → immediately writes to local DB → SyncQueue entry added  
**Flush trigger:** `window.addEventListener('online', ...)` + `document.addEventListener('visibilitychange', ...)` (app comes to foreground)

### Conflict Resolution Policy

**Selected:** `last-write-wins` by `updatedAt` timestamp

```
If localEntity.updatedAt > serverEntity.updatedAt → local wins, overwrite server
If serverEntity.updatedAt > localEntity.updatedAt → server wins, overwrite local
```

**Rejected alternatives:**
- `server-priority`: Too aggressive — discards valid offline work without user awareness
- `merge-fields`: Requires complex field-level diff logic — overkill for MVP

### Retry Strategy

```
retryCount:   0 → wait 1s
retryCount:   1 → wait 2s
retryCount:   2 → wait 4s
retryCount:   3 → wait 8s
retryCount:   4 → wait 16s
retryCount: ≥ 5 → mark DEAD_LETTER, stop retrying, show error notification
```

Formula: `Math.min(2^retryCount * 1000, 32000)` ms

### SyncService Lock (race condition prevention)

```javascript
// Prevents concurrent SyncService runs
navigator.locks.request('sync_service_lock', async () => {
  await flushSyncQueue()
})
```

---

## 8. Caching Strategy

### Cache Read Logic (applied in Repository.getAll())

```
1. Read CacheMetadata for key
2. If fetchedAt + ttl > Date.now() → return local DB data (cache HIT)
3. If stale or no metadata → fetch from API → write to DB → update CacheMetadata (cache MISS)
```

### TTL per Entity

| Entity | Cache Key | TTL | Invalidation Trigger |
|--------|-----------|-----|---------------------|
| `[Entity1]` | `entity1_list` | `5 * 60 * 1000` (5 min) | On any mutation of Entity1 |
| `[Entity2]` | `entity2_list` | `10 * 60 * 1000` (10 min) | On any mutation of Entity2 |
| User profile | `user_profile` | `30 * 60 * 1000` (30 min) | On profile update |

### Invalidation Triggers

- **On mutation**: `cacheMetadataRepo.delete(key)` immediately after write to SyncQueue
- **On TTL expiry**: Detected in `Repository.getAll()` check — triggers background refresh
- **On explicit refresh**: User pull-to-refresh → force-invalidate all keys → refetch

---

## 9. Data Layer Architecture

```
┌──────────────────────────────────────────┐
│           UI Components (React)          │
└─────────────────┬────────────────────────┘
                  │ useQuery / useMutation
┌─────────────────▼────────────────────────┐
│      Hooks + React Query Cache           │
│  (staleTime, gcTime, queryKey)           │
└─────────────────┬────────────────────────┘
                  │ calls
┌─────────────────▼────────────────────────┐
│         Repository Layer                 │
│  [Entity]Repository interface            │
│  - getAll(), getById(), save(), delete() │
│  - getPendingSync(), markSynced()        │
└──────┬──────────────────────┬────────────┘
       │ reads/writes         │ syncs
┌──────▼──────────┐  ┌────────▼───────────┐
│  Local DB       │  │   Sync Service     │
│  (Dexie.js)     │  │   (background)     │
│  IndexedDB      │  │   SyncQueue flush  │
└─────────────────┘  └────────┬───────────┘
                              │ HTTP
                    ┌─────────▼──────────┐
                    │   Backend REST API  │
                    └────────────────────┘
```

### Repository Interface (to be implemented)

```typescript
interface [Entity]Repository {
  getAll(filter?: Partial<[Entity]>): Promise<[Entity][]>
  getById(id: string): Promise<[Entity] | null>
  save(entity: [Entity]): Promise<void>         // upsert
  delete(id: string): Promise<void>
  getPendingSync(): Promise<SyncQueueItem[]>
  markSynced(id: string): Promise<void>
  clearAll(): Promise<void>                     // for DB reset
}
```

---

## 10. Offline Behavior

| Scenario | Behavior |
|----------|---------|
| **Read while offline** | Return local DB data (from cache); show "Offline — showing cached data" banner |
| **Write while offline** | Write to local DB → SyncQueue → UI updates optimistically; no error shown |
| **App comes online** | Trigger SyncService.flush() → process SyncQueue in order of `createdAt` |
| **Offline at first launch** | DB is empty → show empty state + "No connection" error banner |
| **Long offline period** | Cache may be heavily stale — on reconnect, force-invalidate all CacheMetadata + refetch |

---

## 11. Migrations

### Strategy: Dexie.js versioned upgrades

```typescript
const db = new Dexie('larko_app_db')

// Version 1 — initial schema
db.version(1).stores({
  [entity1_plural]: '++id, updatedAt, isSynced',
  sync_queue: '++id, entityType, createdAt',
  cache_metadata: 'key',
})

// Version 2 — add new field to entity
db.version(2).stores({
  [entity1_plural]: '++id, updatedAt, isSynced, newField',
}).upgrade(tx => {
  return tx.[entity1_plural].toCollection().modify(record => {
    record.newField = 'default_value'
  })
})
```

### Rules
- Each schema change increments DB version
- `.upgrade()` callback provides data migration
- Old version data is preserved unless explicitly migrated
- Migration scripts are stored in `src/db/migrations/v[N].ts`

---

## 12. Error Handling

> Runtime errors only. Lifecycle scenarios (first launch, upgrade) belong in §14 Edge Cases.

| Error Type | Handling Strategy |
|-----------|------------------|
| **DB open failure** | Catch Dexie `open()` error → log → attempt `Dexie.delete(dbName)` → re-init |
| **Write failure** | Retry up to 3 times → fallback to in-memory → show toast |
| **Sync HTTP error (4xx)** | Log, mark SyncQueue item with error, do NOT retry (client error — will not resolve itself) |
| **Sync HTTP error (5xx)** | Retry with exponential backoff (up to 5 attempts) |
| **Network timeout** | Treat as 5xx — add to retry queue |
| **DEAD_LETTER item** | Show persistent notification with "Retry" button |
| **Quota exceeded** | Detect `QuotaExceededError` → prompt user to clear cache |

---

## 13. Security

### ❌ NEVER store in IndexedDB or localStorage

- JWT access tokens → keep in **memory only** (Zustand store, not persisted)
- Refresh tokens → use Telegram `initData` for re-authentication
- Payment card numbers, CVV, PINs
- Raw password hashes or salts

### ✅ Safe to store locally

- Task records, time logs, orders (business entities)
- User display name, avatar URL, preferences
- SyncQueue payloads (must not contain raw credentials)
- Cache timestamps (CacheMetadata)

### Token Handling on Sync Error

If API returns `401 Unauthorized` during SyncService flush:
1. Pause SyncQueue processing
2. Trigger re-authentication flow (Telegram.WebApp.initData refresh)
3. On success: resume SyncQueue from last position
4. On failure: clear SyncQueue, redirect to login

---

## 14. Edge Cases

> Lifecycle scenarios only. Runtime errors belong in §12 Error Handling.

| Edge Case | Behavior |
|-----------|---------|
| **First launch (empty DB)** | Skip cache read → fetch from API → populate DB → set `CacheMetadata.fetchedAt` |
| **DB corruption / open error** | Catch error → `Dexie.delete('[app_name]_db')` → re-initialize with version 1 → notify user |
| **Schema version upgrade** | Run `.upgrade()` migration in versioned Dexie schema block |
| **Offline at first launch** | Show empty state with "No connection" banner — do NOT throw or crash |
| **SyncQueue DEAD_LETTER** | Show sticky toast: "X changes failed to sync" + "Retry" button |
| **Duplicate SyncQueue entries** | SyncService deduplicates by `entityType + id` before flush |
| **Token expiry during sync** | Pause sync → re-auth → resume → do NOT discard queue |
| **App upgrade clears WebView cache** | Re-fetch all data gracefully on first open post-upgrade |
| **User clears browser data** | Same as first launch — DB is empty, fetch from API |
| **Multiple tabs / windows** | SyncService uses `navigator.locks.request` to prevent parallel flushes |

---

## 15. Open Questions

| # | Question | Impact | Status |
|---|---------|--------|--------|
| Q1 | [Question text] | [BLOCKING / NON-BLOCKING] | ❓ Open |
| Q2 | [Question text] | [NON-BLOCKING] | ❓ Open |

---

## 16. Developer Notes

> This section is for the **implementer**. It contains fallback assumptions for all [BLOCKING] Open Questions, plus any integration hints that are not obvious from the architecture.

### Fallback Assumptions

> **Fallback assumptions for [BLOCKING] items (these are ASSUMPTIONS, not confirmed decisions):**

- Q[N] fallback: [default behavior the implementer should use]. **Override when confirmed by [stakeholder/team].**

### Integration Notes

- DB name to use: `[app_name]_db` (replace `[app_name]` with project-specific value, e.g., `larko`)
- DB version at time of writing: `1`
- Next migration will be version `2` — do not skip version numbers
- [Any other non-obvious integration details for the implementer]

---

*End of DAD. Version 1.0. Reviewed against: `tech-stack/`, `adr/`, `ba/`, `implemented/` artifacts.*
*Validated with: `.agents/skills/SKILL_DATA_ARCH_DAD/scripts/validate_dad.sh`*
