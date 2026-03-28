// TransactionSkeleton — shimmer placeholder row while isFetchingNextPage
// Matches TransactionRow height (61px) per Tech Stack Phase 6

export function TransactionSkeleton() {
  return (
    <div className="flex items-center gap-3 py-[12px] animate-pulse">
      {/* Circle icon shimmer */}
      <div className="size-9 rounded-full bg-white/10 shrink-0" />

      {/* Text shimmer */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-[14px] w-3/5 bg-white/10 rounded-md" />
        <div className="h-[12px] w-2/5 bg-white/8 rounded-md" />
      </div>

      {/* Amount shimmer */}
      <div className="h-[14px] w-14 bg-white/10 rounded-md shrink-0" />
    </div>
  );
}
