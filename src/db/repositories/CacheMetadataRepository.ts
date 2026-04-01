/**
 * CacheMetadataRepository.ts
 * Source: DAD_Global_Data_Layer.md §4 (CacheMetadata) + §8 Caching Strategy
 * Manages TTL-based cache invalidation for all IndexedDB-backed entities.
 * Balance data does NOT appear here (Q2 CONFIRMED — React Query only).
 */

import { db } from '../AppDB'
import type { CacheMetadata } from '../../types/db.types'

export class CacheMetadataRepository {
  /**
   * Get metadata for a cache key. Returns null if key doesn't exist.
   */
  async get(key: string): Promise<CacheMetadata | null> {
    return (await db.cache_metadata.get(key)) ?? null
  }

  /**
   * Check if cache is still fresh.
   * Cache HIT: fetchedAt + ttl > Date.now()
   * Cache MISS: missing or expired
   */
  async isFresh(key: string): Promise<boolean> {
    const meta = await this.get(key)
    if (!meta) return false
    return meta.fetchedAt + meta.ttl > Date.now()
  }

  /**
   * Record a successful API fetch — updates or creates the CacheMetadata entry.
   * Source: DAD §8 Cache Read Logic step 3
   */
  async markFetched(key: string, ttl: number): Promise<void> {
    await db.cache_metadata.put({ key, fetchedAt: Date.now(), ttl })
  }

  /**
   * Invalidate a single cache entry.
   * Called on any local mutation. Source: DAD §8 Invalidation Triggers.
   */
  async delete(key: string): Promise<void> {
    await db.cache_metadata.delete(key)
  }

  /**
   * Force-invalidate ALL cache entries.
   * Called on explicit user refresh (pull-to-refresh) or long offline period.
   */
  async clearAll(): Promise<void> {
    await db.cache_metadata.clear()
  }

  /** Get all current cache entries (for debugging / status display) */
  async getAll(): Promise<CacheMetadata[]> {
    return db.cache_metadata.toArray()
  }
}

export const cacheMetadataRepository = new CacheMetadataRepository()
