/**
 * TimeLogRepository.ts
 * Source: DAD_Global_Data_Layer.md §4 (LocalTimeLogEntry) + §8 (CACHE_TTL.TIME_LOGS)
 */


import { db } from '../AppDB'
import { CachingRepository } from './BaseRepository'
import { CACHE_TTL } from '../../constants/cache'
import type { LocalTimeLogEntry } from '../../types/db.entities'

export class TimeLogRepository extends CachingRepository<LocalTimeLogEntry> {
  protected cacheKey = '' // Per-order — set via forOrder()
  protected ttl = CACHE_TTL.TIME_LOGS

  protected getTable(): any {
    return db.time_log_entries
  }

  /** Returns a new instance scoped to a specific orderId for cache operations */
  forOrder(orderId: string): TimeLogRepository {
    const repo = new TimeLogRepository()
    repo.cacheKey = `time_logs_order_${orderId}`
    return repo
  }

  /** Get all time logs for a specific order, sorted by logDate descending */
  async getByOrderId(orderId: string): Promise<LocalTimeLogEntry[]> {
    return db.time_log_entries
      .where('orderId')
      .equals(orderId)
      .sortBy('logDate')
      .then(entries => entries.reverse())
  }

  /** Check if a log already exists for a specific date on this order */
  async existsForDate(orderId: string, logDate: string): Promise<boolean> {
    const count = await db.time_log_entries
      .where({ orderId, logDate })
      .count()
    return count > 0
  }

  /** Get all pending entries across all orders (used by SyncService) */
  async getAllPending(): Promise<LocalTimeLogEntry[]> {
    return db.time_log_entries.where('isSynced').equals(0).toArray()
  }
}

export const timeLogRepository = new TimeLogRepository()
