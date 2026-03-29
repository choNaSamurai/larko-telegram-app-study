// src/components/screens/MyBalance/BalanceSkeleton.tsx
// Traces to: Scenario §5.4, §8 State S1 — Loading skeleton
// Matches Figma skeleton frames: 3 card placeholders + period pills + 4 history rows

export function BalanceSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse px-0">
      {/* Stat cards row skeleton */}
      <div className="flex gap-4 px-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex-1 rounded-[20px] bg-bg-card"
            style={{ height: 86 }}
          />
        ))}
      </div>

      {/* Period filter skeleton */}
      <div className="flex gap-2 px-4">
        {[100, 96, 82].map((w, i) => (
          <div
            key={i}
            className="h-8 rounded-full bg-bg-card shrink-0"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Section header skeleton */}
      <div className="px-4">
        <div className="h-4 w-40 rounded-md bg-bg-card" />
      </div>

      {/* History rows skeleton */}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4">
          <div
            className="rounded-full bg-bg-card shrink-0"
            style={{ width: 36, height: 36 }}
          />
          <div className="flex flex-col flex-1 gap-[6px]">
            <div className="h-[14px] w-2/3 rounded-md bg-bg-card" />
            <div className="h-[12px] w-1/3 rounded-md bg-bg-card" />
          </div>
          <div className="h-[14px] w-14 rounded-md bg-bg-card" />
        </div>
      ))}
    </div>
  );
}
