/**
 * mappers.ts
 * Bidirectional type mappers between IndexedDB (Local*) and UI/API types.
 * Source: DAD_Global_Data_Layer.md §6 Data Flow
 *
 * Pattern:
 *   API/UI type → LocalType  (toLocal*)  — called when saving to DB
 *   LocalType → API/UI type  (fromLocal*) — called when reading from DB for UI
 */

import type { Task } from '../types/task.types'
import type { OrderDetail, TimeLog, OrderPhoto } from '../types/order.types'
import type { TimeLogEntry } from '../types/timeLog.types'
import type { LeaveRequest, LeaveType, UserProfile, UserPreferences } from '../types/leave.types'
import type {
  LocalTask,
  LocalOrder,
  LocalTimeLogEntry,
  LocalOrderPhoto,
  LocalLeaveRequest,
  LocalLeaveType,
  LocalUserProfile,
} from '../types/db.entities'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const now = () => Date.now()

// ─── Task ──────────────────────────────────────────────────────────────────────

export function toLocalTask(task: Task): LocalTask {
  return {
    ...task,
    updatedAt: now(),
    createdAt: now(),
    isSynced: true,          // fetched from server = already synced
    _localVersion: 1,
  }
}

export function fromLocalTask(local: LocalTask): Task {
  return {
    id: local.id,
    name: local.name,
    status: local.status,
    companyName: local.companyName,
    address: local.address,
    notes: local.notes,
    deadline: local.deadline,
    paymentModel: local.paymentModel,
    amount: local.amount,
    amountPerUnit: local.amountPerUnit,
    unitLabel: local.unitLabel,
    quantity: local.quantity,
    assignees: local.assignees,
    hasStartButton: local.hasStartButton,
    hasActionButtons: local.hasActionButtons,
  }
}

// ─── Order ─────────────────────────────────────────────────────────────────────

export function toLocalOrder(order: OrderDetail): LocalOrder {
  return {
    id: order.id,
    number: order.number,
    name: order.name,
    status: order.status,
    deadline: order.deadline,
    amount: order.amount,
    notes: order.notes,
    locationAddress: order.location.address,
    locationLat: order.location.lat,
    locationLng: order.location.lng,
    totalHours: order.totalHours,
    photosAddedToday: order.photosAddedToday,
    canAddTime: order.canAddTime,
    canAddPhotos: order.canAddPhotos,
    canReportIssue: order.canReportIssue,
    ctaAction: order.ctaAction,
    updatedAt: now(),
    createdAt: now(),
    isSynced: true,
    _localVersion: 1,
  }
}

export function fromLocalOrder(
  local: LocalOrder,
  timeLogs: TimeLog[],
  photos: OrderPhoto[],
): OrderDetail {
  return {
    id: local.id,
    number: local.number,
    name: local.name,
    status: local.status,
    deadline: local.deadline,
    amount: local.amount,
    notes: local.notes,
    location: {
      address: local.locationAddress,
      lat: local.locationLat,
      lng: local.locationLng,
    },
    timeLogs,
    totalHours: local.totalHours,
    photos,
    photosAddedToday: local.photosAddedToday,
    canAddTime: local.canAddTime,
    canAddPhotos: local.canAddPhotos,
    canReportIssue: local.canReportIssue,
    ctaAction: local.ctaAction,
  }
}

// ─── TimeLog (OrderHub view) ──────────────────────────────────────────────────

export function fromLocalTimeLogToTimeLog(local: LocalTimeLogEntry): TimeLog {
  return {
    id: local.id,
    date: local.logDate,
    netHours: local.netHours,
    workStart: local.workStart,
    workEnd: local.workEnd,
    breaks: local.breaks.map(b => ({ start: b.breakStart, end: b.breakEnd })),
    isOvertime: local.isOvertime,
    overtimeHours: local.overtimeHours,
    unitsCompleted: local.unitsCompleted,
    isReadOnly: local.isReadOnly,
  }
}

