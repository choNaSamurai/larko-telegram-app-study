/**
 * BaseRepository.ts
 * Abstract base class implementing the Repository interface contract from DAD §9.
 * All entity repositories extend this class.
 * Source: DAD_Global_Data_Layer.md §9 Repository Interface
 *
 * Note on Dexie v4 types: EntityTable uses strict IDType generics.
 * We cast to 'any' at the DB access point to maintain practical usability
 * while keeping the public API fully typed.
 */

import type { CacheMetadata } from '../../types/db.types'
import { db } from '../AppDB'

/** Minimal system fields required on all local entities */
export interface SystemFields {
  id: string
  updatedAt: number
  createdAt: number
  isSynced: boolean
  _localVersion: number
}

// Utility type for Dexie table operations — avoids IDType strictness in v4
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable<T> = { get(id: string): Promise<T | undefined>; put(entity: T): Promise<any>; delete(id: string): Promise<void>; clear(): Promise<void>; toArray(): Promise<T[]>; where(key: string): any; orderBy(key: string): any; update(id: string, changes: object): Promise<any>; bulkPut(entities: T[]): Promise<any>; bulkDelete(ids: string[]): Promise<any> }

/**
 * BaseRepository — provides getAll, getById, save (upsert), delete, clearAll.
 * Subclasses specify the Dexie table via getTable().
 */
export abstract class BaseRepository<T extends SystemFields> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected abstract getTable(): AnyTable<T>

  /** Get all entities */
  async getAll(): Promise<T[]> {
    return this.getTable().toArray()
  }

  async getById(id: string): Promise<T | null> {
    return (await this.getTable().get(id)) ?? null
  }

  /** Upsert: insert or replace by id */
  async save(entity: T): Promise<void> {
    await this.getTable().put(entity)
  }

  /** Bulk upsert — used when syncing a full API response */
  async saveMany(entities: T[]): Promise<void> {
    await this.getTable().bulkPut(entities)
  }

  async delete(id: string): Promise<void> {
    await this.getTable().delete(id)
  }

  async clearAll(): Promise<void> {
    await this.getTable().clear()
  }

  /** Returns all entities pending background sync (isSynced === false) */
  async getPendingSync(): Promise<T[]> {
    return this.getTable().where('isSynced').equals(0).toArray()
  }

  /** Marks an entity as synced with the server */
  async markSynced(id: string): Promise<void> {
    await this.getTable().update(id, { isSynced: true })
  }
}

/**
 * CachingRepository — extends BaseRepository with TTL-based cache invalidation.
 * Implements cache READ logic from DAD §8.
 */
export abstract class CachingRepository<T extends SystemFields> extends BaseRepository<T> {
  protected abstract cacheKey: string
  protected abstract ttl: number

  /** Returns true if the cache is still fresh */
  async isCacheFresh(): Promise<boolean> {
    const meta = await db.cache_metadata.get(this.cacheKey as 'key')
    if (!meta) return false
    return meta.fetchedAt + meta.ttl > Date.now()
  }

  /** Records a successful API fetch in CacheMetadata */
  async markFetched(): Promise<void> {
    const entry: CacheMetadata = {
      key: this.cacheKey,
      fetchedAt: Date.now(),
      ttl: this.ttl,
    }
    await db.cache_metadata.put(entry)
  }

  /** Invalidates the cache — next read will trigger API fetch */
  async invalidateCache(): Promise<void> {
    await db.cache_metadata.delete(this.cacheKey as 'key')
  }
}
