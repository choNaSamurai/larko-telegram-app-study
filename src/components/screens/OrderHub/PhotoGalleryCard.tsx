// src/components/screens/OrderHub/PhotoGalleryCard.tsx
// Traces to: Scenario §4 Step 3 Block 4, §6 Edge Cases 3-4, §9 BR-W2-04
// Max 3 photos/day, 10MB limit, dashed add slot

import { useRef } from 'react';
import { Icon } from '@iconify/react';
import type { OrderPhoto } from '@/types/order.types';

const MAX_PHOTOS_PER_DAY = 3;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

interface PhotoGalleryCardProps {
  photos: OrderPhoto[];
  photosAddedToday: number;
  canAddPhotos: boolean;
  onAddPhoto: (file: File) => Promise<void>;
  onRemovePhoto: (photoId: string) => Promise<void>;
}

export function PhotoGalleryCard({
  photos,
  photosAddedToday,
  canAddPhotos,
  onAddPhoto,
  onRemovePhoto,
}: PhotoGalleryCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canAdd = canAddPhotos && photosAddedToday < MAX_PHOTOS_PER_DAY;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert('Файл занадто великий (max 10MB)');
      return;
    }
    await onAddPhoto(file);
    e.target.value = ''; // reset input so user can re-pick same file
  };

  return (
    // bg-bg-card = #2d2d31, border subtle rgba(255,255,255,0.08), rounded-card = 20px
    <div
      className="mx-4 bg-bg-card rounded-card p-[17px] flex flex-col gap-4"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header: camera icon + "Фото роботи" */}
      <div className="flex items-center gap-2">
        {/* majesticons:camera-line — exact from Figma data-name, 20px */}
        <Icon icon="majesticons:camera-line" width={20} color="#ededed" />
        <span
          className="text-text-primary font-semibold text-[17px] leading-[20.4px] tracking-[-0.43px]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Фото роботи
        </span>
      </div>

      {/* Photos row */}
      {(photos.length > 0 || canAdd) && (
        <div className="flex gap-2 flex-wrap">
          {/* Existing photo thumbnails — 80×80, rounded-[20px] */}
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative w-[80px] h-[80px] rounded-[20px] overflow-hidden shrink-0"
              style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#3e3e42' }}
            >
              <img
                src={photo.thumbnailUrl}
                alt="Фото роботи"
                className="w-full h-full object-cover"
                style={{ opacity: 0.8 }}
              />
              {/* Remove button (×) — hidden when locked (canAddPhotos === false) */}
              {canAddPhotos && (
                <button
                  onClick={() => onRemovePhoto(photo.id)}
                  className="absolute top-[3px] right-[3.73px] w-[20px] h-[20px] rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(10,10,11,0.8)' }}
                  aria-label="Видалити фото"
                >
                  <Icon icon="mdi:close" width={10} color="#ededed" />
                </button>
              )}
            </div>
          ))}

          {/* Dashed "Додати" slot — shown when limit not reached */}
          {canAdd && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-[75px] h-[80px] rounded-[20px] flex flex-col gap-1 items-center justify-center shrink-0"
              style={{ border: '2px dashed #9d9d9d' }}
              aria-label="Додати фото"
            >
              {/* Camera icon — 20px — closest @iconify match for Figma camera shape */}
              <Icon icon="solar:camera-add-bold" width={20} color="#9d9d9d" />
              <span
                className="text-text-secondary text-[15px] leading-[18px]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
              >
                Додати
              </span>
            </button>
          )}
        </div>
      )}

      {/* Hidden file input for camera/gallery picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