export function fromLocalTimeLogToTimeLogEntry(local: LocalTimeLogEntry): TimeLogEntry {
  return {
    id: local.id,
    orderId: local.orderId,
    workerId: local.workerId,
    logDate: local.logDate,
    workStart: local.workStart,
    workEnd: local.workEnd,
    breaks: local.breaks,
    netHours: local.netHours,
    comment: local.comment,
    unitsCompleted: local.unitsCompleted,
    syncStatus: local.isSynced ? 'synced' : 'pending',
  }
}

export function toLocalTimeLogEntry(
  entry: TimeLogEntry,
  override?: Partial<LocalTimeLogEntry>
): LocalTimeLogEntry {
  return {
    id: entry.id,
    orderId: entry.orderId,
    workerId: entry.workerId,
    logDate: entry.logDate,
    workStart: entry.workStart,
    workEnd: entry.workEnd,
    breaks: entry.breaks,
    netHours: entry.netHours,
    comment: entry.comment,
    unitsCompleted: entry.unitsCompleted,
    isOvertime: false,
    overtimeHours: undefined,
    isReadOnly: entry.syncStatus === 'synced',
    updatedAt: now(),
    createdAt: now(),
    isSynced: entry.syncStatus === 'synced',
    _localVersion: 1,
    ...override,
  }
}

// ─── OrderPhoto ───────────────────────────────────────────────────────────────

export function toLocalOrderPhoto(photo: OrderPhoto, orderId: string): LocalOrderPhoto {
  return {
    id: photo.id,
    orderId,
    url: photo.url,
    thumbnailUrl: photo.thumbnailUrl,
    uploadedAt: photo.uploadedAt,
    workerName: photo.workerName,
    updatedAt: now(),
    createdAt: now(),
    isSynced: true,
    _localVersion: 1,
  }
}

export function fromLocalOrderPhoto(local: LocalOrderPhoto): OrderPhoto {
  return {
    id: local.id,
    url: local.url,
    thumbnailUrl: local.thumbnailUrl,
    uploadedAt: local.uploadedAt,
    workerName: local.workerName,
  }
}

// ─── LeaveRequest ─────────────────────────────────────────────────────────────

export function toLocalLeaveRequest(req: LeaveRequest): LocalLeaveRequest {
  return {
    id: req.id,
    type: req.type,
    typeId: req.id,          // mock uses id as typeId; real API provides typeId separately
    startDate: req.startDate,
    endDate: req.endDate,
    durationDays: req.durationDays,
    reason: req.reason,
    status: req.status,
    updatedAt: now(),
    createdAt: now(),
    isSynced: true,
    _localVersion: 1,
  }
}

export function fromLocalLeaveRequest(local: LocalLeaveRequest): LeaveRequest {
  return {
    id: local.id,
    type: local.type,
    startDate: local.startDate,
    endDate: local.endDate,
    durationDays: local.durationDays,
    reason: local.reason,
    status: local.status,
  }
}

// ─── LeaveType ────────────────────────────────────────────────────────────────

export function toLocalLeaveType(lt: LeaveType): LocalLeaveType {
  return {
    id: lt.id,
    label_uk: lt.label_uk,
    label_en: lt.label_en,
    updatedAt: now(),
    createdAt: now(),
    isSynced: true,
    _localVersion: 1,
  }
}

export function fromLocalLeaveType(local: LocalLeaveType): LeaveType {
  return {
    id: local.id,
    label_uk: local.label_uk,
    label_en: local.label_en,
  }
}

// ─── UserProfile ──────────────────────────────────────────────────────────────

export function toLocalUserProfile(
  profile: UserProfile,
  prefs: UserPreferences = { language: 'uk', theme: 'dark' }
): LocalUserProfile {
  return {
    id: profile.id,
    name: profile.name,
    avatarUrl: profile.avatarUrl,
    companyName: profile.company.name,
    language: prefs.language,
    theme: prefs.theme,
    updatedAt: now(),
    createdAt: now(),
    isSynced: true,
    _localVersion: 1,
  }
}

export function fromLocalUserProfile(local: LocalUserProfile): UserProfile {
  return {
    id: local.id,
    name: local.name,
    avatarUrl: local.avatarUrl,
    company: { name: local.companyName },
  }
}

export function fromLocalUserPreferences(local: LocalUserProfile): UserPreferences {
  return {
    language: local.language,
    theme: local.theme,
  }
}
