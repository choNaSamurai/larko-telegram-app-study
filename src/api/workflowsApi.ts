// src/api/workflowsApi.ts
// Workflows API — absences (leave requests) + absence types catalog
// Source: backend/api_endpoints_reference.md §10 Workflows + §5 Catalog
// Swagger operationIds:
//   list_absences_api_v1_workflows_companies__company_id__absences_get
//   create_absence_api_v1_workflows_companies__company_id__absences_post
//   list_absence_types_api_v1_catalog_companies__company_id__absence_types_get
//
// NOTE: AbsenceCreate.reason accepts only: vacation|sick|personal|other
// Mapping: holiday, unpaid, family, training → 'other' (Q3 confirmed)

import { httpClient } from './httpClient';

// ─── Swagger schema types ─────────────────────────────────────────────────────

export type AbsenceReason = 'vacation' | 'sick' | 'personal' | 'other';

export interface AbsenceCreate {
  start_date: string;               // YYYY-MM-DD
  end_date: string;                 // YYYY-MM-DD
  reason: AbsenceReason;           // vacation|sick|personal|other
  absence_type?: string;            // max 50 chars (for display label)
  description?: string | null;
}

export interface AbsenceResponse {
  id: string;
  company_id: string;
  member_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  absence_type: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_comment: string | null;
  created_at: string;
  overlapping_orders_count: number;
}

export interface AbsenceTypeResponse {
  id: string;
  company_id: string;
  name: string;
  is_paid: boolean;
  is_enabled: boolean;
  sort_order: number;
  created_at: string;
}

// ─── Mapping helpers ──────────────────────────────────────────────────────────

/**
 * Map frontend leave type IDs to API-accepted reason values.
 * Q3 confirmed: extra types (holiday, unpaid, family, training) → 'other'
 */
export function mapLeaveTypeToReason(typeId: string): AbsenceReason {
  const map: Record<string, AbsenceReason> = {
    vacation: 'vacation',
    sick: 'sick',
    personal: 'personal',
    other: 'other',
    // extras → 'other'
    holiday: 'other',
    unpaid: 'other',
    family: 'other',
    training: 'other',
  };
  return map[typeId] ?? 'other';
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * List absence requests for a worker within a company.
 * operationId: list_absences_api_v1_workflows_companies__company_id__absences_get
 */
export async function listAbsences(
  companyId: string,
  workerId: string,
): Promise<AbsenceResponse[]> {
  return httpClient.get<AbsenceResponse[]>(
    `/workflows/companies/${companyId}/absences?worker_id=${workerId}`,
  );
}

/**
 * Create a new absence request.
 * operationId: create_absence_api_v1_workflows_companies__company_id__absences_post
 */
export async function createAbsence(
  companyId: string,
  dto: AbsenceCreate,
): Promise<AbsenceResponse> {
  return httpClient.post<AbsenceResponse>(
    `/workflows/companies/${companyId}/absences`,
    dto,
  );
}

/**
 * List absence type catalog for a company.
 * Used to populate the leave type dropdown in LeaveForm.
 * operationId: list_absence_types_api_v1_catalog_companies__company_id__absence_types_get
 */
export async function listAbsenceTypes(
  companyId: string,
): Promise<AbsenceTypeResponse[]> {
  return httpClient.get<AbsenceTypeResponse[]>(
    `/catalog/companies/${companyId}/absence-types`,
  );
}
