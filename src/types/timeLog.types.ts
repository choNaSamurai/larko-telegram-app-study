// src/types/timeLog.types.ts
// Traces to: Tech Stack §TypeScript Interfaces, Scenario §7, ADR-005-B

export interface BreakPair {
  id: string;          // local UUID for React key + removal
  breakStart: string;  // "HH:MM"
  breakEnd: string;    // "HH:MM"
}

export interface TimeLogFormState {
  logDate: string;           // "YYYY-MM-DD"
  workStart: string;         // "HH:MM"
  workEnd: string;           // "HH:MM"
  breaks: BreakPair[];       // up to 5 break pairs (BR-TL-004)
  comment: string;           // optional free text
  unitsCompleted?: number;   // only for Per-Unit orders (Variant B)
}

export interface TimeLogEntry {
  id: string;
  orderId: string;
  workerId: string;
  logDate: string;            // "YYYY-MM-DD"
  workStart: string;          // "HH:MM"
  workEnd: string;            // "HH:MM"
  breaks: BreakPair[];
  netHours: number;           // computed: decimal hours (e.g., 8.0)
  comment?: string;
  unitsCompleted?: number;    // only Per-Unit
  syncStatus: 'synced' | 'pending';
}

export interface TimeLogValidationError {
  field:
    | 'workStart'
    | 'workEnd'
    | 'break-overlap'
    | 'break-time'
    | 'net'
    | 'units'
    | 'date';
  message: string;
}

export interface AddTimeLogContext {
  orderId: string;
  orderNumber: string;  // e.g., "000445" — shown in header
  isPerUnit: boolean;   // controls "Виконано" row visibility
  unitLabel?: string;   // e.g., "м²" for Per-Unit orders
}
