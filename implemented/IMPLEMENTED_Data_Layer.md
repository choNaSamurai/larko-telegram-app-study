# IMPLEMENTED — Data Layer (Global)

**Screen / Module:** Global Data Layer — IndexedDB + Sync  
**Version:** 1.0  
**Date:** 2026-03-31  
**Status:** ✅ DONE  
**Traces to:** `dad/DAD_Global_Data_Layer.md` v1.1  
**Role:** TMA_Implementer  

---

## Summary

Implemented the offline-first data persistence layer for the Larko Telegram Mini App.
All code passes TypeScript type checking (`tsc --noEmit` — 0 errors).

---

## Files Created

```
src/constants/cache.ts                              ← CACHE_TTL constants registry
src/types/db.types.ts                               ← SyncQueueItem + CacheMetadata types
src/types/db.entities.ts                            ← All LocalTask, LocalOrder, etc.
src/types/profile.types.ts                          ← LocalUserProfile re-export
src/db/AppDB.ts                                     ← Dexie instance + v1 schema (9 tables)
src/db/migrations/README.md                         ← Migration guide placeholder
src/db/repositories/BaseRepository.ts              ← Abstract base + CachingRepository
src/db/repositories/TaskRepository.ts
src/db/repositories/OrderRepository.ts
src/db/repositories/TimeLogRepository.ts
src/db/repositories/OrderPhotoRepository.ts
src/db/repositories/LeaveRequestRepository.ts
src/db/repositories/LeaveTypeRepository.ts
src/db/repositories/UserProfileRepository.ts
src/db/repositories/CacheMetadataRepository.ts
src/db/repositories/SyncQueueRepository.ts
src/db/repositories/index.ts                        ← Barrel export
src/services/SyncService.ts                         ← Background sync + DEAD_LETTER
```

---

## Architecture Overview

```
UI (React) → React Query + Zustand
          → *Service.ts (mock today, Repository tomorrow)
          → Repository Layer (Dexie.js / IndexedDB)
          → SyncService (background, navigator.locks)
          → Backend REST API (/api/v1/*)
```

---

## Step Log

### Step 1 — package.json: Installed Dexie.js
- **Action:** `npm install dexie` (1 package added, 0 vulnerabilities)

### Step 2 — Constants: CACHE_TTL Registry
- **File:** `src/constants/cache.ts`
- **Content:** All 8 TTL constants in `N * 60 * 1000` format per DAD §8
- **Note:** Balance TTL documented but balance uses React Query only (Q2 CONFIRMED)

### Step 3 — Types: System DB Types
- **Files:** `src/types/db.types.ts`, `src/types/db.entities.ts`
- **Content:** `SyncQueueItem`, `CacheMetadata`, `MAX_SYNC_RETRIES = 5`, `getSyncRetryDelay()`
- **Content:** All `Local*` entity interfaces with system fields (`updatedAt`, `createdAt`, `isSynced`, `_localVersion`)
- **Validation:** All field types cross-referenced with typescript interfaces in `src/types/*.ts`

### Step 4 — DB: AppDB.ts (Dexie Schema v1)
- **File:** `src/db/AppDB.ts`
- **Schema:** 9 tables (intentionally excludes `balance_summaries` / `balance_history` per Q2)
- **Tables:** tasks, orders, time_log_entries, order_photos, leave_requests, leave_types, user_profiles, sync_queue, cache_metadata
- **DB Name:** `larko_app_db`
- **Corruption recovery:** `initDB()` catches open() failure → `Dexie.delete()` → re-initialize

### Step 5 — Repositories: BaseRepository + CachingRepository
- **File:** `src/db/repositories/BaseRepository.ts`
- **Interface:** `getAll()`, `getById()`, `save()`, `saveMany()`, `delete()`, `clearAll()`, `getPendingSync()`, `markSynced()`
- **CachingRepository:** adds `isCacheFresh()`, `markFetched()`, `invalidateCache()`
- **Type compatibility:** Used `AnyTable<T>` utility to resolve Dexie v4 `EntityTable` strict typing

### Step 6 — Repositories: All Entity Repositories
- **TaskRepository:** status filter, deadline sort, cache key `tasks_list`
- **OrderRepository:** dynamic per-order cache key, `updateStatus()`, `incrementPhotosToday()`, `decrementPhotosToday()`
- **TimeLogRepository:** `getByOrderId()`, `existsForDate()` (BR-TL-001 duplicate guard), `getAllPending()`
- **OrderPhotoRepository:** `getByOrderId()`, `replaceTempId()` (temp → server id on upload)
- **LeaveRequestRepository:** status filter, `getAllSorted()`
- **LeaveTypeRepository:** catalog with 1-hour TTL, `getByIdOrThrow()`
- **UserProfileRepository:** `getCurrent()` (single-row), `patchPreferences()`
- **CacheMetadataRepository:** `isFresh()`, `markFetched()`, `delete()`, `clearAll()`
- **SyncQueueRepository:** FIFO `getPending()`, `getDeadLetters()`, `recordFailure()`, `resetForRetry()`, `deduplicateByEntity()`

### Step 7 — SyncService
- **File:** `src/services/SyncService.ts`
- **Flush triggers:** `window.online` + `document.visibilitychange`
- **Lock:** `navigator.locks.request('larko_sync_lock', ...)` with module-level flag fallback
- **Entity routing:** time logs, order status, dispute, photos (multipart), leave requests, preferences
- **Error handling:**
  - `AuthExpiredError` → pauses queue, calls `SyncService.onAuthExpired?.()`
  - `DeadLetterError` → sets `retryCount = MAX_SYNC_RETRIES`, calls `SyncService.onDeadLetter?.()`
  - 5xx/timeout → retryable, `getSyncRetryDelay()` backoff
- **Photo upload:** separate multipart handler, `replaceTempId()` on success
- **DEAD_LETTER:** persists indefinitely (Q4 CONFIRMED), `retryDeadLetters()` for manual retry

### Step 8 — TypeScript Verification
- **Command:** `npx tsc --noEmit`
- **Result:** ✅ 0 errors, 0 warnings

---

## Confirmed Design Decisions Applied

| Decision | Applied |
|---------|---------|
| Q2: Balance in React Query only | ✅ No Dexie tables for balance; not in AppDB schema |
| Q3: Polling only | ✅ Documented in CACHE_TTL; React Query `refetchInterval` to be configured in hooks |
| Q4: DEAD_LETTER persists indefinitely | ✅ No auto-purge in SyncService or SyncQueueRepository |
| Q5: Single-device MVP | ✅ last-write-wins; `// TODO: Multi-device — Phase 2` in SyncService |

---

## Integration Notes for Next Developer

1. **Call `initDB()` once on app startup** — add to `main.tsx` before `ReactDOM.createRoot`
2. **Call `SyncService.registerListeners()` once on app startup** — add after `initDB()`
3. **Services are still using mocks** — replace `*Service.ts` function bodies to call Repository when real API arrives
4. **Photo blobs** — `SyncQueueRepository` stores `blobUrl` in payload; if app restarts between enqueue and sync, blob URL will be invalid → handled as `DeadLetterError`
5. **Balance hook** — add `refetchInterval: 60 * 1000, refetchIntervalInBackground: false` to `useQuery(['balance', period])`

---

*Verified against: `dad/DAD_Global_Data_Layer.md` v1.1, `tsc --noEmit` (0 errors)*
