// src/hooks/useTimeLogForm.ts
// Traces to: Tech Stack §useTimeLogForm.ts, Scenario §4 Main Flow, ADR-005-B
// Custom hook: form state + live net hours computation + validation

import { useState, useMemo, useCallback } from 'react';
import type {
  TimeLogFormState,
  BreakPair,
  TimeLogValidationError,
} from '@/types/timeLog.types';
import {
  calculateNetMinutes,
  validateBreaks,
  getTodayISO,
} from '@/utils/timeUtils';

const MAX_BREAKS = 5; // BR-TL-004

// Simple ID generator (avoids nanoid dependency)
let breakIdCounter = 0;
function genBreakId(): string {
  return `break-${Date.now()}-${++breakIdCounter}`;
}

export interface UseTimeLogFormReturn {
  form: TimeLogFormState;
  /** Net worked time in minutes — live-computed */
  netMinutes: number;
  /** True when all required fields are valid */
  isValid: boolean;
  errors: TimeLogValidationError[];
  setDate: (date: string) => void;
  setWorkStart: (time: string) => void;
  setWorkEnd: (time: string) => void;
  addBreak: () => void;
  removeBreak: (id: string) => void;
  updateBreak: (id: string, field: 'breakStart' | 'breakEnd', value: string) => void;
  setComment: (text: string) => void;
  setUnitsCompleted: (n: number) => void;
  canAddBreak: boolean;
}

export function useTimeLogForm(isPerUnit: boolean): UseTimeLogFormReturn {
  const [form, setForm] = useState<TimeLogFormState>({
    logDate: getTodayISO(),
    workStart: '08:00',
    workEnd: '17:00',
    breaks: [],
    comment: '',
    unitsCompleted: isPerUnit ? 0 : undefined,
  });

  // ── Derived: net minutes (live-computed on every field change) ──
  const netMinutes = useMemo(
    () => calculateNetMinutes(form.workStart, form.workEnd, form.breaks),
    [form.workStart, form.workEnd, form.breaks]
  );

  // ── Derived: validation errors ──
  const errors = useMemo<TimeLogValidationError[]>(() => {
    const errs: TimeLogValidationError[] = [];

    if (!form.workStart) {
      errs.push({ field: 'workStart', message: 'Час початку обовʼязковий' });
    }
    if (!form.workEnd) {
      errs.push({ field: 'workEnd', message: 'Час закінчення обовʼязковий' });
    }
    if (netMinutes <= 0) {
      errs.push({ field: 'net', message: 'Час роботи має бути більше 0 хвилин' });
    }

    const breakErr = validateBreaks(form.breaks);
    if (breakErr) {
      errs.push({ field: 'break-overlap', message: breakErr });
    }

    if (isPerUnit && form.unitsCompleted !== undefined && form.unitsCompleted < 0) {
      errs.push({ field: 'units', message: 'Кількість виконаних одиниць ≥ 0' });
    }

    return errs;
  }, [netMinutes, form.breaks, isPerUnit, form.unitsCompleted, form.workStart, form.workEnd]);

  const isValid = errors.length === 0;

  // ── Setters (stable references via useCallback) ──
  const setDate = useCallback((date: string) => {
    setForm((f) => ({ ...f, logDate: date }));
  }, []);

  const setWorkStart = useCallback((time: string) => {
    setForm((f) => ({ ...f, workStart: time }));
  }, []);

  const setWorkEnd = useCallback((time: string) => {
    setForm((f) => ({ ...f, workEnd: time }));
  }, []);

  const addBreak = useCallback(() => {
    setForm((f) => ({
      ...f,
      breaks: [
        ...f.breaks,
        { id: genBreakId(), breakStart: '', breakEnd: '' } as BreakPair,
      ],
    }));
  }, []);

  const removeBreak = useCallback((id: string) => {
    setForm((f) => ({ ...f, breaks: f.breaks.filter((b) => b.id !== id) }));
  }, []);

  const updateBreak = useCallback(
    (id: string, field: 'breakStart' | 'breakEnd', value: string) => {
      setForm((f) => ({
        ...f,
        breaks: f.breaks.map((b) =>
          b.id === id ? { ...b, [field]: value } : b
        ),
      }));
    },
    []
  );

  const setComment = useCallback((text: string) => {
    setForm((f) => ({ ...f, comment: text }));
  }, []);

  const setUnitsCompleted = useCallback((n: number) => {
    setForm((f) => ({ ...f, unitsCompleted: Math.max(0, n) }));
  }, []);

  return {
    form,
    netMinutes,
    isValid,
    errors,
    setDate,
    setWorkStart,
    setWorkEnd,
    addBreak,
    removeBreak,
    updateBreak,
    setComment,
    setUnitsCompleted,
    canAddBreak: form.breaks.length < MAX_BREAKS,
  };
}
