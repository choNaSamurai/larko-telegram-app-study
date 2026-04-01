/**
 * UserProfileRepository.ts
 * Source: DAD_Global_Data_Layer.md §4 (LocalUserProfile) + §8 (CACHE_TTL.USER_PROFILE)
 * Single row expected per device.
 */


import { db } from '../AppDB'
import { CachingRepository } from './BaseRepository'
import { CACHE_TTL } from '../../constants/cache'
import type { LocalUserProfile } from '../../types/db.entities'

export class UserProfileRepository extends CachingRepository<LocalUserProfile> {
  protected cacheKey = 'user_profile' as const
  protected ttl = CACHE_TTL.USER_PROFILE

  protected getTable(): any {
    return db.user_profiles
  }

  /**
   * Get the current worker's profile.
   * Assumes single row per device. Returns null if not yet fetched.
   */
  async getCurrent(): Promise<LocalUserProfile | null> {
    const all = await db.user_profiles.toArray()
    return all[0] ?? null
  }

  /**
   * Patch language and/or theme preferences on the local profile.
   * Source: DAD §6 — Action: Worker updates user preferences
   */
  async patchPreferences(
    id: string,
    patch: Partial<Pick<LocalUserProfile, 'language' | 'theme'>>
  ): Promise<void> {
    const current = await db.user_profiles.get(id)
    if (current) {
      await db.user_profiles.update(id, {
        ...patch,
        isSynced: false,
        updatedAt: Date.now(),
        _localVersion: current._localVersion + 1,
      })
    }
  }
}

export const userProfileRepository = new UserProfileRepository()
