// src/services/orderService.ts
// Traces to: TECH_STACK_SCREEN_Order_Hub §orderService.ts
// ADR: Uses mock data with 600ms simulated delay; swap fetchOrderById body for real API later

import type { OrderDetail, DisputeResponsePayload } from '@/types/order.types';
import { MOCK_ORDER_MAP, MOCK_ORDER_IN_PROGRESS } from './MockData';

const SIMULATED_DELAY_MS = 600;
const delay = () => new Promise((r) => setTimeout(r, SIMULATED_DELAY_MS));

// In-memory state store — persists mutations within current browser session
// Real API won't need this; it's purely a dev-time convenience.
const _stateOverrides: Map<string, Partial<OrderDetail>> = new Map();

/**
 * Fetches full order details for the Order Hub.
 * TODO: Replace with:
 *   fetch(`/api/v1/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } })
 */
export async function fetchOrderById(id: string): Promise<OrderDetail> {
  await delay();
  const base = MOCK_ORDER_MAP[id] ?? MOCK_ORDER_IN_PROGRESS;
  const overrides = _stateOverrides.get(id);
  return overrides ? { ...base, ...overrides } : base;
}

/**
 * Updates order status — 'start' → in_progress, 'complete' → checking (waiting manager).
 * TODO: Replace with: PATCH /api/v1/orders/{id}/status
 */
export async function updateOrderStatus(
  id: string,
  action: 'start' | 'complete',
): Promise<{ status: string }> {
  await delay();
  const newStatus = action === 'start' ? 'in_progress' : 'checking';
  // Persist in-memory so re-fetch returns updated state
  const existing = _stateOverrides.get(id) ?? {};
  _stateOverrides.set(id, {
    ...existing,
    status: newStatus as OrderDetail['status'],
    // Update derived flags for in_progress
    ...(newStatus === 'in_progress' && {
      canAddTime: true,
      canAddPhotos: true,
      canReportIssue: true,
      ctaAction: 'complete',
    }),
    // Update derived flags for checking
    ...(newStatus === 'checking' && {
      canAddTime: false,
      canAddPhotos: false,
      canReportIssue: false,
      ctaAction: null,
    }),
  });
  return { status: newStatus };
}

/**
 * Uploads a photo to the order.
 * TODO: Replace with: POST /api/v1/orders/{id}/photos (multipart/form-data)
 */
export async function uploadOrderPhoto(
  _orderId: string,
  file: File,
): Promise<{ id: string; url: string; thumbnailUrl: string }> {
  await delay();
  const url = URL.createObjectURL(file);
  return { id: `p-${Date.now()}`, url, thumbnailUrl: url };
}

/**
 * Deletes a photo from the order.
 * TODO: Replace with: DELETE /api/v1/orders/{id}/photos/{photoId}
 */
export async function deleteOrderPhoto(
  _orderId: string,
  _photoId: string,
): Promise<void> {
  await delay();
}

/**
 * Submits Worker's response to a dispute (accept or contest).
 * TODO: Replace with: POST /api/v1/orders/{id}/dispute/response
 */
export async function submitDisputeResponse(
  id: string,
  payload: DisputeResponsePayload,
): Promise<void> {
  await delay();
  // Persist resolved dispute state in-memory
  const existing = _stateOverrides.get(id) ?? {};
  _stateOverrides.set(id, {
    ...existing,
    status: payload.action === 'accept' ? 'done' : 'dispute',
    ctaAction: null,
  });
  console.log('[Mock] Dispute response submitted:', payload);
}
