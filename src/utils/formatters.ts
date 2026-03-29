// src/utils/formatters.ts
// Traces to: Scenario §12.1 Price/Number Formats, §9 BR-W1-04

/**
 * Format monetary amount — MUST match Figma: ₴12,400 (comma thousands separator)
 * NEVER use toLocaleString('uk-UA') → returns "12 400" (space separator — WRONG)
 */
export function formatMoney(amount: number, currency = '₴'): string {
  return `${currency}${Math.floor(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Format per-unit price: ₴400/шт
 * Traces to: Scenario §12.1 Price/Number Formats (Per-unit variant)
 */
export function formatPerUnitPrice(
  amount: number,
  unit: string,
  currency = '₴',
): string {
  return `${currency}${Math.floor(amount)}/${unit}`;
}

const MONTHS_UK = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня',
] as const;

/**
 * Format deadline to Ukrainian short label "До 25 березня"
 * Also derives overdue/tomorrow flags for color coding.
 * Traces to: Scenario §9 BR-W1-04 — tomorrow → yellow, overdue → red
 */
export function formatDeadline(isoDate: string): {
  label: string;
  isOverdue: boolean;
  isTomorrow: boolean;
} {
  const deadline = new Date(isoDate);
  const today = new Date();

  // Normalize to midnight local time for day comparison
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  const label = `До ${deadline.getDate()} ${MONTHS_UK[deadline.getMonth()]}`;

  return {
    label,
    isOverdue: diffDays < 0,
    isTomorrow: diffDays === 1, // Q1: tomorrow deadline → yellow warning color
  };
}

/**
 * Format SIGNED balance history amount.
 * Earned/Overtime → "+₴4,050" (green text)
 * Advance         → "−₴5,000" (blue text, Unicode minus U+2212)
 * Zero            → "₴0"
 *
 * CRITICAL: Use Unicode minus U+2212 (−), NOT ASCII hyphen (-).
 * Traces to: Scenario §12.1 Price/Number Formats, Tech Stack §Utility Functions
 */
export function formatSignedMoney(amount: number, currency = '₴'): string {
  const abs = Math.abs(Math.floor(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (amount > 0) return `+${currency}${abs}`;
  if (amount < 0) return `\u2212${currency}${abs}`; // U+2212 true minus sign
  return `${currency}0`;
}

/**
 * Format period label for balance header subtitle.
 * The API provides a periodLabel; this is a fallback for loading/uninitialized.
 * Traces to: Scenario §12.1, §1 Screen Overview
 */
export function formatPeriodLabel(
  period: 'week' | 'month' | 'all',
  apiLabel?: string,
): string {
  if (apiLabel) return apiLabel;
  const now = new Date();
  const monthName = now.toLocaleString('uk', { month: 'long', year: 'numeric' });
  const map: Record<string, string> = {
    week:  'Поточний тиждень',
    month: monthName,
    all:   'Весь час',
  };
  return map[period] ?? 'Березень 2026';
}

/**
 * Format hours for Order Hub time tracking: 5 → "5.0 год"
 * Traces to: SCREEN_Order_Hub scenario §12.1 Price/Number Formats
 */
export function formatHours(hours: number): string {
  return `${hours.toFixed(1)} год`;
}

/**
 * Format dispute creation timestamp: "2026-03-24T09:15:00Z" → "24 бер, 09:15"
 * Traces to: SCREEN_Order_Hub scenario §7 (dispute_banner meta text)
 */
export function formatDisputeDate(isoString: string): string {
  const date = new Date(isoString);
  const months = [
    'січ', 'лют', 'бер', 'квіт', 'трав', 'чер',
    'лип', 'серп', 'вер', 'жовт', 'лист', 'груд',
  ] as const;
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${date.getDate()} ${months[date.getMonth()]}, ${hh}:${mm}`;
}

