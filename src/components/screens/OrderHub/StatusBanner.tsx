// src/components/screens/OrderHub/StatusBanner.tsx
// Traces to: Scenario §5 Alternative Flows, §7 UI Elements (overdue/checking/locked banners)
// Renders ONE of: overdue, checking, locked banners (NOT dispute — that's DisputeResponseForm)

import { Icon } from '@iconify/react';

export type BannerVariant = 'overdue' | 'checking' | 'locked';

interface StatusBannerProps {
  variant: BannerVariant;
  daysOverdue?: number;  // used by 'overdue' variant
}

const BANNER_CONFIG: Record<
  BannerVariant,
  {
    icon: string;
    iconColor: string;
    bg: string;
    border: string;
    getText: (days?: number) => string;
    pill: boolean; // overdue is a narrow pill, others are full-card
  }
> = {
  overdue: {
    icon: 'solar:danger-triangle-bold',
    iconColor: '#f87171',
    bg: 'rgba(248,113,113,0.12)',
    border: '#f87171',
    getText: (days) => `Прострочено на ${days ?? 3} ${getDaysLabel(days ?? 3)}`,
    pill: true,
  },
  checking: {
    icon: 'solar:info-circle-bold',
    iconColor: '#60a5fa',
    bg: 'rgba(96,165,250,0.12)',
    border: '#60a5fa',
    getText: () => 'Менеджер повинен підтвердити виконання замовлення',
    pill: false,
  },
  locked: {
    icon: 'solar:lock-bold',
    iconColor: '#34d399',
    bg: 'rgba(52,211,153,0.12)',
    border: '#34d399',
    getText: () => 'Замовлення завершено. Дані доступні лише для перегляду.',
    pill: false,
  },
};

function getDaysLabel(days: number): string {
  if (days === 1) return 'день';
  if (days >= 2 && days <= 4) return 'дні';
  return 'днів';
}

export function StatusBanner({ variant, daysOverdue }: StatusBannerProps) {
  const cfg = BANNER_CONFIG[variant];
  const text = cfg.getText(daysOverdue);

  if (cfg.pill) {
    // Overdue: narrow pill banner (rounded-full style)
    return (
      <div
        className="mx-4 h-[42px] rounded-[32px] flex items-center gap-3 px-4"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      >
        <Icon icon={cfg.icon} width={18} color={cfg.iconColor} />
        <span
          className="text-[15px] leading-[18px] tracking-[-0.23px]"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, color: cfg.iconColor }}
        >
          {text}
        </span>
      </div>
    );
  }

  // Checking / Locked: full-width card-style banner
  return (
    <div
      className="mx-4 rounded-[20px] flex items-center gap-3 px-4 py-3"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <Icon icon={cfg.icon} width={18} color={cfg.iconColor} />
      <p
        className="text-text-primary text-[15px] leading-[18px] tracking-[-0.23px] flex-1"
        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
      >
        {text}
      </p>
    </div>
  );
}
