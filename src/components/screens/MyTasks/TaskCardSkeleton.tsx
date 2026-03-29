// src/components/screens/MyTasks/TaskCardSkeleton.tsx
// Traces to: Scenario §8 Loading state, Figma nodes 74:4885 / 74:4931

export function TaskCardSkeleton() {
  return (
    <div className="rounded-card bg-bg-card shadow-card p-4 flex flex-col gap-3 shrink-0">
      {/* Title row */}
      <div className="flex items-center justify-between gap-3">
        <div className="skeleton h-4 rounded flex-1 max-w-[60%]" />
        <div className="skeleton h-5 w-[90px] rounded-badge" />
      </div>

      {/* Company + address row */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="skeleton w-4 h-4 rounded" />
          <div className="skeleton h-3 w-[140px] rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="skeleton w-4 h-4 rounded" />
          <div className="skeleton h-3 w-[100px] rounded" />
        </div>
      </div>

      {/* Notes chip */}
      <div className="skeleton h-9 rounded-chip" />

      {/* Deadline + amount row */}
      <div className="flex items-center justify-between">
        <div className="skeleton h-3 w-[100px] rounded" />
        <div className="skeleton h-4 w-[70px] rounded" />
      </div>

      {/* CTA button */}
      <div className="skeleton h-8 rounded-btn" />
    </div>
  );
}
