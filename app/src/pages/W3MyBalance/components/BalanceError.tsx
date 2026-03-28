// BalanceError — Tech Stack § Phase 4 + Scenario §5.4
// Figma: node 85:7292 (dark) / 85:7286 (light) — error illustration + retry button

interface BalanceErrorProps {
  onRetry: () => void;
}

export function BalanceError({ onRetry }: BalanceErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center gap-4">
      {/* Error illustration — 64×64px red circle + warning icon — Figma 85:7292 */}
      <div className="size-16 rounded-full bg-status-error/15 flex items-center justify-center mb-2">
        <span className="text-[32px] leading-none" role="img" aria-label="Помилка">
          ⚠️
        </span>
      </div>

      {/* Heading */}
      <h3 className="text-[16px] font-semibold text-content-primary leading-[24px]">
        Помилка завантаження
      </h3>

      {/* Description */}
      <p className="text-[14px] text-content-secondary leading-[20px] max-w-[240px]">
        Не вдалося завантажити дані. Перевірте інтернет-з'єднання та спробуйте ще раз.
      </p>

      {/* Retry button — 175×40px, rounded-full — Figma node 83:6744 */}
      <button
        id="balance-retry-btn"
        onClick={onRetry}
        aria-label="Спробувати знову"
        className="mt-2 px-6 h-10 rounded-full bg-white text-bg-primary text-[14px] font-semibold shadow-button active:scale-95 transition-transform"
      >
        Спробувати знову
      </button>
    </div>
  );
}
