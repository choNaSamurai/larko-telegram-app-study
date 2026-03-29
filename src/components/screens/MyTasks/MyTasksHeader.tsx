// src/components/screens/MyTasks/MyTasksHeader.tsx
// Traces to: Scenario §7 Header (DivPx 110:8257), height 68px, p-16px

export function MyTasksHeader() {
  return (
    // Safe-area-inset-top applied here — MANDATORY for TMA screens
    // Traces to: Scenario §12.1 Screen Header Safe Area + SKILL_TMA_IMPLEMENT §4
    <div
      className="flex items-center justify-between px-4 shrink-0 bg-bg-screen"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        minHeight: '68px',
      }}
    >
      {/* Screen title "Мої Завдання" */}
      {/* 18px SemiBold, tracking -0.5px — Scenario §12.1 Typography Table */}
      <h1
        className="text-text-primary font-semibold"
        style={{ fontSize: '18px', lineHeight: '28px', letterSpacing: '-0.5px' }}
      >
        Мої Завдання
      </h1>

      {/* Company avatar bubble — 40×40px circle, initials "СД" */}
      {/* Figma node 110:8105 */}
      <div
        className="w-10 h-10 rounded-badge bg-white flex items-center justify-center shadow-avatar shrink-0"
      >
        <span className="text-[14px] font-bold text-text-dark leading-5">СД</span>
      </div>
    </div>
  );
}
