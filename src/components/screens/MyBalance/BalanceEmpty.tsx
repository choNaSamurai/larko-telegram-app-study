// src/components/screens/MyBalance/BalanceEmpty.tsx
// Traces to: Scenario §5.1, §8 State S4, BR-W3-10
// Figma nodes: 73:53214 (📊 emoji), 73:53218 (title), 73:53220 (subtitle), 291:16059 (CTA)

interface BalanceEmptyProps {
  onGoToTasks: () => void; // BR-W3-10: CTA navigates to W1 My Tasks
}

export function BalanceEmpty({ onGoToTasks }: BalanceEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-8 py-8">
      {/* Illustration: 📊 emoji — Figma: centered, 48×72px */}
      <span className="text-[64px] leading-none select-none" aria-hidden="true">
        📊
      </span>

      {/* Text block */}
      <div className="flex flex-col items-center gap-2 text-center">
        {/* Title: 16px SemiBold #ededed — Scenario §12.1 Typography */}
        <p className="text-[16px] font-semibold leading-6 text-text-primary">
          Ще немає заробітку
        </p>
        {/* Subtitle: 14px Regular #9d9d9d, max-w-[245px] — Scenario §12.1 */}
        <p className="text-[14px] font-normal leading-5 text-text-secondary max-w-[245px]">
          Завершіть перше замовлення і ваш баланс з'явиться тут
        </p>
      </div>

      {/* CTA: full-width white button → W1 My Tasks (BR-W3-10) */}
      <button
        onClick={onGoToTasks}
        className="w-full max-w-[326px] h-12 bg-white rounded-[32px] text-text-dark font-semibold text-[14px] leading-6 shadow-btn-light transition-opacity active:opacity-80"
      >
        Переглянути замовлення
      </button>
    </div>
  );
}
