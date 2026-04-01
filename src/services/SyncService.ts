/**
 * SyncService.ts
 * Background sync orchestrator for the offline-first data layer.
 * Source: DAD_Global_Data_Layer.md §7 Sync Strategy + §12 Error Handling + §14 Edge Cases
 *
 * Flush triggers:
 *   1. window.addEventListener('online', ...)  — device reconnects
 *   2. document.addEventListener('visibilitychange', ...) — app comes to foreground
 *
 * Conflict Resolution: last-write-wins by updatedAt (§7)
 *   Exception: Time logs — 409 → DEAD_LETTER (immutable per BRD BR-TL-001)
 *   Exception: Photos — no conflict (server-assigned IDs)
 *   Exception: Preferences — server-priority after login
 *
 * DEAD_LETTER: retryCount >= 5 — persists indefinitely (Q4 CONFIRMED)
 * Single-device per worker — no multi-device guards for MVP (Q5 CONFIRMED)
 * TODO: Multi-device conflict resolution — Phase 2
 */

import { syncQueueRepository } from '../db/repositories/SyncQueueRepository'
import { orderPhotoRepository } from '../db/repositories/OrderPhotoRepository'
import { getSyncRetryDelay, MAX_SYNC_RETRIES } from '../types/db.types'
import type { SyncQueueItem } from '../types/db.types'
import { ACTIVE_BASE_URL, ACTIVE_API_KEY } from '../constants/apiConstants'
import { getAuthState } from '../stores/authStore'

