// src/services/profileService.ts
// Data access layer — real API: account + preferences (local-only, no server sync for prefs).
// Source: backend/api_endpoints_reference.md §Auth
//
// REAL API: GET /auth/me

import type { UserProfile, UserPreferences } from '@/types/leave.types';
import { userProfileRepository, syncQueueRepository } from '@/db/repositories';
import {
  toLocalUserProfile,
  fromLocalUserProfile,
  fromLocalUserPreferences,
} from '@/db/mappers';
import type { SyncQueueItem } from '@/types/db.types';
import { getMe } from '@/api/authApi';
import { getAuthState } from '@/stores/authStore';

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
 * Cache-first (10 min TTL). Falls back to auth store full_name if API unavailable.
 *
 * REAL API: GET /auth/me
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

  // ── Cache MISS — fetch from real API ──────────────────────────────────────
  const { accountId, fullName: storedName, companyId } = getAuthState();

  let profile: UserProfile;

  try {
    const account = await getMe();

    profile = {
      id: account.id,
      name: account.full_name,
      avatarUrl: null,
      company: {
        // Company name is not in /auth/me — use what we know, or placeholder
        name: companyId ? `Company (${companyId.slice(0, 8)})` : 'Larko',
      },
    };
  } catch (err) {
    console.warn('[profileService] getMe() failed — using auth store fallback:', err);
    // Fallback: construct profile from authStore data (already authenticated)
    profile = {
      id: accountId ?? 'unknown',
      name: storedName ?? 'Worker',
      avatarUrl: null,
      company: { name: 'Larko' },
    };
  }

  const localProfile = toLocalUserProfile(profile, { language: 'uk', theme: 'dark' });
  await userProfileRepository.save(localProfile);
  await userProfileRepository.markFetched();

  return profile;
}

/**
 * Fetches user preferences from the local profile.
 * Always reads from DB — preferences are local-only (no dedicated API endpoint).
 */
export async function fetchUserPreferences(): Promise<UserPreferences> {
  const local = await userProfileRepository.getCurrent();
  if (local) return fromLocalUserPreferences(local);
  return { language: 'uk', theme: 'dark' };
}

/**
 * Patch language and/or theme preference.
 * Writes to DB immediately (optimistic) + enqueues to SyncQueue (PATCH /users/me).
 */
export async function patchUserPreferences(prefs: Partial<UserPreferences>): Promise<void> {
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
