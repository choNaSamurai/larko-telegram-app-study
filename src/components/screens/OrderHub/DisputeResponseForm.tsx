// src/components/screens/OrderHub/DisputeResponseForm.tsx
// Traces to: Scenario §5.4 Dispute state, §7 (dispute_banner, dispute_response_form), §9 BR-W2-09
// Renders: 1) Dispute Banner, 2) Response Form with "Оскаржити" + "Погодитись" buttons

import { useState } from 'react';
import { Icon } from '@iconify/react';
import type { OrderDispute, DisputeResponsePayload } from '@/types/order.types';
import { formatDisputeDate } from '@/utils/formatters';

interface DisputeResponseFormProps {
  dispute: OrderDispute;
  onSubmit: (payload: DisputeResponsePayload) => Promise<void>;
  isSubmitting?: boolean;
}

export function DisputeResponseForm({
  dispute,
  onSubmit,
  isSubmitting = false,
}: DisputeResponseFormProps) {
  const [explanation, setExplanation] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleContest = async () => {
    // BR-W2-09: explanation required when contesting
    if (!explanation.trim()) {
      setValidationError('Необхідно написати пояснення');
      return;
    }
    setValidationError('');
    await onSubmit({ action: 'contest', explanation: explanation.trim() });
  };

  const handleAccept = async () => {
    setValidationError('');
    await onSubmit({ action: 'accept' });
  };

  return (
    <>
      {/* ── Dispute Banner ── */}
      {/* bg: rgba(253,186,116,0.1), border: #fdba74 — Traces to §12.1 */}
      <div
        className="mx-4 rounded-[20px] relative overflow-hidden"
        style={{
          background: 'rgba(253,186,116,0.1)',
          border: '1px solid #fdba74',
          minHeight: '140px',
        }}
      >
        {/* Row 1: Alert icon + "Менеджер оскаржив замовлення" */}
        <div className="absolute top-4 left-4 right-4 flex items-center gap-2">
          {/* Closest @iconify match for Figma imgFrame (alert triangle) */}
          <Icon icon="solar:danger-triangle-bold" width={16} color="#fdba74" className="shrink-0" />
          <span
            className="text-[15px] leading-[18px] tracking-[-0.23px] whitespace-nowrap"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, color: '#fdba74' }}
          >
            Менеджер оскаржив замовлення
          </span>
        </div>

        {/* Row 2: Dispute description text */}
        <div className="absolute top-[44px] left-4 right-4">
          <p
            className="text-text-primary text-[15px] leading-[18px] tracking-[-0.23px]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          >
            {dispute.description}
          </p>
        </div>

        {/* Row 3: Timestamp — right-aligned — Traces to §12.1 Label/Small 11px */}
        <div className="absolute bottom-3 left-4 right-4 flex justify-end">
          <span
            className="text-text-secondary text-[11px] leading-[13.2px] tracking-[0.06px]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          >
            Створено: {formatDisputeDate(dispute.createdAt)}
          </span>
        </div>
      </div>

      {/* ── Response Form Card ── */}
      <div
        className="mx-4 bg-bg-card rounded-[20px] p-[17px] flex flex-col gap-3"
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Form header: think-outline icon + "Ваша відповідь" */}
        <div className="flex items-center gap-2">
          {/* mdi:think-outline — exact from Figma data-name, 20px */}
          {/* Note: @iconify maps this as "mdi:thought-bubble-outline" */}
          <Icon icon="mdi:thought-bubble-outline" width={20} color="#ededed" />
          <span
            className="text-text-primary font-semibold text-[17px] leading-[20.4px] tracking-[-0.43px]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Ваша відповідь
          </span>
        </div>

        {/* Text area — h-[80px], bg-bg-input = #3e3e42, rounded-[16px] */}
        <textarea
          value={explanation}
          onChange={(e) => {
            setExplanation(e.target.value);
            if (validationError) setValidationError('');
          }}
          placeholder="Напишіть пояснення..."
          className="w-full h-[80px] bg-bg-input rounded-[16px] resize-none focus:outline-none"
          style={{
            padding: '13px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '15px',
            fontWeight: 400,
            lineHeight: '18px',
            letterSpacing: '-0.23px',
            color: '#ededed',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
        {validationError && (
          <p
            className="text-status-error text-[12px] -mt-1"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {validationError}
          </p>
        )}

        {/* Action buttons: Оскаржити (red) + Погодитись (green) */}
        <div className="flex gap-2">
          {/* Оскаржити — red #f87171, contest dispute */}
          <button
            onClick={handleContest}
            disabled={isSubmitting}
            className="flex-1 h-[42px] rounded-[32px] flex items-center justify-center font-semibold text-[17px] text-white tracking-[-0.43px] disabled:opacity-60"
            style={{
              fontFamily: 'Inter, sans-serif',
              background: '#f87171',
              border: '1px solid #f87171',
              boxShadow:
                '0 10px 15px -3px rgba(248,113,113,0.2), 0 4px 6px -4px rgba(248,113,113,0.2)',
            }}
          >
            Оскаржити
          </button>

          {/* Погодитись — green #34d399, accept manager decision */}
          <button
            onClick={handleAccept}
            disabled={isSubmitting}
            className="flex-1 h-[42px] rounded-[32px] flex items-center justify-center font-semibold text-[17px] text-white tracking-[-0.43px] disabled:opacity-60"
            style={{
              fontFamily: 'Inter, sans-serif',
              background: '#34d399',
              border: '1px solid #34d399',
              boxShadow:
                '0 10px 15px -3px rgba(52,211,153,0.2), 0 4px 6px -4px rgba(52,211,153,0.2)',
            }}
          >
            {isSubmitting ? '...' : 'Погодитись'}
          </button>
        </div>
      </div>
    </>
  );
}
