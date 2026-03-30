// src/components/screens/OrderHub/OrderHubScreen.tsx
// Traces to: Scenario §4 Full Flow, §8 Screen States, Tech Stack §Step 14
// Root screen component — orchestrates all blocks by order status

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import WebApp from '@twa-dev/sdk';
import { Icon } from '@iconify/react';

import {
  fetchOrderById,
  updateOrderStatus,
  uploadOrderPhoto,
  deleteOrderPhoto,
  submitDisputeResponse,
} from '@/services/orderService';
import type { DisputeResponsePayload } from '@/types/order.types';

import { OrderInfoCard } from './OrderInfoCard';
import { DescriptionPanel } from './DescriptionPanel';
import { TimeTrackingCard } from './TimeTrackingCard';
import { PhotoGalleryCard } from './PhotoGalleryCard';
import { MapWidget } from './MapWidget';
import { StatusBanner } from './StatusBanner';
import { DisputeResponseForm } from './DisputeResponseForm';
import { OrderHubSkeleton } from './OrderHubSkeleton';
import { OrderHubError } from './OrderHubError';

import type { AddTimeLogContext } from '@/types/timeLog.types';

interface OrderHubScreenProps {
  orderId: string;
  onBack: () => void;
  onOpenAddTime?: (ctx: AddTimeLogContext) => void;
}

