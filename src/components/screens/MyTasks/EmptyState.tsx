// src/components/screens/MyTasks/EmptyState.tsx
// Traces to: Scenario §5.1, Figma node 74:4852 area
// Q2 answer: only [Оновити] button — no pull-to-refresh

interface EmptyStateProps {
  onRefresh: () => void;
}

export function EmptyState({ onRefresh }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6 text-center">
      {/* Illustration placeholder — 64×64 */}
      <div className="w-16 h-16 rounded-full bg-bg-input flex items-center justify-center">
        <span className="text-3xl">🎉</span>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-text-primary">
          Немає активних завдань
        </h2>
        <p className="text-[13px] text-text-secondary leading-[18px] max-w-[242px]">
          У вас немає призначених завдань на сьогодні. Відпочивайте або перевірте пізніше.
        </p>
      </div>

      {/* Оновити button — 108×40px per Figma */}
      <button
        onClick={onRefresh}
        className="w-[108px] h-10 bg-bg-input rounded-badge text-text-primary text-sm font-medium hover:opacity-80 transition-opacity"
      >
        Оновити
      </button>
    </div>
  );
}
