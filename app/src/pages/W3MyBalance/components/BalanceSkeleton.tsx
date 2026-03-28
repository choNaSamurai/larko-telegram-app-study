// BalanceSkeleton — full-screen shimmer (header area + stat cards + history rows)
// Tech Stack § Phase 4 + Scenario §5.5
// Matches Figma loading nodes 87:7528 (dark) / 87:7493 (light)

export function BalanceSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 animate-pulse">
      {/* Stat Cards skeleton — 3 cards × 86px */}
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-1 h-[86px] bg-bg-card rounded-xl" />
        ))}
      </div>

      {/* Transaction history skeleton */}
      <div className="flex flex-col gap-0">
        {/* Section header shimmer */}
        <div className="h-[20px] w-[120px] bg-bg-card rounded-md mb-3" />

        {/* Row skeletons — 3 cards matching Figma loading state */}
        <div className="bg-bg-card rounded-xl overflow-hidden px-[4px]">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-[12px] border-b border-white/[0.05] last:border-b-0"
            >
              <div className="size-9 rounded-full bg-white/10 shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div
                  className="h-[14px] bg-white/10 rounded-md"
                  style={{ width: `${[65, 55, 70, 50][i]}%` }}
                />
                <div
                  className="h-[12px] bg-white/8 rounded-md"
                  style={{ width: `${[40, 45, 35, 42][i]}%` }}
                />
              </div>
              <div className="h-[14px] w-14 bg-white/10 rounded-md shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
