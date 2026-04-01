/**
 * cache.ts
 * Central registry of all Cache TTL constants.
 * Source: DAD_Global_Data_Layer.md §8 Caching Strategy
 *
 * RULE: All TTL values MUST be expressed as N * 60 * 1000 (milliseconds).
 * NEVER use magic numbers inline in Repository code.
 */

export const CACHE_TTL = {
  /** Task list — refreshed every 5min */
  TASKS_LIST: 5 * 60 * 1000,

  /** Single order detail — refreshed every 5min */
  ORDER_DETAIL: 5 * 60 * 1000,

  /** Time logs per order — refreshed every 5min */
  TIME_LOGS: 5 * 60 * 1000,

  /**
   * Balance data — managed by React Query staleTime only.
   * NOT stored in IndexedDB CacheMetadata (Q2 CONFIRMED).
   * refetchInterval: 60 * 1000 with refetchIntervalInBackground: false
   */
  BALANCE: 5 * 60 * 1000,

  /** Leave requests list — fresher TTL due to status polling */
  LEAVE_REQUESTS: 2 * 60 * 1000,

  /** Leave calendar dots (per YYYY-MM) */
  LEAVE_CALENDAR: 5 * 60 * 1000,

  /** Leave types catalog — near-static */
  LEAVE_TYPES: 60 * 60 * 1000,

  /** User profile */
  USER_PROFILE: 10 * 60 * 1000,
} as const

export type CacheKey =
  | 'tasks_list'
  | `order_detail_${string}`
  | `time_logs_order_${string}`
  | `leave_requests_list`
  | `leave_calendar_${string}`
  | 'leave_types'
  | 'user_profile'
