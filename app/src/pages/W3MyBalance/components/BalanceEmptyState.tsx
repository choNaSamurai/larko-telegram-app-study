// BalanceEmptyState — Tech Stack § Phase 4 + Scenario §5.2
// Figma: node 73:53215 — 📊 emoji + heading + CTA to W1
// CTA: "Переглянути завдання" — navigates to Tasks tab

interface BalanceEmptyStateProps {
  onNavigateToTasks: () => void;
}

export function BalanceEmptyState({ onNavigateToTasks }: BalanceEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center gap-4">
      {/* Emoji illustration — 48×72px per Figma node 73:53215 */}
      <div className="mb-2">
        <span
          className="text-[56px] leading-none"
          role="img"
          aria-label="Графік"
        >
          📊
        </span>
      </div>

      {/* Heading */}
      <h3 className="text-[16px] font-semibold text-content-primary leading-[24px]">
        Ще немає заробітку
      </h3>

      {/* Description */}
      <p className="text-[14px] text-content-secondary leading-[20px] max-w-[200px]">
        Завершіть перше замовлення і ваш баланс з'явиться тут
      </p>

      {/* CTA Button — 207×44px, rounded-full — Figma node 73:53222 */}
      <button
        id="balance-empty-cta-btn"
        onClick={onNavigateToTasks}
        aria-label="Переглянути завдання"
        className="mt-2 px-6 h-11 rounded-full bg-white text-bg-primary text-[14px] font-semibold shadow-button active:scale-95 transition-transform min-w-[207px]"
      >
        Переглянути завдання
      </button>
    </div>
  );
}
