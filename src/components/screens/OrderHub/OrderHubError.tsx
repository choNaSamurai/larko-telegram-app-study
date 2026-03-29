// src/components/screens/OrderHub/OrderHubError.tsx
// Error state — shown when fetchOrderById fails

import { Icon } from '@iconify/react';

interface OrderHubErrorProps {
  onRetry: () => void;
}

export function OrderHubError({ onRetry }: OrderHubErrorProps) {
  return (
    <div
      className="flex flex-col h-full bg-bg-screen items-center justify-center gap-4 px-8"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(248,113,113,0.1)' }}
      >
        <Icon icon="solar:danger-triangle-bold" width={32} color="#f87171" />
      </div>
      <div className="text-center">
        <h2
          className="text-text-primary font-semibold text-[17px] leading-[20.4px] mb-1"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Помилка завантаження
        </h2>
        <p
          className="text-text-secondary text-[15px] leading-[18px]"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
        >
          Не вдалося завантажити дані замовлення
        </p>
      </div>
      <button
        onClick={onRetry}
        className="h-[42px] px-8 rounded-[32px] flex items-center gap-2"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        <Icon icon="solar:refresh-bold" width={18} color="#ededed" />
        <span
          className="text-text-primary text-[15px] font-medium"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Спробувати знову
        </span>
      </button>
    </div>
  );
}
