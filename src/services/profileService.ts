// src/services/profileService.ts
// Traces to: TECH_STACK §Service Files (profileService), ADR-003-A/B

import { MOCK_PROFILE } from './MockData';
import type { UserProfile, UserPreferences } from '@/types/leave.types';

const SIMULATED_DELAY_MS = 400;

export async function fetchUserProfile(): Promise<UserProfile> {
  await new Promise(r => setTimeout(r, SIMULATED_DELAY_MS));
  return MOCK_PROFILE;
  // TODO: fetch('/api/v1/users/me', { headers: { Authorization: `Bearer ${token}` } })
}

export async function patchUserPreferences(prefs: Partial<UserPreferences>): Promise<void> {
  await new Promise(r => setTimeout(r, 200));
  // TODO: fetch('/api/v1/users/me', { method: 'PATCH', body: JSON.stringify(prefs) })
  console.log('[profileService] patchUserPreferences', prefs);
}
