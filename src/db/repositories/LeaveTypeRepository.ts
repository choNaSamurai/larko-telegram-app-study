/**
 * LeaveTypeRepository.ts
 * Source: DAD_Global_Data_Layer.md §4 (LocalLeaveType) + §8 (CACHE_TTL.LEAVE_TYPES)
 * Near-static catalog — 1 hour TTL. No mutations from client.
 */


import { db } from '../AppDB'
import { CachingRepository } from './BaseRepository'
import { CACHE_TTL } from '../../constants/cache'
import type { LocalLeaveType } from '../../types/db.entities'

export class LeaveTypeRepository extends CachingRepository<LocalLeaveType> {
  protected cacheKey = 'leave_types' as const
  protected ttl = CACHE_TTL.LEAVE_TYPES

  protected getTable(): any {
    return db.leave_types
  }

  /** Get a single leave type by id */
  async getByIdOrThrow(id: string): Promise<LocalLeaveType> {
    const record = await db.leave_types.get(id)
    if (!record) throw new Error(`LeaveType not found: ${id}`)
    return record
  }
}

export const leaveTypeRepository = new LeaveTypeRepository()