// ─── Module-level sync lock fallback ──────────────────────────────────────────
// navigator.locks is available in Chrome 69+ and Safari 15.4+
// Fallback for older WebView versions: module-level flag.
let _isSyncing = false

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function apiRequest(
  method: string,
  path: string,
  body?: unknown
): Promise<Response> {
  const { accessToken } = getAuthState()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': ACTIVE_API_KEY,
  }
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  return fetch(`${ACTIVE_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * Process a single SyncQueueItem against the API.
 * Returns true on success, false on retryable error, throws on non-retryable.
 */
async function processSyncItem(item: SyncQueueItem): Promise<boolean> {
  const { entityType, action, payload } = item

  let response: Response

  try {
    switch (entityType) {
      case 'timeLogEntry': {
        if (action === 'create') {
          const { orderId, ...logPayload } = payload as Record<string, unknown>
          response = await apiRequest('POST', `/orders/${orderId}/time-logs`, logPayload)
        } else {
          // Time logs are immutable once created (BRD BR-TL-001)
          throw new Error('Time log update/delete not supported')
        }
        break
      }

      case 'order': {
        if (action === 'update') {
          const { id, ...updatePayload } = payload as Record<string, unknown>
          if ('disputeAction' in updatePayload) {
            response = await apiRequest('POST', `/orders/${id}/dispute/response`, updatePayload)
          } else {
            response = await apiRequest('PATCH', `/orders/${id}/status`, updatePayload)
          }
        } else {
          throw new Error(`Order action ${action} not supported`)
        }
        break
      }

      case 'orderPhoto': {
        if (action === 'create') {
          // Photo upload is handled separately (multipart — not JSON)
          // SyncService delegates to a dedicated photo upload handler
          return await syncPhotoUpload(item)
        } else if (action === 'delete') {
          const { orderId, photoId } = payload as { orderId: string; photoId: string }
          response = await apiRequest('DELETE', `/orders/${orderId}/photos/${photoId}`)
          // 404 = already deleted = idempotent success
          if (response.status === 404) return true
        } else {
          throw new Error(`OrderPhoto action ${action} not supported`)
        }
        break
      }

      case 'leaveRequest': {
        if (action === 'create') {
          response = await apiRequest('POST', '/leave-requests', payload)
        } else {
          throw new Error(`LeaveRequest action ${action} not supported for MVP`)
        }
        break
      }

      case 'userProfile': {
        if (action === 'update') {
          response = await apiRequest('PATCH', '/users/me', payload)
          // Preferences failures are silent — do not DEAD_LETTER
          if (!response.ok) return false
          return true
        } else {
          throw new Error(`UserProfile action ${action} not supported`)
        }
        break
      }

      case 'task': {
        // Tasks are read-only from worker perspective in MVP
        throw new Error('Task mutations not supported in MVP worker app')
      }

      default: {
        throw new Error(`Unknown entityType: ${entityType}`)
      }
    }
  } catch (networkError) {
    // Network error = treat as 5xx / timeout → retryable
    throw networkError
  }

  // Handle HTTP response codes
  if (response.ok) {
    // 2xx success
    if (entityType === 'timeLogEntry' && action === 'create') {
      // Update CacheMetadata to trigger fresh fetch (handled by service layer)
    }
    return true
  }

  if (response.status === 401) {
    // Token expired — throw special error to pause queue and re-auth
    throw new AuthExpiredError('HTTP 401 — token expired during sync')
  }

  if (response.status === 409 && entityType === 'timeLogEntry') {
    // Duplicate time log — DEAD_LETTER immediately (BRD BR-TL-001)
    throw new DeadLetterError('409 Conflict — duplicate time log entry')
  }

  if (response.status >= 400 && response.status < 500) {
    // 4xx client error — non-retryable (except 401 handled above)
    throw new DeadLetterError(`HTTP ${response.status} client error — non-retryable`)
  }

  // 5xx server error → retryable
  return false
}

/** Handle photo upload (multipart/form-data — not JSON) */
async function syncPhotoUpload(item: SyncQueueItem): Promise<boolean> {
  const payload = item.payload as { orderId: string; tempId: string; blobUrl: string }

  let blob: Blob
  try {
    const res = await fetch(payload.blobUrl)
    blob = await res.blob()
  } catch {
    // Blob URL expired (e.g. after app restart) — mark as dead letter
    throw new DeadLetterError('Photo blob URL expired or invalid')
  }

  const formData = new FormData()
  formData.append('photo', blob, 'upload.jpg')

  const { accessToken } = getAuthState()
  const headers: Record<string, string> = {
    'X-API-Key': ACTIVE_API_KEY,
  }
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

  const response = await fetch(`${ACTIVE_BASE_URL}/orders/${payload.orderId}/photos`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (response.ok) {
    const json = await response.json() as { id: string; url: string }
    await orderPhotoRepository.replaceTempId(payload.tempId, json.id, json.url)
    return true
  }

  if (response.status === 401) throw new AuthExpiredError('401 during photo upload')
  if (response.status >= 400 && response.status < 500) {
    throw new DeadLetterError(`Photo upload 4xx: ${response.status}`)
  }

  return false // 5xx — retryable
}

// ─── Custom error types ───────────────────────────────────────────────────────

class AuthExpiredError extends Error {
  constructor(msg: string) { super(msg); this.name = 'AuthExpiredError' }
}

class DeadLetterError extends Error {
  constructor(msg: string) { super(msg); this.name = 'DeadLetterError' }
}

// ─── Core flush logic ─────────────────────────────────────────────────────────

/**
 * flushSyncQueue — processes all pending SyncQueue items in FIFO order.
 * Called inside navigator.locks.request or guarded by _isSyncing flag.
 * Source: DAD §7 Sync Strategy
 */
async function flushSyncQueue(): Promise<void> {
  const pending = await syncQueueRepository.getPending()
  if (pending.length === 0) return

  console.info(`[SyncService] Flushing ${pending.length} pending items...`)

  // Deduplicate per entity before processing
  // (keeps only most recent entry per entityType+id — DAD §14)
  for (const item of pending) {
    const entityId = (item.payload as { id?: string }).id
    if (entityId) {
      await syncQueueRepository.deduplicateByEntity(item.entityType, entityId)
    }
  }

  // Re-fetch after deduplication
  const deduped = await syncQueueRepository.getPending()

  for (const item of deduped) {
    try {
      const success = await processSyncItem(item)
      if (success) {
        await syncQueueRepository.remove(item.id)
        console.info(`[SyncService] Synced: ${item.entityType} ${item.action}`)
      } else {
        // Retryable failure — increment retry count
        const delay = getSyncRetryDelay(item.retryCount)
        await syncQueueRepository.recordFailure(item.id, 'Retryable error')
        console.warn(`[SyncService] Will retry in ${delay}ms: ${item.id}`)
        setTimeout(() => void SyncService.flush(), delay)
      }
    } catch (error) {
      const err = error as Error

      if (err.name === 'AuthExpiredError') {
        // Pause queue — re-auth required
        console.warn('[SyncService] Auth expired — pausing sync queue')
        await syncQueueRepository.recordFailure(item.id, err.message)
        // Signal UI to re-authenticate (caller is responsible for re-auth flow)
        SyncService.onAuthExpired?.()
        return // Stop processing remaining items
      }

      if (err.name === 'DeadLetterError') {
        // Mark as DEAD_LETTER (retryCount = MAX_SYNC_RETRIES)
        await db_markDeadLetter(item.id, err.message)
        SyncService.onDeadLetter?.()
        continue
      }

      // Unexpected error — treat as retryable
      await syncQueueRepository.recordFailure(item.id, err.message)
    }
  }
}

/** Marks a SyncQueueItem as DEAD_LETTER by setting retryCount to MAX */
async function db_markDeadLetter(id: string, error: string): Promise<void> {
  const { db: appDb } = await import('../db/AppDB')
  await appDb.sync_queue.update(id as 'id', {
    retryCount: MAX_SYNC_RETRIES,
    lastAttemptAt: Date.now(),
    error,
  } as Parameters<typeof appDb.sync_queue.update>[1])
}

// ─── Public SyncService API ───────────────────────────────────────────────────

export const SyncService = {
  /** Callback invoked when auth token expires during sync */
  onAuthExpired: null as (() => void) | null,

  /** Callback invoked when a new DEAD_LETTER item is created */
  onDeadLetter: null as (() => void) | null,

  /**
   * Trigger a sync flush.
   * Uses navigator.locks if available; falls back to _isSyncing flag.
   * Source: DAD §7 — SyncService Lock
   */
  async flush(): Promise<void> {
    if (typeof navigator !== 'undefined' && 'locks' in navigator) {
      await (navigator as Navigator & { locks: { request(name: string, fn: () => Promise<void>): Promise<void> } })
        .locks.request('larko_sync_lock', async () => {
          await flushSyncQueue()
        })
    } else {
      // Fallback: module-level flag
      if (_isSyncing) {
        console.debug('[SyncService] Already syncing — skipping concurrent flush')
        return
      }
      _isSyncing = true
      try {
        await flushSyncQueue()
      } finally {
        _isSyncing = false
      }
    }
  },

  /**
   * Register event listeners for automatic sync trigger.
   * Call once on app startup (e.g. in main.tsx after initDB()).
   * Source: DAD §7 — Flush triggers
   */
  registerListeners(): void {
    window.addEventListener('online', () => {
      console.info('[SyncService] Network came online — triggering flush')
      void SyncService.flush()
    })

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.info('[SyncService] App came to foreground — triggering flush')
        void SyncService.flush()
      }
    })
  },

  /**
   * Manual retry — resets all DEAD_LETTER items and triggers flush.
   * Source: DAD §12 — "Повторити" button
   */
  async retryDeadLetters(): Promise<void> {
    await syncQueueRepository.resetAllDeadLetters()
    await SyncService.flush()
  },

  /** Get count of DEAD_LETTER items for notification badge */
  async getDeadLetterCount(): Promise<number> {
    return syncQueueRepository.countDeadLetters()
  },
}
