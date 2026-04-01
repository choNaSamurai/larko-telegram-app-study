/**
 * SyncQueueRepository.ts
 * Source: DAD_Global_Data_Layer.md §4 (SyncQueueItem) + §7 Sync Strategy
 * Manages the SyncQueue — the outbox for all offline mutations.
 */

import { db } from '../AppDB'
import type { SyncQueueItem, SyncEntityType } from '../../types/db.types'
import { MAX_SYNC_RETRIES } from '../../types/db.types'

export class SyncQueueRepository {
  /** Add a new item to the SyncQueue (outbox) */
  async enqueue(item: SyncQueueItem): Promise<void> {
    await db.sync_queue.put(item)
  }

  /**
   * Get all items pending flush, ordered by createdAt (FIFO).
   * Excludes DEAD_LETTER items (retryCount >= MAX_SYNC_RETRIES).
   * Source: DAD §7 — processes SyncQueue in createdAt order (oldest first)
   */
  async getPending(): Promise<SyncQueueItem[]> {
    return db.sync_queue
      .where('retryCount')
      .below(MAX_SYNC_RETRIES)
      .sortBy('createdAt')
  }

  /** Get all DEAD_LETTER items (retryCount >= MAX_SYNC_RETRIES) */
  async getDeadLetters(): Promise<SyncQueueItem[]> {
    return db.sync_queue
      .where('retryCount')
      .aboveOrEqual(MAX_SYNC_RETRIES)
      .toArray()
  }

  /** Count DEAD_LETTER items (for notification badge) */
  async countDeadLetters(): Promise<number> {
    return db.sync_queue
      .where('retryCount')
      .aboveOrEqual(MAX_SYNC_RETRIES)
      .count()
  }

  /** Increment retryCount and record last error */
  async recordFailure(id: string, error: string): Promise<void> {
    const item = await db.sync_queue.get(id)
    if (item) {
      await db.sync_queue.update(id, {
        retryCount: item.retryCount + 1,
        lastAttemptAt: Date.now(),
        error,
      })
    }
  }

  /** Remove item from queue after successful sync */
  async remove(id: string): Promise<void> {
    await db.sync_queue.delete(id)
  }

  /**
   * Reset retryCount to 0 on a DEAD_LETTER item — allows manual retry.
   * Source: DAD §12 — "Повторити" button resets retryCount = 0
   */
  async resetForRetry(id: string): Promise<void> {
    await db.sync_queue.update(id, {
      retryCount: 0,
      error: null,
      lastAttemptAt: null,
    })
  }

  /** Reset ALL dead letters for bulk retry */
  async resetAllDeadLetters(): Promise<void> {
    const deadLetters = await this.getDeadLetters()
    await Promise.all(deadLetters.map(item => this.resetForRetry(item.id)))
  }

  /**
   * Deduplicate SyncQueue — keeps only the most recent entry per entity.
   * Source: DAD §14 Edge Cases — "Duplicate SyncQueue entries"
   */
  async deduplicateByEntity(entityType: SyncEntityType, entityId: string): Promise<void> {
    const items = await db.sync_queue
      .where('entityType')
      .equals(entityType)
      .filter(item => (item.payload as { id?: string }).id === entityId)
      .sortBy('createdAt')

    // Keep only the last one (most recent), remove older duplicates
    if (items.length > 1) {
      const toRemove = items.slice(0, items.length - 1)
      await db.sync_queue.bulkDelete(toRemove.map(i => i.id))
    }
  }

  /** Clear entire queue (used on re-auth failure) */
  async clearAll(): Promise<void> {
    await db.sync_queue.clear()
  }
}

export const syncQueueRepository = new SyncQueueRepository()
