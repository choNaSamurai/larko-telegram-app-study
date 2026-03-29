// src/components/screens/MyBalance/NegativeBanner.tsx
// Traces to: Scenario §5.2, §7 "Negative Warning Banner" (73:53369), BR-W3-04
// Figma: mx-4, rounded-[12px], amber border, h-[78px]

import { Icon } from '@iconify/react';

interface NegativeBannerProps {
  /** Absolute value of the deficit, e.g. 4800 when remaining = -4800 */
  deficit: number;
}

export function NegativeBanner({ deficit }: NegativeBannerProps) {
  const deficitFormatted = deficit
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    // Scenario §12.1: mx-4 (16px each side), h-[78px], rounded-[12px]
    <div
      className="mx-4 rounded-[12px] flex items-center gap-3 px-4 py-[14px]"
      style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.3)',
        minHeight: 78,
      }}
    >
      {/* Warning icon badge — solar:danger-triangle-bold, amber, ADR-002-C */}
      <div
        className="rounded-full flex items-center justify-center shrink-0 self-start mt-0.5"
        style={{ width: 32, height: 32, background: 'rgba(251,191,36,0.15)' }}
      >
        <Icon icon="solar:danger-triangle-bold" width={16} color="#fbbf24" />
      </div>

      {/* Text block */}
      <div className="flex flex-col gap-[2px]">
        {/* Title: 14px Medium #ef4444 — Scenario §12.1 Typography */}
        <p className="text-[14px] font-medium leading-5" style={{ color: '#ef4444' }}>
          Від'ємний баланс
        </p>
        {/* Subtitle: 12px Regular #9d9d9d — Scenario §12.1 Typography */}
        <p className="text-[12px] font-normal leading-4 text-text-secondary">
          Аванси перевищують заробіток на ₴{deficitFormatted}
        </p>
      </div>
    </div>
  );
}
