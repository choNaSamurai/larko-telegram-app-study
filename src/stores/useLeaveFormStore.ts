// src/stores/useLeaveFormStore.ts
// Traces to: TECH_STACK §Zustand Stores, ADR-003-D
// W6 Leave Request Form state — validation, duration auto-calc, submit lifecycle

import { create } from 'zustand';

export interface LeaveFormErrors {
  typeId?: string;
  startDate?: string;
  endDate?: string;
}

interface LeaveFormState {
  // Form values
  typeId: string | null;
  startDate: string | null;   // ISO 'YYYY-MM-DD'
  endDate: string | null;     // ISO 'YYYY-MM-DD'
  reason: string;
  // Derived
  durationDays: number | null;
  isValid: boolean;
  // Validation
  errors: LeaveFormErrors;
  // Submit lifecycle
  isSubmitting: boolean;
  isSuccess: boolean;
  // Actions
  setTypeId: (id: string) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setReason: (text: string) => void;
  validate: () => boolean;
  reset: () => void;
  setSubmitting: (v: boolean) => void;
  setSuccess: (v: boolean) => void;
}

function calcDuration(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const diff = new Date(end + 'T00:00:00').getTime() - new Date(start + 'T00:00:00').getTime();
  return diff >= 0 ? Math.round(diff / 86400000) + 1 : null;
}

function checkIsValid(typeId: string | null, startDate: string | null, endDate: string | null): boolean {
  if (!typeId || !startDate || !endDate) return false;
  return calcDuration(startDate, endDate) !== null;
}

const INITIAL_STATE = {
  typeId: null,
  startDate: null,
  endDate: null,
  reason: '',
  durationDays: null,
  isValid: false,
  errors: {},
  isSubmitting: false,
  isSuccess: false,
};

export const useLeaveFormStore = create<LeaveFormState>((set, get) => ({
  ...INITIAL_STATE,

  setTypeId: (typeId) => set((s) => ({
    typeId,
    errors: { ...s.errors, typeId: undefined },
    isValid: checkIsValid(typeId, s.startDate, s.endDate),
  })),

  setStartDate: (startDate) => set((s) => ({
    startDate,
    durationDays: calcDuration(startDate, s.endDate),
    errors: { ...s.errors, startDate: undefined },
    isValid: checkIsValid(s.typeId, startDate, s.endDate),
  })),

  setEndDate: (endDate) => set((s) => ({
    endDate,
    durationDays: calcDuration(s.startDate, endDate),
    errors: { ...s.errors, endDate: undefined },
    isValid: checkIsValid(s.typeId, s.startDate, endDate),
  })),

  setReason: (reason) => set({ reason }),

  validate: () => {
    const { typeId, startDate, endDate } = get();
    const errors: LeaveFormErrors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!typeId) {
      errors.typeId = 'Оберіть тип відсутності';
    }
    if (!startDate) {
      errors.startDate = 'Оберіть дату початку';
    } else if (startDate < today) {
      errors.startDate = 'Не можна вибрати минулу дату';
    }
    if (!endDate) {
      errors.endDate = 'Оберіть дату закінчення';
    } else if (startDate && endDate < startDate) {
      errors.endDate = 'Дата закінчення повинна бути після дати початку';
    }

    const isValid = Object.keys(errors).length === 0;
    set({ errors, isValid });
    return isValid;
  },

  reset: () => set({ ...INITIAL_STATE }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setSuccess: (isSuccess) => set({ isSuccess }),
}));
