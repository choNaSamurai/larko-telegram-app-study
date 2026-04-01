// src/api/companiesApi.ts
// Companies + Members bootstrap — called once after auth to resolve company_id + member_id
// Source: backend/api_endpoints_reference.md §2 Companies, §3 Members
// Swagger operationIds:
//   list_companies_api_v1_companies_get
//   list_members_api_v1_members_companies__company_id__members_get

import { httpClient } from './httpClient';

// ─── Swagger schema types ─────────────────────────────────────────────────────

export interface CompanyResponse {
  id: string;
  account_id: string;
  name: string;
  industry_type: string;
  country: string;
  base_currency: string;
  invite_code: string;
  overtime_enabled: boolean;
  overtime_multiplier: number;
  overtime_daily_threshold: number;
  overtime_weekly_threshold: number;
  status: string;
  created_at: string;
  scheduled_deletion_at: string | null;
}

export interface CompanyListResponse {
  items: CompanyResponse[];
  total: number;
  has_more: boolean;
}

export interface MemberResponse {
  id: string;
  company_id: string;
  account_id: string | null;
  telegram_id: string | null;
  full_name: string;
  role: 'owner' | 'manager' | 'worker';
  status: 'active' | 'inactive';
  worker_group_id: string | null;
  hourly_rate: number;
  created_at: string;
}

export interface MemberListResponse {
  items: MemberResponse[];
  total: number;
  has_more: boolean;
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * List companies the current user owns or belongs to.
 * operationId: list_companies_api_v1_companies_get
 */
export async function listMyCompanies(): Promise<CompanyListResponse> {
  return httpClient.get<CompanyListResponse>('/companies');
}

/**
 * List members of a company.
 * Used to find the current user's member_id.
 * operationId: list_members_api_v1_members_companies__company_id__members_get
 */
export async function listCompanyMembers(
  companyId: string,
  limit = 100,
): Promise<MemberListResponse> {
  return httpClient.get<MemberListResponse>(
    `/members/companies/${companyId}/members?limit=${limit}`,
  );
}

/**
 * Join a company via invite code.
 * operationId: join_company_api_v1_members_join_post
 */
export async function joinCompany(
  inviteCode: string,
  fullName: string,
): Promise<MemberResponse> {
  return httpClient.post<MemberResponse>('/members/join', {
    invite_code: inviteCode,
    full_name: fullName,
  });
}
