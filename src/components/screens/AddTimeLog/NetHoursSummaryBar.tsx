// src/components/screens/AddTimeLog/NetHoursSummaryBar.tsx
// Traces to: Scenario §7 — "Відпрацьовано" summary bar, Figma node 255:11134
// Green summary bar showing computed net hours (and units for Per-Unit variant)

interface NetHoursSummaryBarProps {
  netMinutes: number;
  isPerUnit?: boolean;
  unitsCompleted?: number;
  unitLabel?: string;
}

export function NetHoursSummaryBar({
  netMinutes,
  isPerUnit = false,
  unitsCompleted,
  unitLabel = 'м²',
}: NetHoursSummaryBarProps) {
  const hours = netMinutes > 0 ? netMinutes / 60 : 0;
  const hoursStr = `${hours.toFixed(1)} год`;

  // Variant B: "8.0 год • 130 м²"
  const valueStr = isPerUnit
    ? `${hoursStr} • ${Math.round(unitsCompleted ?? 0)} ${unitLabel}`
    : hoursStr;

  return (
    <div
      className="flex items-center justify-between w-full"
      style={{
        background: 'rgba(52,211,153,0.1)',
        borderRadius: 16,
        height: 56,
        paddingInline: 16,
      }}
    >
      {/* Left: label — Inter Regular 17px */}
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 17,
          fontWeight: 400,
          lineHeight: '20.4px',
          letterSpacing: '-0.43px',
          color: '#ededed',
        }}
      >
        {isPerUnit ? 'Підсумок' : 'Відпрацьовано'}
      </span>

      {/* Right: computed value — Space Grotesk Medium 24px #34d399 */}
      <span
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 24,
          fontWeight: 500,
          lineHeight: '28.8px',
          color: '#34d399',
        }}
      >
        {valueStr}
      </span>
    </div>
  );
}
