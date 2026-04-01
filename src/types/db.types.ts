/**
 * db.types.ts
 * System entity types for the data layer: SyncQueue and CacheMetadata.
 * Source: DAD_Global_Data_Layer.md §4 Data Model
 */

/** Mutable entity types that can appear in the SyncQueue */
export type SyncEntityType =
  | 'task'
  | 'order'
  | 'timeLogEntry'
  | 'orderPhoto'
  | 'leaveRequest'
  | 'userProfile'

/** Actions that can be queued for background sync */
export type SyncAction = 'create' | 'update' | 'delete'

/**
 * SyncQueueItem — represents a pending mutation awaiting background sync.
 * DEAD_LETTER: retryCount >= 5. Items persist indefinitely (Q4 CONFIRMED).
 * Source: DAD §4 — Entity: SyncQueue
 */
export interface SyncQueueItem {
  id: string                          // UUID generated client-side
  entityType: SyncEntityType
  action: SyncAction
  payload: Record<string, unknown>    // serialized mutation data — NO credentials
  retryCount: number                  // starts at 0; DEAD_LETTER at >= 5
  createdAt: number                   // Unix timestamp (ms) — FIFO flush order
  lastAttemptAt: number | null        // timestamp of last sync attempt
  error: string | null                // last error message if sync failed
}

/**
 * CacheMetadata — TTL tracking for IndexedDB-backed entity caches.
 * Balance data does NOT appear here (React Query only, Q2 CONFIRMED).
 * Source: DAD §4 — Entity: CacheMetadata
 */
export interface CacheMetadata {
  key: string         // e.g. 'tasks_list', 'order_detail_abc123', 'leave_requests_list'
  fetchedAt: number   // Unix timestamp (ms) of last successful API fetch
  ttl: number         // TTL in milliseconds — from CACHE_TTL constant
}

/** Maximum retry count before an item becomes DEAD_LETTER */
export const MAX_SYNC_RETRIES = 5

/** Exponential backoff delay in ms for sync retries */
export function getSyncRetryDelay(retryCount: number): number {
  return Math.min(Math.pow(2, retryCount) * 1000, 32000)
}
