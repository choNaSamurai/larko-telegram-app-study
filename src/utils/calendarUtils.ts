// src/utils/calendarUtils.ts
// Traces to: TECH_STACK §Utility Functions (calendarUtils), ADR-003-C

export interface CalendarDayCell {
  dayNum: number;
  isCurrentMonth: boolean;
  isoDate: string;
}

/**
 * Build 42 calendar day cells (6 rows × 7 columns) for a given year/month.
 * Week starts Monday (standard Ukrainian/EU format).
 */
export function buildCalendarDays(year: number, month: number): CalendarDayCell[] {
  const firstDay = new Date(year, month - 1, 1);
  const startDow = (firstDay.getDay() + 6) % 7; // Mon=0, Sun=6
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();

  const [prevYear, prevMonth] = month === 1 ? [year - 1, 12] : [year, month - 1];
  const [nextYear, nextMonth] = month === 12 ? [year + 1, 1] : [year, month + 1];

  const pad = (n: number) => String(n).padStart(2, '0');
  const cells: CalendarDayCell[] = [];

  // Leading prev-month days
  for (let d = startDow; d > 0; d--) {
    const dayNum = prevMonthDays - d + 1;
    cells.push({ dayNum, isCurrentMonth: false, isoDate: `${prevYear}-${pad(prevMonth)}-${pad(dayNum)}` });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ dayNum: d, isCurrentMonth: true, isoDate: `${year}-${pad(month)}-${pad(d)}` });
  }

  // Trailing next-month days — fill to 42
  let next = 1;
  while (cells.length < 42) {
    cells.push({ dayNum: next, isCurrentMonth: false, isoDate: `${nextYear}-${pad(nextMonth)}-${pad(next)}` });
    next++;
  }

  return cells;
}

const UK_MONTHS: Record<number, string> = {
  1: 'Січень', 2: 'Лютий', 3: 'Березень', 4: 'Квітень',
  5: 'Травень', 6: 'Червень', 7: 'Липень', 8: 'Серпень',
  9: 'Вересень', 10: 'Жовтень', 11: 'Листопад', 12: 'Грудень',
};

const UK_MONTH_ABBR: Record<number, string> = {
  1: 'січ', 2: 'лют', 3: 'бер', 4: 'квіт', 5: 'трав', 6: 'черв',
  7: 'лип', 8: 'серп', 9: 'вер', 10: 'жовт', 11: 'лист', 12: 'груд',
};

export function formatMonthLabel(year: number, month: number): string {
  return `${UK_MONTHS[month]} ${year}`;
}

export function formatDateDisplay(isoDate: string): string {
  const [, m, d] = isoDate.split('-').map(Number);
  return `${d} ${UK_MONTH_ABBR[m]}`;
}

export function pluralizeDays(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'день';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'дні';
  return 'днів';
}

export function formatDateRange(startDate: string, endDate: string, days: number): string {
  const [, sm, sd] = startDate.split('-').map(Number);
  const [, em, ed] = endDate.split('-').map(Number);
  const dayLabel = pluralizeDays(days);
  if (sm === em) {
    return `${sd}–${ed} ${UK_MONTH_ABBR[sm]} · ${days} ${dayLabel}`;
  }
  return `${sd} ${UK_MONTH_ABBR[sm]}–${ed} ${UK_MONTH_ABBR[em]} · ${days} ${dayLabel}`;
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}
