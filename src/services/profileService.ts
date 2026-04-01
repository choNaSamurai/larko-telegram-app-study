// src/services/profileService.ts
// Data access layer — cache-first via IndexedDB + optimistic preference sync.
// Source: DAD_Global_Data_Layer.md §6 Data Flow, §8 Caching Strategy

import { MOCK_PROFILE } from './MockData';
import type { UserProfile, UserPreferences } from '@/types/leave.types';
import { userProfileRepository, syncQueueRepository } from '@/db/repositories';
import {
  toLocalUserProfile,
  fromLocalUserProfile,
  fromLocalUserPreferences,
} from '@/db/mappers';
import type { SyncQueueItem } from '@/types/db.types';

function makeSyncItem(
  partial: Omit<SyncQueueItem, 'id' | 'createdAt' | 'lastAttemptAt' | 'retryCount' | 'error'>
): SyncQueueItem {
  return {
    ...partial,
    id: `sync-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
    lastAttemptAt: null,
    retryCount: 0,
    error: null,
  };
}

/**
 * Fetches the current worker's profile.
 * Cache-first (10 min TTL): reads from IndexedDB if fresh.
 *
 * TODO (real API): fetch('/api/v1/users/me', { headers: { Authorization: `Bearer ${token}` } })
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  // ── Cache HIT ──────────────────────────────────────────────────────────────
  if (await userProfileRepository.isCacheFresh()) {
    const local = await userProfileRepository.getCurrent();
    if (local) {
      console.debug('[profileService] Cache HIT — profile from DB');
      return fromLocalUserProfile(local);
    }
  }

  // ── Cache MISS ─────────────────────────────────────────────────────────────
  await new Promise(r => setTimeout(r, 400));
  const profile = MOCK_PROFILE;

  const localProfile = toLocalUserProfile(profile, { language: 'uk', theme: 'dark' });
  await userProfileRepository.save(localProfile);
  await userProfileRepository.markFetched();

  return profile;
}

/**
 * Fetches user preferences (language + theme) from the local profile.
 * Always reads from DB — preferences are patched locally, no separate API call.
 */
export async function fetchUserPreferences(): Promise<UserPreferences> {
  const local = await userProfileRepository.getCurrent();
  if (local) return fromLocalUserPreferences(local);
  // Fallback defaults if profile not yet seeded
  return { language: 'uk', theme: 'dark' };
}

/**
 * Patch language and/or theme preference.
 * Writes to DB immediately (optimistic) + enqueues to SyncQueue.
 * Source: DAD §6 — Action: Worker updates user preferences
 *
 * TODO (real API): SyncService.flush() will PATCH /api/v1/users/me
 */
export async function patchUserPreferences(prefs: Partial<UserPreferences>): Promise<void> {
  await new Promise(r => setTimeout(r, 200));

  const local = await userProfileRepository.getCurrent();
  if (!local) {
    console.warn('[profileService] patchUserPreferences — no profile in DB, skipping');
    return;
  }

  // ── Optimistic write to DB ─────────────────────────────────────────────────
  await userProfileRepository.patchPreferences(local.id, prefs);

  // ── Enqueue to SyncQueue ───────────────────────────────────────────────────
  await syncQueueRepository.enqueue(makeSyncItem({
    entityType: 'userProfile',
    action: 'update',
    payload: { id: local.id, ...prefs },
  }));

  console.debug('[profileService] Preferences patched and enqueued:', prefs);
}
