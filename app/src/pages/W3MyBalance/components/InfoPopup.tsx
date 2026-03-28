// InfoPopup — Tech Stack § Phase 7 + Scenario §5.1
// Figma: node 73:53569 (dark) / 73:53671 (light) — 358×327px, rounded-2xl
// Dismissed by: tap outside (backdrop) or scroll

import { useEffect, useRef } from 'react';

interface InfoPopupProps {
  onClose: () => void;
}

const INFO_ROWS = [
  {
    icon: '📈',
    label: 'Зароблено',
    description:
      'Загальна сума нарахованої оплати за виконані замовлення за поточний місяць',
    colorClass: 'text-status-success',
    bgClass: 'bg-status-success/15',
  },
  {
    icon: '💸',
    label: 'Аванси',
    description:
      'Сума грошей, які ви вже отримали авансом до кінця розрахункового періоду',
    colorClass: 'text-status-info',
    bgClass: 'bg-status-info/15',
  },
  {
    icon: '💰',
    label: 'Залишок',
    description:
      "Різниця між заробленим та отриманими авансами. Якщо від'ємний — ви повинні компанії",
    colorClass: 'text-content-primary',
    bgClass: 'bg-white/10',
  },
] as const;

export function InfoPopup({ onClose }: InfoPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Scroll dismiss: close when page scrolls more than 10px
  useEffect(() => {
    let startScrollY = window.scrollY;

    const handleScroll = () => {
      if (Math.abs(window.scrollY - startScrollY) > 10) {
        onClose();
      }
    };

    const handleTouchStart = () => {
      startScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [onClose]);

  return (
    <>
      {/* Backdrop — tap outside to close */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Popup Card — 358px wide, positioned below header (top-[84px]) */}
      <div
        ref={popupRef}
        className="absolute top-[84px] left-4 right-4 z-50 bg-bg-card rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/8 animate-[fadeSlideDown_0.2s_ease-out]"
        role="dialog"
        aria-modal="true"
        aria-label="Розрахунок балансу"
      >
        <div className="p-4">
          {/* Title */}
          <h4 className="text-[14px] font-semibold text-content-primary mb-4 leading-[20px]">
            Розрахунок балансу
          </h4>

          {/* 3 explanation rows */}
          <div className="flex flex-col gap-4">
            {INFO_ROWS.map((row) => (
              <div key={row.label} className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`size-7 rounded-lg ${row.bgClass} flex items-center justify-center shrink-0 mt-[1px]`}
                >
                  <span className="text-[14px] leading-none">{row.icon}</span>
                </div>

                {/* Text block */}
                <div className="flex flex-col gap-1">
                  <p className={`text-[14px] font-medium ${row.colorClass} leading-[20px]`}>
                    {row.label}
                  </p>
                  <p className="text-[12px] text-content-secondary leading-[18px]">
                    {row.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
