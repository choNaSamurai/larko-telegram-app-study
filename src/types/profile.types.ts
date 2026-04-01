/**
 * profile.types.ts
 * Re-exports LocalUserProfile from db.entities for AppDB.ts import compatibility.
 * Keeps local DB entities separate from the existing leave.types.ts (UserProfile/UserPreferences).
 */

export type { LocalUserProfile } from './db.entities'