export function OrderHubScreen({ orderId, onBack, onOpenAddTime }: OrderHubScreenProps) {
  const queryClient = useQueryClient();

  // TMA BackButton integration — Traces to: Scenario §10 TMA Integration
  useEffect(() => {
    try {
      WebApp.BackButton.show();
      WebApp.BackButton.onClick(onBack);
    } catch {
      // silently fail in browser/dev mode without TMA context
    }
    return () => {
      try {
        WebApp.BackButton.hide();
        WebApp.BackButton.offClick(onBack);
      } catch {
        // ignore
      }
    };
  }, [onBack]);

  // ── Server state ──
  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderById(orderId),
    staleTime: 2 * 60 * 1000, // 2 min
    retry: 2,
  });

  // Status update mutation (Почати → In Progress, Завершити → Checking)
  const statusMutation = useMutation({
    mutationFn: (action: 'start' | 'complete') => updateOrderStatus(orderId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      // Also invalidate tasks list so W1 card reflects new status
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Dispute response mutation
  const disputeMutation = useMutation({
    mutationFn: (payload: DisputeResponsePayload) => submitDisputeResponse(orderId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order', orderId] }),
  });

  // ── Loading / Error states ──
  if (isLoading) return <OrderHubSkeleton />;
  if (isError || !order) return <OrderHubError onRetry={refetch} />;

  // ── Derived state flags ──
  const { status } = order;
  const isLocked = status === 'done';
  const isDispute = status === 'dispute';
  const isOverdue = status === 'overdue';
  const isChecking = status === 'checking';

  // Photo handlers
  const handleAddPhoto = async (file: File) => {
    await uploadOrderPhoto(orderId, file);
    queryClient.invalidateQueries({ queryKey: ['order', orderId] });
  };

  const handleRemovePhoto = async (photoId: string) => {
    await deleteOrderPhoto(orderId, photoId);
    queryClient.invalidateQueries({ queryKey: ['order', orderId] });
  };

  return (
    <div
      className="flex flex-col bg-bg-screen overflow-hidden"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* ── Fixed Header ── */}
      <div className="flex items-center gap-3 px-4 py-4 shrink-0">
        {/* Back button: circular, rotated chevron — Traces to §7 header_back_btn */}
        <button
          onClick={onBack}
          className="bg-bg-card rounded-full w-[40px] h-[40px] flex items-center justify-center shrink-0"
          style={{ border: '1px solid #3e3e42' }}
          aria-label="Назад"
        >
          {/* ChevronRight rotated 180° = chevron left */}
          <Icon icon="solar:alt-arrow-right-bold" width={20} color="#ededed" className="rotate-180" />
        </button>

        {/* Screen title: "Замовлення №XXXXXX" — Inter SemiBold 17px */}
        <h1
          className="text-text-primary font-semibold text-[17px] leading-[20.4px] tracking-[-0.43px]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Замовлення №{order.number}
        </h1>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col gap-3 pb-4">
          {/* Block 1: Order Info Card — always shown */}
          <OrderInfoCard
            name={order.name}
            status={order.status}
            deadline={order.deadline}
            amount={order.amount}
          />

          {/* ── Contextual banners (exactly ONE per status) ── */}

          {/* Overdue: red pill banner */}
          {isOverdue && <StatusBanner variant="overdue" daysOverdue={3} />}

          {/* Checking: blue info card */}
          {isChecking && <StatusBanner variant="checking" />}

          {/* Done/Locked: green info card */}
          {isLocked && <StatusBanner variant="locked" />}

          {/* Dispute: orange banner + response form (compound — two separate cards) */}
          {isDispute && order.dispute && (
            <DisputeResponseForm
              dispute={order.dispute}
              onSubmit={async (payload) => {
                await disputeMutation.mutateAsync(payload);
              }}
              isSubmitting={disputeMutation.isPending}
            />
          )}

          {/* Block 2: Description panel — always shown */}
          <DescriptionPanel notes={order.notes} />

          {/* Block 3: Time Tracking Card */}
          <TimeTrackingCard
            totalHours={order.totalHours}
            canAddTime={order.canAddTime}
            isDone={isLocked}
            onAddTime={() => {
              if (onOpenAddTime) {
                // Open W2.1 Add Time Log screen
                onOpenAddTime({
                  orderId,
                  orderNumber: order.number,
                  isPerUnit: false, // TODO: derive from order.paymentModel
                  unitLabel: 'м²',
                });
              } else {
                alert('Додавання часу — буде додано у наступному релізі');
              }
            }}
            onViewHistory={() => {
              // TODO: open Time History bottom sheet (Phase 2)
              alert('Історія часу — буде додано у наступному релізі');
            }}
          />

          {/* Block 4: Photo Gallery Card */}
          <PhotoGalleryCard
            photos={order.photos}
            photosAddedToday={order.photosAddedToday}
            canAddPhotos={order.canAddPhotos}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
          />

          {/* Block 5: Map Widget */}
          <MapWidget
            address={order.location.address}
            lat={order.location.lat}
            lng={order.location.lng}
          />

          {/* Block 6: Report Issue button — hidden when Done (BR-W2-07, BR-W2-08) */}
          {order.canReportIssue && (
            <button
              className="mx-4 h-[42px] rounded-[32px] flex items-center justify-center gap-2 transition-opacity active:opacity-70"
              style={{
                background: 'rgba(248,113,113,0.12)',
                border: '1px solid rgba(248,113,113,0.3)',
              }}
              onClick={() => {
                // TODO: open Report Issue bottom sheet (Phase 2)
                alert('Повідомлення про проблему — буде додано у наступному релізі');
              }}
            >
              <Icon icon="solar:danger-triangle-bold" width={18} color="#f87171" />
              <span
                className="text-[15px] leading-[18px]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, color: '#f87171' }}
              >
                Повідомити про проблему
              </span>
            </button>
          )}

          {/* Spacer so last card isn't under sticky CTA */}
          {order.ctaAction && <div className="h-[24px]" />}
        </div>
      </div>

      {/* ── Sticky Footer CTA ── */}
      {/* Shown for New (Почати роботу) and InProgress/Overdue (Завершити роботу) */}
      {/* Hidden for Checking, Done, Dispute — Traces to §7 primary_cta_btn */}
      {order.ctaAction && (
        <div
          className="shrink-0 px-4 pt-3"
          style={{
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)',
            background: 'linear-gradient(to bottom, transparent, #222226 40%)',
          }}
        >
          <button
            onClick={() => order.ctaAction && statusMutation.mutate(order.ctaAction)}
            disabled={statusMutation.isPending}
            className="w-full h-[56px] bg-bg-button rounded-[32px] flex items-center justify-center gap-2 font-semibold text-[16px] text-text-dark leading-[24px] disabled:opacity-60 transition-opacity active:opacity-80"
            style={{
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 5px 20px 0 rgba(255,255,255,0.15)',
            }}
          >
            {statusMutation.isPending ? (
              <Icon icon="solar:refresh-bold" width={20} color="#222226" className="animate-spin" />
            ) : order.ctaAction === 'start' ? (
              '▶ Почати роботу'
            ) : (
              '✓ Завершити роботу'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
