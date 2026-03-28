/**
 * Programmatic status values derived from Scenario §7 and BRD 2.0.159.
 * These drive the logic for the StatusBadge and filtering.
 */
export type TaskStatus = 'NEW' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';

/**
 * Task interface as defined in Scenario §11 and Tech Stack §6.
 */
export interface Task {
  id: string;
  orderNumber?: string;
  productName: string; // e.g. "iPhone 15 Pro Max"
  serviceType: string; // e.g. "Repair" or "Manufacturing"
  clientName?: string;
  quantity: number;
  deadline: string; // ISO date format
  status: TaskStatus;
}

/**
 * Filter groups for the W1 screen.
 * Traces to Scenario §7 Status Filter.
 */
export type FilterGroup = 'active' | 'completed';
