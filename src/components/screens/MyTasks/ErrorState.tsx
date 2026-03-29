// src/components/screens/MyTasks/ErrorState.tsx
// Traces to: Scenario §5.2, Figma node 83:6234 area

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6 text-center">
      {/* Error icon — 64×64 wrapper, Figma node 83:6234 */}
      <div className="w-16 h-16 rounded-full bg-bg-input flex items-center justify-center">
        <span className="text-3xl">⚠️</span>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-text-primary">
          Помилка завантаження
        </h2>
        <p className="text-[13px] text-text-secondary leading-[18px] max-w-[260px]">
          Не вдалося завантажити завдання. Перевірте інтернет-з'єднання та спробуйте ще раз.
        </p>
      </div>

      {/* 175×40px per Figma */}
      <button
        onClick={onRetry}
        className="w-[175px] h-10 bg-bg-input rounded-badge text-text-primary text-sm font-medium hover:opacity-80 transition-opacity"
      >
        Спробувати знову
      </button>
    </div>
  );
}
