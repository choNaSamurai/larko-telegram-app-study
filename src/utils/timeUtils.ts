// src/utils/timeUtils.ts
// Traces to: Tech Stack §timeUtils.ts, Scenario BR-TL-002, BR-TL-003, BR-TL-004

import type { BreakPair } from '@/types/timeLog.types';

/**
 * Parse "HH:MM" to total minutes from midnight.
 */
export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

/**
 * Calculate net worked minutes.
 * Handles midnight-crossing shifts: if end < start → adds 24*60 (BR-TL-003).
 * Returns 0 if inputs are invalid.
 *
 * Test: calculateNetMinutes('08:00','17:00',[{id:'b1',breakStart:'12:00',breakEnd:'13:00'}]) === 480
 * Test: calculateNetMinutes('23:00','07:00',[]) === 480 (midnight)
 */
export function calculateNetMinutes(
  workStart: string,
  workEnd: string,
  breaks: BreakPair[]
): number {
  if (!workStart || !workEnd) return 0;

  let start = parseTimeToMinutes(workStart);
  let end = parseTimeToMinutes(workEnd);

  // Midnight-crossing shift (BR-TL-003)
  if (end <= start) {
    end += 24 * 60;
  }

  const grossMinutes = end - start;

  const breakMinutes = breaks.reduce((acc, b) => {
    if (!b.breakStart || !b.breakEnd) return acc;
    let bStart = parseTimeToMinutes(b.breakStart);
    let bEnd = parseTimeToMinutes(b.breakEnd);
    if (bEnd <= bStart) bEnd += 24 * 60; // break spanning midnight
    return acc + Math.max(0, bEnd - bStart);
  }, 0);

  return Math.max(0, grossMinutes - breakMinutes);
}

/**
 * Format decimal minutes to hours string for display.
 * 480 min → "8.0 год" | 150 min → "2.5 год"
 * Traces to: Scenario §12.1 Price/Number Formats
 */
export function formatHours(minutes: number): string {
  if (minutes <= 0) return '0.0 год';
  const hours = minutes / 60;
  return `${hours.toFixed(1)} год`;
}

/**
 * Format today's date as Ukrainian display string.
 * Today → "сьогодні, 27 березня" | Other → "27 березня"
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const dayMonth = date.toLocaleString('uk', { day: 'numeric', month: 'long' });
  return isToday ? `сьогодні, ${dayMonth}` : dayMonth;
}

/**
 * Get today's date in YYYY-MM-DD format.
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Validate break pairs — no overlap, end after start.
 * Returns null if valid, or an error message string.
 * Traces to: Scenario BR-TL-004
 */
export function validateBreaks(breaks: BreakPair[]): string | null {
  const parsed = breaks
    .filter((b) => b.breakStart && b.breakEnd)
    .map((b) => {
      const start = parseTimeToMinutes(b.breakStart);
      let end = parseTimeToMinutes(b.breakEnd);
      if (end <= start) end += 24 * 60;
      return { id: b.id, start, end };
    });

  for (const b of parsed) {
    if (b.end <= b.start) {
      return 'Кінець перерви має бути після початку';
    }
  }

  for (let i = 0; i < parsed.length; i++) {
    for (let j = i + 1; j < parsed.length; j++) {
      const a = parsed[i];
      const bj = parsed[j];
      if (a.start < bj.end && bj.start < a.end) {
        return 'Перерви перетинаються';
      }
    }
  }

  return null;
}

/**
 * Format units completed for display.
 * 130 → "130 м²" | 0 → "0 м²"
 * Traces to: Scenario §12.1 — "0 м²", "130 м²"
 */
export function formatUnits(value: number, label = 'м²'): string {
  return `${Math.round(value)} ${label}`;
}

/**
 * Returns overtime color based on net hours vs threshold.
 * Traces to: Scenario §7 TimeEntryCard, §8 Overtime State
 */
export function getHoursColor(netHours: number, overtimeThreshold = 8): string {
  return netHours > overtimeThreshold
    ? '#fbbf24'  // --status-warning (overtime)
    : '#34d399'; // --status-success (normal)
}
