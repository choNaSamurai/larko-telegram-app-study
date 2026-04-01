/**
 * migrations/README.md
 * Placeholder directory for future Dexie.js schema migrations.
 *
 * Version 1 — initial schema (declared in AppDB.ts db.version(1).stores({...}))
 * Version 2 — add here when schema changes are needed
 *
 * Rules (from DAD §11):
 * - Each schema change increments DB version (never skip version numbers)
 * - .upgrade() callback provides data migration for existing rows
 * - Never remove a version block from AppDB.ts (Dexie needs full version history)
 * - Migration scripts stored here as v[N].ts
 *
 * Example migration file: v2.ts
 * ```ts
 * import { db } from '../AppDB'
 *
 * // Version 2 — added workNote field to time_log_entries
 * db.version(2).stores({
 *   ...existing schema...,
 *   time_log_entries: 'id, orderId, logDate, isSynced, updatedAt, workNote',
 * }).upgrade(tx => {
 *   return tx.time_log_entries.toCollection().modify(entry => {
 *     entry.workNote = ''
 *   })
 * })
 * ```
 */
