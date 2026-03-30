# Technology Decision Quick Reference
# Data_Architect_TMA — SKILL_DATA_ARCH_DAD

## Decision Tree: Which Storage to Use?

```
Does the app need data to persist across sessions?
├── NO  → Use Zustand (in-memory only)
└── YES → Continue...
    │
    Does the app need structured entities (not just key-value)?
    ├── NO  → Use localStorage (simple flags only)
    └── YES → Continue...
        │
        Does the app have offline requirements or SyncQueue?
        ├── NO  and entity count ≤ 2  → Consider localStorage with JSON.parse
        └── YES → Use IndexedDB via Dexie.js ✅ (default for TMA)
```

## Storage Comparison Table

| Criterion | localStorage | IndexedDB (raw) | Dexie.js | idb | Zustand (memory) |
|-----------|:-----------:|:---------------:|:--------:|:---:|:----------------:|
| Async API | ❌ | ✅ | ✅ | ✅ | ✅ |
| Structured data | ❌ | ✅ | ✅ | ✅ | ✅ |
| Transactions | ❌ | ✅ | ✅ | ✅ | ❌ |
| Storage limit | ~5MB | 50MB+ | 50MB+ | 50MB+ | RAM only |
| Query/filtering | ❌ | ⚠️ manual | ✅ | ⚠️ | ✅ (in-memory) |
| DX / API quality | ✅ simple | ❌ verbose | ✅ | ✅ | ✅ |
| Bundle size | 0 KB | 0 KB | ~25KB | ~5KB | ~2KB |
| TMA WebView safe | ✅ | ✅ | ✅ | ✅ | ✅ |
| Persistence | ✅ | ✅ | ✅ | ✅ | ❌ |
| Offline support | ⚠️ | ✅ | ✅ | ✅ | ❌ |

**Default recommendation: Dexie.js** for any TMA with >1 entity type and offline support.

## Conflict Resolution Cheat Sheet

| Policy | When to use | Risk |
|--------|------------|------|
| `last-write-wins` (by updatedAt) | General CRUD apps, task management | Minor data loss if clocks are skewed |
| `server-priority` | Financial data, critical records, audit log | Discards valid offline work |
| `merge-fields` | Collaborative apps (multiple editors) | Complex, requires diff logic |

**MVP default: last-write-wins** — simple, predictable, easy to reason about.

## TTL Constants Reference

```typescript
// Paste into src/constants/cache.ts
export const CACHE_TTL = {
  USER_PROFILE:    30 * 60 * 1000,  // 30 minutes
  TASK_LIST:        5 * 60 * 1000,  // 5 minutes
  ORDER_LIST:       5 * 60 * 1000,  // 5 minutes
  TIME_LOGS:       10 * 60 * 1000,  // 10 minutes
  STATIC_CATALOG:  60 * 60 * 1000,  // 1 hour
} as const
```

## SyncService Trigger Events

```typescript
// Flush SyncQueue on:
window.addEventListener('online', () => syncService.flush())
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') syncService.flush()
})
// Also: app init (after auth)
```

## Dexie.js Schema Quick Start

```typescript
import Dexie, { type Table } from 'dexie'

// Replace [app_name] with your project name, e.g., 'larko'
const DB_NAME = '[app_name]_db'

class AppDB extends Dexie {
  entities!: Table<EntityType>
  syncQueue!: Table<SyncQueueItem>
  cacheMetadata!: Table<CacheMetadata>

  constructor() {
    super(DB_NAME)
    this.version(1).stores({
      entities:      '++id, updatedAt, isSynced, status',
      syncQueue:     '++id, entityType, createdAt, retryCount',
      cacheMetadata: 'key',
    })
  }
}

export const db = new AppDB()
```
