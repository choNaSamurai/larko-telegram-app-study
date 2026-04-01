// src/services/leaveService.ts
// Data access layer — real API: absences (leave requests) + absence types.
// Source: backend/api_endpoints_reference.md §Workflows + §Catalog
//
// REAL API:
//   GET  /workflows/companies/{company_id}/absences?worker_id={member_id}
//   POST /workflows/companies/{company_id}/absences
//   GET  /catalog/companies/{company_id}/absence-types

import type { LeaveRequest, LeaveType, CalendarDot } from '@/types/leave.types';
import {
  leaveRequestRepository,
  leaveTypeRepository,
} from '@/db/repositories';
import {
  toLocalLeaveRequest,
  toLocalLeaveType,
  fromLocalLeaveRequest,
  fromLocalLeaveType,
} from '@/db/mappers';
import {
  listAbsences,
  createAbsence,
  listAbsenceTypes,
  mapLeaveTypeToReason,
} from '@/api/workflowsApi';
import type { AbsenceResponse, AbsenceTypeResponse } from '@/api/workflowsApi';
import { getAuthState } from '@/stores/authStore';

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapAbsenceToLeaveRequest(abs: AbsenceResponse): LeaveRequest {
  const start = new Date(abs.start_date + 'T00:00:00');
  const end = new Date(abs.end_date + 'T00:00:00');
  const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

  return {
    id: abs.id,
    type: abs.absence_type ?? abs.reason,
    startDate: abs.start_date,
    endDate: abs.end_date,
    durationDays: days,
    reason: abs.description ?? undefined,
    status: abs.status,
  };
}

function mapAbsenceTypeToLeaveType(at: AbsenceTypeResponse): LeaveType {
  return {
    id: at.id,
    label_uk: at.name,
    label_en: at.name,  // API does not provide label_en — use same for now
  };
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Fetches leave requests for the authenticated worker.
 * Cache-first (2 min TTL).
 *
 * REAL API: GET /workflows/companies/{company_id}/absences?worker_id={member_id}
 */
export async function fetchLeaveRequests(): Promise<LeaveRequest[]> {
  const { companyId, memberId } = getAuthState();

  // ── Cache HIT ──────────────────────────────────────────────────────────────
  if (await leaveRequestRepository.isCacheFresh()) {
    const local = await leaveRequestRepository.getAllSorted();
    if (local.length > 0) {
      console.debug('[leaveService] Cache HIT — leave requests from DB');
      return local.map(fromLocalLeaveRequest);
    }
  }

  if (!companyId || !memberId) {
    console.warn('[leaveService] Missing companyId/memberId — returning empty');
    return [];
  }

  // ── Cache MISS — fetch from API ────────────────────────────────────────────
  const absences = await listAbsences(companyId, memberId);
  const requests = absences.map(mapAbsenceToLeaveRequest);

  await leaveRequestRepository.saveMany(requests.map(toLocalLeaveRequest));
  await leaveRequestRepository.markFetched();

  return requests;
}

/**
 * Derives calendar dots from IndexedDB leave requests for a given month.
 * Reads from DB directly — no extra API call needed.
 */
export async function fetchLeaveCalendar(yearMonth: string): Promise<CalendarDot[]> {
  const local = await leaveRequestRepository.getAllSorted();
  const requests = local.map(fromLocalLeaveRequest);

  return requests.flatMap(req => {
    const dots: CalendarDot[] = [];
    const start = new Date(req.startDate + 'T00:00:00');
    const end = new Date(req.endDate + 'T00:00:00');
    const cursor = new Date(start);
    while (cursor <= end) {
      const iso = cursor.toISOString().split('T')[0];
      if (iso.startsWith(yearMonth)) {
        dots.push({ date: iso, status: req.status });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return dots;
  });
}

/**
 * Fetches leave type catalog.
 * Cache-first (1 hour TTL) — near-static data.
 *
 * REAL API: GET /catalog/companies/{company_id}/absence-types
 */
export async function fetchLeaveTypes(): Promise<LeaveType[]> {
  const { companyId } = getAuthState();

  // ── Cache HIT ──────────────────────────────────────────────────────────────
  if (await leaveTypeRepository.isCacheFresh()) {
    const local = await leaveTypeRepository.getAll();
    if (local.length > 0) {
      console.debug('[leaveService] Cache HIT — leave types from DB');
      return local.map(fromLocalLeaveType);
    }
  }

  if (!companyId) {
    console.warn('[leaveService] No companyId — returning empty leave types');
    return [];
  }

  // ── Cache MISS — fetch from API ────────────────────────────────────────────
  const types = await listAbsenceTypes(companyId);
  const leaveTypes = types.map(mapAbsenceTypeToLeaveType);

  await leaveTypeRepository.saveMany(leaveTypes.map(toLocalLeaveType));
  await leaveTypeRepository.markFetched();

  return leaveTypes;
}

/**
 * Creates a new leave request via real API.
 * Writes to DB on success + invalidates cache.
 *
 * REAL API: POST /workflows/companies/{company_id}/absences
 */
export async function createLeaveRequest(payload: {
  typeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}): Promise<LeaveRequest> {
  const { companyId } = getAuthState();

  if (!companyId) {
    throw new Error('Не вдалось визначити компанію для створення запиту');
  }

  const absenceTypes = await leaveTypeRepository.getAll();
  const typeLabel = absenceTypes.find(t => t.id === payload.typeId)?.label_uk ?? payload.typeId;

  const apiReason = mapLeaveTypeToReason(payload.typeId);

  const absenceResp = await createAbsence(companyId, {
    start_date: payload.startDate,
    end_date: payload.endDate,
    reason: apiReason,
    absence_type: typeLabel,
    description: payload.reason ?? null,
  });

  const newRequest = mapAbsenceToLeaveRequest(absenceResp);

  // ── Persist to IndexedDB ──────────────────────────────────────────────────
  await leaveRequestRepository.save(toLocalLeaveRequest(newRequest));
  await leaveRequestRepository.invalidateCache();

  console.debug('[leaveService] Leave request created via API:', newRequest.id);
  return newRequest;
}
