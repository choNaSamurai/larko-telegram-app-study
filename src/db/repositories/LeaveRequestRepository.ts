/**
 * LeaveRequestRepository.ts
 * Source: DAD_Global_Data_Layer.md §4 (LocalLeaveRequest) + §8 (CACHE_TTL.LEAVE_REQUESTS)
 */


import { db } from '../AppDB'
import { CachingRepository } from './BaseRepository'
import { CACHE_TTL } from '../../constants/cache'
import type { LocalLeaveRequest } from '../../types/db.entities'
import type { LeaveStatus } from '../../types/leave.types'

export class LeaveRequestRepository extends CachingRepository<LocalLeaveRequest> {
  protected cacheKey = 'leave_requests_list' as const
  protected ttl = CACHE_TTL.LEAVE_REQUESTS

  protected getTable(): any {
    return db.leave_requests
  }

  /** Get requests filtered by status */
  async getByStatus(status: LeaveStatus): Promise<LocalLeaveRequest[]> {
    return db.leave_requests.where('status').equals(status).toArray()
  }

  /** Get all requests sorted by startDate descending (most recent first) */
  async getAllSorted(): Promise<LocalLeaveRequest[]> {
    const all = await db.leave_requests.toArray()
    return all.sort((a, b) => b.startDate.localeCompare(a.startDate))
  }
}

export const leaveRequestRepository = new LeaveRequestRepository()
