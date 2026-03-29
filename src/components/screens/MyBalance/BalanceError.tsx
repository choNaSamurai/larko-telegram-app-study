// src/components/screens/MyBalance/BalanceError.tsx
// Traces to: Scenario §5.5, §8 State S6 — API failure error state

interface BalanceErrorProps {
  onRetry: () => void;
}

export function BalanceError({ onRetry }: BalanceErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-8">
      <span className="text-[48px] leading-none select-none" aria-hidden="true">⚠️</span>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-[16px] font-semibold leading-6 text-text-primary">
          Помилка завантаження
        </p>
        <p className="text-[14px] font-normal leading-5 text-text-secondary">
          Не вдалося отримати дані балансу
        </p>
      </div>
      <button
        onClick={onRetry}
        className="px-8 h-10 bg-bg-card border border-[rgba(255,255,255,0.08)] rounded-full text-text-primary text-[14px] font-medium transition-opacity active:opacity-70"
      >
        Спробувати знову
      </button>
    </div>
  );
}
