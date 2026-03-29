// src/components/screens/Profile/ProfileSkeleton.tsx
// Traces to: Scenario §5.5, §8 Loading State

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center animate-pulse" style={{ paddingTop: 40, paddingBottom: 24, paddingLeft: 20, paddingRight: 20 }}>
      {/* Avatar skeleton */}
      <div className="w-20 h-20 rounded-full" style={{ background: '#2d2d31' }} />
      {/* Name skeleton */}
      <div className="mt-3 h-7 w-40 rounded-lg" style={{ background: '#2d2d31' }} />
      {/* Company skeleton */}
      <div className="mt-2 h-5 w-28 rounded-lg" style={{ background: '#2d2d31' }} />
      {/* Options card skeleton */}
      <div
        className="w-full mt-6 rounded-[20px]"
        style={{ height: 220, background: '#2d2d31' }}
      />
    </div>
  );
}
