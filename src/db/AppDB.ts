/**
 * AppDB.ts
 * Dexie.js database instance and schema declaration.
 * Source: DAD_Global_Data_Layer.md §5 Storage Structure + §11 Migrations
 *
 * DB Name: larko_app_db
 * DB Version: 1 (initial schema)
 *
 * IMPORTANT: balance_summaries and balance_history are intentionally OMITTED.
 * Balance data uses React Query in-memory cache only (Q2 CONFIRMED).
 *
 * TODO: Multi-device conflict resolution — Phase 2
 */

import Dexie, { type EntityTable } from 'dexie'
import type {
  LocalTask,
  LocalOrder,
  LocalTimeLogEntry,
  LocalOrderPhoto,
  LocalLeaveRequest,
  LocalLeaveType,
  LocalUserProfile,
} from '../types/db.entities'
import type { SyncQueueItem, CacheMetadata } from '../types/db.types'

export class LarkoAppDB extends Dexie {
  // Business entity tables
  tasks!: EntityTable<LocalTask, 'id'>
  orders!: EntityTable<LocalOrder, 'id'>
  time_log_entries!: EntityTable<LocalTimeLogEntry, 'id'>
  order_photos!: EntityTable<LocalOrderPhoto, 'id'>
  leave_requests!: EntityTable<LocalLeaveRequest, 'id'>
  leave_types!: EntityTable<LocalLeaveType, 'id'>
  user_profiles!: EntityTable<LocalUserProfile, 'id'>

  // System tables
  sync_queue!: EntityTable<SyncQueueItem, 'id'>
  cache_metadata!: EntityTable<CacheMetadata, 'key'>

  constructor() {
    super('larko_app_db')

    /**
     * Version 1 — Initial schema.
     * Note: do NOT add balance_summaries or balance_history tables here.
     * They are managed by React Query only (DAD Q2 CONFIRMED).
     */
    this.version(1).stores({
      tasks:            'id, updatedAt, isSynced, status',
      orders:           'id, updatedAt, isSynced, status',
      time_log_entries: 'id, orderId, logDate, isSynced, updatedAt',
      order_photos:     'id, orderId, isSynced, updatedAt',
      leave_requests:   'id, status, isSynced, updatedAt',
      leave_types:      'id',
      user_profiles:    'id',
      sync_queue:       'id, entityType, createdAt, retryCount',
      cache_metadata:   'key',
    })
  }
}

/** Singleton DB instance — import this everywhere */
export const db = new LarkoAppDB()

/**
 * Opens DB and handles corruption gracefully.
 * Call once on app startup (e.g. in main.tsx or App.tsx).
 * Source: DAD §12 Error Handling + §14 Edge Cases
 */
export async function initDB(): Promise<void> {
  try {
    await db.open()
  } catch (error) {
    console.error('[LarkoAppDB] Failed to open database. Attempting reset.', error)
    try {
      await Dexie.delete('larko_app_db')
      await db.open()
      console.info('[LarkoAppDB] Database reset and re-initialized successfully.')
    } catch (resetError) {
      console.error('[LarkoAppDB] Database reset failed. App may be unstable.', resetError)
    }
  }
}
