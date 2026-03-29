// src/components/screens/OrderHub/DescriptionPanel.tsx
// Traces to: Scenario §4 Step 3 Block 2, §7 UI Elements (description_card, expand_details_btn)

import { useState } from 'react';
import { Icon } from '@iconify/react';

interface DescriptionPanelProps {
  notes: string;
}

const MAX_COLLAPSED_CHARS = 150;

export function DescriptionPanel({ notes }: DescriptionPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = notes.length > MAX_COLLAPSED_CHARS;
  const displayText =
    expanded || !isLong ? notes : notes.slice(0, MAX_COLLAPSED_CHARS) + '...';

  return (
    // bg-bg-input = #3e3e42, rounded-[16px] = card-sm, p-4
    <div className="mx-4 bg-bg-input rounded-[16px] p-4 flex flex-col gap-3 overflow-hidden">
      {/* Top row: note icon + italic text */}
      <div className="flex gap-2 items-start">
        {/* majesticons:note-text — exact from Figma data-name, 20px */}
        <Icon
          icon="majesticons:note-text"
          width={20}
          className="shrink-0 mt-[1px]"
          color="#ededed"
        />
        {/* Italic body text — Inter Regular 15px italic */}
        {/* Traces to: §12.1 Body/Medium 15px */}
        <p
          className="text-text-primary text-[15px] leading-[18px] tracking-[-0.23px] whitespace-pre-wrap flex-1"
          style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 400 }}
        >
          {displayText}
        </p>
      </div>

      {/* Expand/collapse trigger — only shown when text is long */}
      {isLong && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-2 justify-center w-full"
          aria-expanded={expanded}
          aria-label={expanded ? 'Згорнути опис' : 'Розгорнути опис'}
        >
          {/* material-symbols:expand-all-rounded — exact from Figma data-name, 14px */}
          <Icon
            icon="material-symbols:expand-all-rounded"
            width={14}
            color="#ededed"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          />
          {/* "Детальніше" — Label/Small 11px — Traces to §12.1 */}
          <span
            className="text-text-primary text-[11px] leading-[13.2px] tracking-[0.06px]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          >
            {expanded ? 'Згорнути' : 'Детальніше'}
          </span>
        </button>
      )}
    </div>
  );
}
