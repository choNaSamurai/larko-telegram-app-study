// src/components/screens/MyBalance/InfoPopup.tsx
// Traces to: Scenario §5.3, §7 "Info Popup" (73:53568/73:53569), ADR-002-D
// ADR-002-D: ReactDOM.createPortal for correct layering over stat cards

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import WebApp from '@twa-dev/sdk';

interface InfoRow {
  icon: string | null;  // null = use emoji instead
  emoji?: string;
  iconBg: string;
  iconColor?: string;
  label: string;
  description: string;
}

// Figma node 73:53578/73:53588/73:53601 — exact text from Figma screenshot
const INFO_ROWS: InfoRow[] = [
  {
    icon: 'solar:arrow-up-bold',
    iconBg: 'rgba(52,211,153,0.15)',
    iconColor: '#34d399',
    label: 'Зароблено',
    description: 'Загальна сума нарахованої оплати за виконані замовлення за поточний місяць',
  },
  {
    icon: 'solar:arrow-down-bold',
    iconBg: 'rgba(96,165,250,0.15)',
    iconColor: '#60a5fa',
    label: 'Аванси',
    description: 'Сума грошей, які ви вже отримали авансом до кінця розрахункового періоду',
  },
  {
    icon: null,
    emoji: '💰',
    iconBg: 'rgba(255,255,255,0.1)',
    label: 'Залишок',
    description: "Різниця між заробленим та отриманими авансами. Якщо від'ємний — ви повинні компанії",
  },
];

interface InfoPopupProps {
  onClose: () => void;
}

export function InfoPopup({ onClose }: InfoPopupProps) {
  // ADR-002-D: Register Telegram BackButton to dismiss popup
  useEffect(() => {
    WebApp.BackButton.show();
    WebApp.BackButton.onClick(onClose);
    return () => {
      WebApp.BackButton.offClick(onClose);
      WebApp.BackButton.hide();
    };
  }, [onClose]);

  return createPortal(
    // Fixed backdrop covers entire viewport — click anywhere outside card to close
    <div
      className="fixed inset-0 z-50 flex flex-col"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Розрахунок балансу"
    >
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Info card — positioned below header (mt-[84px]), 16px margins */}
      {/* Scenario §12.1: mx-4, rounded-[12px], p-[17px] */}
      <div
        className="relative mx-4 mt-[84px] bg-bg-card rounded-[12px] p-[17px] flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Popup title: 14px SemiBold — Scenario §12.1 Typography */}
        <p className="text-[14px] font-semibold leading-5 text-text-primary">
          Розрахунок балансу
        </p>

        {/* Explanation rows — gap-3 (12px) — Scenario §12.1 "Info Popup row gap" */}
        <div className="flex flex-col gap-3">
          {INFO_ROWS.map((row, idx) => (
            <div key={idx} className="flex items-start gap-3">
              {/* Icon badge: 28px — Scenario §7 "Info row" */}
              <div
                className="rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ width: 28, height: 28, background: row.iconBg }}
              >
                {row.emoji ? (
                  <span className="text-[12px] leading-none select-none">{row.emoji}</span>
                ) : (
                  <Icon icon={row.icon!} width={14} height={14} color={row.iconColor} />
                )}
              </div>

              {/* Label + description */}
              <div className="flex flex-col gap-[2px]">
                {/* Label: 14px Regular #ededed — Scenario §12.1 */}
                <p className="text-[14px] font-normal leading-5 text-text-primary">
                  {row.label}
                </p>
                {/* Description: 12px Regular #9d9d9d — Scenario §12.1 */}
                <p className="text-[12px] font-normal leading-4 text-text-secondary">
                  {row.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
