// src/components/screens/OrderHub/OrderHubSkeleton.tsx
// Loading skeleton shown while order data fetches

export function OrderHubSkeleton() {
  return (
    <div
      className="flex flex-col h-full bg-bg-screen"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Header skeleton */}
      <div className="flex items-center gap-3 px-4 py-4 shrink-0">
        <div className="w-[40px] h-[40px] rounded-full bg-bg-card animate-pulse" />
        <div className="w-[160px] h-[20px] rounded-[8px] bg-bg-card animate-pulse" />
      </div>

      {/* Scrollable content skeleton */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3 pb-6 px-4">
          {/* Order info card skeleton */}
          <div className="bg-bg-card rounded-card p-4 flex flex-col gap-3 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="w-2/3 h-[40px] rounded-[8px] bg-bg-input" />
              <div className="w-[80px] h-[22px] rounded-full bg-bg-input" />
            </div>
            <div className="flex justify-between">
              <div className="w-[120px] h-[15px] rounded-[6px] bg-bg-input" />
              <div className="w-[80px] h-[28px] rounded-[8px] bg-bg-input" />
            </div>
          </div>

          {/* Description card skeleton */}
          <div className="bg-bg-input rounded-[16px] p-4 flex flex-col gap-2 animate-pulse">
            <div className="w-full h-[72px] rounded-[8px] bg-bg-card" />
            <div className="w-[80px] h-[13px] rounded-[6px] bg-bg-card mx-auto" />
          </div>

          {/* Time tracking card skeleton */}
          <div
            className="bg-bg-card rounded-card p-[17px] flex flex-col gap-3 animate-pulse"
            style={{ border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="w-[80px] h-[20px] rounded-[8px] bg-bg-input" />
            <div className="w-[100px] h-[28px] rounded-[8px] bg-bg-input" />
            <div className="flex gap-3">
              <div className="w-[72px] h-8 rounded-[32px] bg-bg-input" />
              <div className="flex-1 h-8 rounded-[32px] bg-bg-input" />
            </div>
          </div>

          {/* Photo card skeleton */}
          <div
            className="bg-bg-card rounded-card p-[17px] flex flex-col gap-3 animate-pulse"
            style={{ border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="w-[120px] h-[20px] rounded-[8px] bg-bg-input" />
            <div className="flex gap-2">
              <div className="w-[80px] h-[80px] rounded-[20px] bg-bg-input" />
              <div className="w-[80px] h-[80px] rounded-[20px] bg-bg-input" />
              <div className="w-[75px] h-[80px] rounded-[20px] bg-bg-input" />
            </div>
          </div>

          {/* Map skeleton */}
          <div className="h-[100px] rounded-card bg-bg-card animate-pulse" />
        </div>
      </div>
    </div>
  );
}
