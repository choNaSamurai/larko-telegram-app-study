// TransactionHistory — Tech Stack § Phase 4 + Phase 6 (infinite scroll)
// Figma: section header + list, sentinel div at bottom triggers fetchNextPage

import { useRef, useEffect } from 'react';
import { TransactionRow } from './TransactionRow';
import { TransactionSkeleton } from './TransactionSkeleton';
import type { TransactionItem } from '../../../../types/balance';

interface TransactionHistoryProps {
  items: TransactionItem[];
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
}

export function TransactionHistory({
  items,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: TransactionHistoryProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver — fires fetchNextPage when sentinel enters viewport
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="px-4">
      {/* Section header — Figma node 73:52963 */}
      <h3 className="text-[14px] font-semibold text-content-primary mb-2 leading-[20px]">
        Історія операцій
      </h3>

      {/* Transaction rows */}
      <div className="bg-bg-card rounded-xl overflow-hidden px-[4px]">
        {items.length === 0 && !isFetchingNextPage ? (
          <p className="text-center text-content-secondary text-sm py-6">
            Немає операцій
          </p>
        ) : (
          <>
            {items.map((item) => (
              <TransactionRow key={item.id} item={item} />
            ))}

            {/* Loading skeleton rows for next page */}
            {isFetchingNextPage && (
              <>
                <TransactionSkeleton />
                <TransactionSkeleton />
              </>
            )}

            {/* All loaded indicator */}
            {!hasNextPage && items.length > 0 && (
              <p className="text-center text-[12px] text-content-tertiary py-4">
                Усі операції завантажено
              </p>
            )}
          </>
        )}
      </div>

      {/* Sentinel div for IntersectionObserver — Tech Stack Phase 6 */}
      <div ref={sentinelRef} className="h-1" aria-hidden="true" />
    </div>
  );
}
