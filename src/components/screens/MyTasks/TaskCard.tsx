// src/components/screens/MyTasks/TaskCard.tsx
// Traces to: Scenario §7 Task Card, §12.1 spacing/color/typography tables
// ADR-001-D: route icon uses Telegram.WebApp.openLink → Google Maps

import { Icon } from '@iconify/react';
import type { Task } from '@/types/task.types';
import {
  STATUS_BORDER_COLOR,
  STATUS_BADGE_BG,
  STATUS_BADGE_TEXT_COLOR,
  STATUS_BADGE_LABEL,
} from '@/constants/statusConfig';
import { formatMoney, formatPerUnitPrice, formatDeadline } from '@/utils/formatters';

// TMA-safe navigation — ADR-001-D
// Q4 answer: open Google Maps externally via Telegram.WebApp.openLink
declare const Telegram: { WebApp: { openLink: (url: string) => void } };

function openMaps(address: string) {
  const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  try {
    Telegram.WebApp.openLink(url);
  } catch {
    // Fallback for non-TMA browser testing
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

export function TaskCard({ task, onPress }: TaskCardProps) {
  const { label: deadlineLabel, isOverdue, isTomorrow } = formatDeadline(task.deadline);

  const deadlineColorClass = isOverdue
    ? 'text-status-error'          // E-05: overdue → red #f87171
    : isTomorrow
    ? 'text-status-warning'        // Q1: tomorrow → yellow #fbbf24
    : 'text-text-primary';         // Normal → #ededed

  return (
    <div
      className="relative rounded-card overflow-hidden shadow-card shrink-0"
      style={{
        // CARD BORDER RULE: left-only. Traces to: Scenario §12.1 Card border style
        borderLeft: `2px solid ${STATUS_BORDER_COLOR[task.status]}`,
        cursor: onPress ? 'pointer' : 'default',
      }}
      onClick={onPress}
    >
      {/* Card background */}
      <div className="absolute inset-0 bg-bg-card rounded-card" />
      {/* Subtle top highlight (inner glow) */}
      <div className="absolute inset-0 rounded-[inherit] shadow-card-inner pointer-events-none" />

      {/* Content — pl-[17px] = 16px padding + 1px for border clearance */}
      <div className="relative pl-[17px] pr-4 pt-4 pb-4 flex flex-col gap-3">

        {/* ── Row 1: Title + Status Badge ─────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[16px] font-bold leading-5 text-text-primary flex-1 min-w-0">
            {task.name}
          </h3>
          {/* Status badge — Scenario §7 SpanTextLStatusSuccess */}
          <span
            className="shrink-0 rounded-badge px-[10px] py-[2px] text-[12px] font-medium leading-4 flex items-center gap-1 whitespace-nowrap"
            style={{
              background: STATUS_BADGE_BG[task.status],
              color: STATUS_BADGE_TEXT_COLOR[task.status],
            }}
          >
            {/* Dot indicator on "Новий" badge */}
            {task.status === 'new' && (
              <span
                className="inline-block w-[6px] h-[6px] rounded-full"
                style={{ background: STATUS_BADGE_TEXT_COLOR[task.status] }}
              />
            )}
            {STATUS_BADGE_LABEL[task.status]}
          </span>
        </div>

        {/* ── Row 2: Company + Address + Route icon ───────────────────────── */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-[4px] flex-1 min-w-0">
            {/* Company row */}
            <div className="flex items-center gap-[8px]">
              {/* mdi:company — Figma node 192:6198, 16×16px, #9d9d9d */}
              <Icon icon="mdi:company" width={16} height={16} className="text-text-secondary shrink-0" />
              <span className="text-[12px] font-medium leading-[15px] text-text-secondary truncate">
                {task.companyName}
              </span>
            </div>
            {/* Address row */}
            <div className="flex items-center gap-[8px]">
              {/* mdi:address-marker-outline — Figma node 192:6203, 16×16px, #9d9d9d */}
              <Icon icon="mdi:address-marker-outline" width={16} height={16} className="text-text-secondary shrink-0" />
              <span className="text-[12px] font-normal leading-5 text-text-secondary truncate">
                {task.address}
              </span>
            </div>
          </div>

          {/* Route icon — solar:route-bold, 24×24, Figma node 192:6209 */}
          {/* Q4: opens Google Maps via Telegram.WebApp.openLink */}
          <button
            onClick={() => openMaps(task.address)}
            className="shrink-0 w-6 h-6 flex items-center justify-center text-text-primary hover:opacity-70 transition-opacity"
            aria-label="Прокласти маршрут"
          >
            <Icon icon="solar:route-bold" width={24} height={24} />
          </button>
        </div>

        {/* ── Row 3: Notes chip (visible only if task.notes exists) ─────── */}
        {task.notes && (
          <div
            className="flex items-center gap-2 rounded-chip px-3 py-2"
            style={{ background: '#3e3e42', minHeight: '36px' }}  // bg-input exact
          >
            {/* majesticons:note-text — Figma node 111:8627, 20×20, #ededed */}
            <Icon
              icon="majesticons:note-text"
              width={20}
              height={20}
              className="text-text-primary shrink-0"
            />
            <span className="text-[11px] italic font-normal leading-5 text-text-primary truncate">
              {task.notes}
            </span>
          </div>
        )}

        {/* ── Row 4: Bottom info row (deadline + assignees + amount) ───────── */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Calendar icon + deadline */}
          <div className="flex items-center gap-[6px]">
            {/* Calendar icon — Figma Component 1 vector, rendered as simple icon */}
            <Icon icon="solar:calendar-line-duotone" width={16} height={16} className="text-text-secondary shrink-0" />
            <span className={`text-[12px] font-normal leading-4 ${deadlineColorClass}`}>
              {deadlineLabel}
            </span>
          </div>

          {/* Right: Assignee bubbles + Amount (or quantity + per-unit price) */}
          <div className="flex items-center gap-3">
            {/* Assignee bubbles (overlap, -8px) */}
            {task.assignees.length > 0 && (
              <div className="flex items-center">
                {task.assignees.slice(0, 3).map((assignee, idx) => (
                  <div
                    key={assignee.id}
                    className="w-5 h-5 rounded-badge flex items-center justify-center text-[9px] font-bold text-[#222226] ring-[1.5px] ring-bg-screen"
                    style={{
                      background: assignee.color,
                      marginLeft: idx > 0 ? '-6px' : '0',
                      zIndex: 10 - idx,
                      position: 'relative',
                    }}
                  >
                    {assignee.initials}
                  </div>
                ))}
              </div>
            )}

            {/* Amount — JetBrains Mono bold per Figma */}
            {task.paymentModel === 'per_unit' ? (
              <div className="flex items-center gap-[6px]">
                {/* solar:layers-linear — Figma node 114:11428, 16px, secondary */}
                <Icon icon="solar:layers-linear" width={16} height={16} className="text-text-secondary" />
                <span className="text-[14px] font-normal leading-5 text-text-secondary">
                  {task.quantity} од.
                </span>
                <span className="font-['JetBrains_Mono',_sans-serif] text-[14px] font-bold leading-5 text-text-primary">
                  {formatPerUnitPrice(task.amountPerUnit!, task.unitLabel!)}
                </span>
              </div>
            ) : (
              <span className="font-['JetBrains_Mono',_sans-serif] text-[14px] font-bold leading-5 text-text-primary">
                {formatMoney(task.amount)}
              </span>
            )}
          </div>
        </div>

        {/* ── Row 5: CTA Buttons ───────────────────────────────────────────── */}
        {/* "▶ Почати роботу" — single full-width button, Figma 192:6061 */}
        {task.hasStartButton && (
          <button
            className="w-full h-8 rounded-btn bg-bg-button shadow-btn-light flex items-center justify-center gap-1 text-text-dark font-semibold hover:opacity-90 transition-opacity"
          >
            <span className="text-[12px]">▶</span>
            <span className="text-[14px]">Почати роботу</span>
          </button>
        )}

        {/* "+ Додати" + "✓ Завершити" — two buttons side-by-side, Figma 192:6057 + 192:6064 */}
        {task.hasActionButtons && (
          <div className="flex gap-4">
            <button
              className="flex-1 h-8 rounded-btn border border-accent-primary shadow-btn-ghost text-accent-primary text-[12px] font-semibold hover:opacity-80 transition-opacity"
            >
              + Додати
            </button>
            <button
              className="flex-1 h-8 rounded-btn bg-bg-button shadow-btn-light text-text-dark text-[14px] font-semibold hover:opacity-90 transition-opacity"
            >
              ✓ Завершити
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
