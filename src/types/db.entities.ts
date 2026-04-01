/**
 * db.entities.ts
 * Local entity types for IndexedDB persistence.
 * Each type extends the corresponding API/UI type with system fields.
 * Source: DAD_Global_Data_Layer.md §4 Data Model
 *
 * System fields required on ALL mutable entities:
 *   updatedAt: number        — Unix timestamp (ms) — conflict resolution key
 *   createdAt: number        — Unix timestamp (ms)
 *   isSynced: boolean        — false = pending background sync
 *   _localVersion: number    — incremented on every local mutation
 */

import type { TaskStatus, PaymentModel, TaskAssignee } from './task.types'
import type { TaskStatus as OrderStatus } from './task.types'
import type { BreakPair } from './timeLog.types'
import type { LeaveStatus } from './leave.types'

// ─── Task ─────────────────────────────────────────────────────────────────────

/** LocalTask — full Task entity with system fields for Dexie persistence */
export interface LocalTask {
  id: string
  name: string
  status: TaskStatus
  companyName: string
  address: string
  notes?: string
  deadline: string              // ISO date "YYYY-MM-DD"
  paymentModel: PaymentModel
  amount: number
  amountPerUnit?: number
  unitLabel?: string
  quantity?: number
  assignees: TaskAssignee[]
  hasStartButton: boolean
  hasActionButtons: boolean
  // --- system fields ---
  updatedAt: number
  createdAt: number
  isSynced: boolean
  _localVersion: number
}

// ─── Order ────────────────────────────────────────────────────────────────────

/** LocalOrder — flattened OrderDetail for Dexie (location is flattened) */
export interface LocalOrder {
  id: string
  number: string
  name: string
  status: OrderStatus
  deadline: string
  amount: number
  notes: string
  locationAddress: string
  locationLat?: number
  locationLng?: number
  totalHours: number
  photosAddedToday: number
  canAddTime: boolean
  canAddPhotos: boolean
  canReportIssue: boolean
  ctaAction: 'start' | 'complete' | null
  // --- system fields ---
  updatedAt: number
  createdAt: number
  isSynced: boolean
  _localVersion: number
}

// ─── TimeLogEntry ─────────────────────────────────────────────────────────────

/** LocalTimeLogEntry — merged from TimeLogEntry (AddTimeLog) + TimeLog (OrderHub) */
export interface LocalTimeLogEntry {
  id: string
  orderId: string               // FK → orders table
  workerId: string
  logDate: string               // "YYYY-MM-DD"
  workStart: string             // "HH:MM"
  workEnd: string               // "HH:MM"
  breaks: BreakPair[]
  netHours: number              // computed decimal hours
  comment?: string
  unitsCompleted?: number       // Per-Unit orders only
  isOvertime: boolean
  overtimeHours?: number
  isReadOnly: boolean           // true once synced to server
  // --- system fields ---
  updatedAt: number
  createdAt: number
  isSynced: boolean
  _localVersion: number
}

// ─── OrderPhoto ───────────────────────────────────────────────────────────────

/** LocalOrderPhoto — stored with temp local id until server assigns real one */
export interface LocalOrderPhoto {
  id: string                    // temp UUID pre-sync, replaced by server id on success
  orderId: string               // FK → orders table
  url: string                   // full-size URL or blob URL pre-sync
  thumbnailUrl: string
  uploadedAt: string            // ISO date
  workerName: string
  // --- system fields ---
  updatedAt: number
  createdAt: number
  isSynced: boolean             // false = waiting for upload to server
  _localVersion: number
}

// ─── LeaveRequest ─────────────────────────────────────────────────────────────

/** LocalLeaveRequest — leave request with typeId for sync payload */
export interface LocalLeaveRequest {
  id: string
  type: string                  // display label e.g. "Лікарняний"
  typeId: string                // leave type ID for sync payload
  startDate: string             // "YYYY-MM-DD"
  endDate: string               // "YYYY-MM-DD"
  durationDays: number
  reason?: string
  status: LeaveStatus
  // --- system fields ---
  updatedAt: number
  createdAt: number
  isSynced: boolean
  _localVersion: number
}

// ─── LeaveType ────────────────────────────────────────────────────────────────

/** LocalLeaveType — near-static catalog, no mutations from client */
export interface LocalLeaveType {
  id: string
  label_uk: string
  label_en: string
  // --- system fields ---
  updatedAt: number
  createdAt: number
  isSynced: boolean             // always true — catalog, no mutations
  _localVersion: number
}

// ─── UserProfile ──────────────────────────────────────────────────────────────

/** LocalUserProfile — merged UserProfile + UserPreferences */
export interface LocalUserProfile {
  id: string
  name: string
  avatarUrl: string | null
  companyName: string
  language: 'uk' | 'en'
  theme: 'dark' | 'light'
  // --- system fields ---
  updatedAt: number
  createdAt: number
  isSynced: boolean
  _localVersion: number
}
