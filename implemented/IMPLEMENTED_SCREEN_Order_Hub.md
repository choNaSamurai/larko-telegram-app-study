# IMPLEMENTED — Order Hub (W2)

**Status:** ✅ COMPLETE  
**Date:** 2026-03-29  
**Screen:** W2 — Order Hub / Task Detail  
**Skill:** SKILL_TMA_IMPLEMENT  

---

## Files Created

| File | Purpose |
|---|---|
| `src/types/order.types.ts` | TypeScript interfaces: `OrderDetail`, `TimeLog`, `OrderPhoto`, `OrderDispute`, `DisputeResponsePayload` |
| `src/services/orderService.ts` | Data service: `fetchOrderById`, `updateOrderStatus`, `uploadOrderPhoto`, `deleteOrderPhoto`, `submitDisputeResponse` |
| `src/components/screens/OrderHub/OrderHubScreen.tsx` | Root screen — orchestrates all blocks by status |
| `src/components/screens/OrderHub/OrderInfoCard.tsx` | Block 1: Order name, status badge, deadline, amount |
| `src/components/screens/OrderHub/DescriptionPanel.tsx` | Block 2: Collapsible notes panel |
| `src/components/screens/OrderHub/TimeTrackingCard.tsx` | Block 3: Hours display + Додати/Історія buttons |
| `src/components/screens/OrderHub/PhotoGalleryCard.tsx` | Block 4: Photo thumbnails + dashed add slot |
| `src/components/screens/OrderHub/MapWidget.tsx` | Block 5: OSM static map + location chip |
| `src/components/screens/OrderHub/StatusBanner.tsx` | Overdue pill + Checking/Locked card banners |
| `src/components/screens/OrderHub/DisputeResponseForm.tsx` | Dispute orange banner + response textarea + Оскаржити/Погодитись |
| `src/components/screens/OrderHub/OrderHubSkeleton.tsx` | Loading skeleton |
| `src/components/screens/OrderHub/OrderHubError.tsx` | Error state with retry |

## Files Modified

| File | Change |
|---|---|
| `src/services/MockData.ts` | Added `order.types` import + 6 `MOCK_ORDER_*` objects + `MOCK_ORDER_MAP` |
| `src/utils/formatters.ts` | Added `formatHours()` + `formatDisputeDate()` |
| `src/App.tsx` | Added `selectedOrderId` state + `OrderHubScreen` routing |
| `src/components/screens/MyTasks/MyTasksScreen.tsx` | Added `onTaskSelect` prop, passed to `TaskCard` |
| `src/components/screens/MyTasks/TaskCard.tsx` | Added `onPress` prop, made entire card clickable |

---

## Design Tokens & Spacing Used

| Token | Value | Component |
|---|---|---|
| Screen bg | `#222226` | OrderHubScreen wrapper |
| Card bg | `#2d2d31` | TimeTrackingCard, PhotoGalleryCard, Response Form |
| Input bg | `#3e3e42` | DescriptionPanel, text area |
| Status border (all) | per `STATUS_BORDER_COLOR` map | OrderInfoCard — **left border only** |
| Card border (non-status) | `rgba(255,255,255,0.08)` | TimeTrackingCard, PhotoGalleryCard |
| OrderInfoCard padding | `pl-[17px] pr-4 py-4` | Left 17px to accommodate border |
| Card content padding | `p-[17px]` | TimeTrackingCard, PhotoGalleryCard |
| Order name font | Space Grotesk Medium 24px | Amount in OrderInfoCard, hours in TimeTrackingCard |
| Section label font | Inter SemiBold 17px | Card headers |
| Body/note font | Inter Regular 15px | DescriptionPanel — italic style |
| Label font | Inter 11px | Dispute timestamp, "Детальніше" expand |

---

## Step-by-Step Log

### Step 1: TypeScript Interfaces (`src/types/order.types.ts`)
- Created `OrderDetail`, `TimeLog`, `OrderPhoto`, `OrderDispute`, `DisputeResponsePayload`
- All fields documented with inline comments tracing to Scenario §7/§8

### Step 2: Mock Data Extension (`src/services/MockData.ts`)
- Added `MOCK_ORDER_NEW`, `MOCK_ORDER_IN_PROGRESS`, `MOCK_ORDER_OVERDUE`, `MOCK_ORDER_CHECKING`, `MOCK_ORDER_DONE`, `MOCK_ORDER_DISPUTE`
- Added `MOCK_ORDER_MAP` for service lookup
- Unsplash solar panel images used for `photos` array mocks

### Step 3: Service Layer (`src/services/orderService.ts`)
- Simulated API with 600ms delay, `TODO` comments mark all real API endpoints
- `uploadOrderPhoto` creates object URL from `File` for dev preview

### Step 4: Formatter Extensions (`src/utils/formatters.ts`)
- `formatHours(5.0)` → `"5.0 год"` (one decimal, Space Grotesk)
- `formatDisputeDate("2026-03-24T09:15:00Z")` → `"24 бер, 09:15"`

### Step 5: OrderInfoCard
- Left-border only via `style={{ borderLeft: ... }}`
- Status badge: colored pill with dot indicator (except "done" which has ✓ prefix in label)
- Space Grotesk 24px for amount; Inter SemiBold 17px for name

### Step 6: DescriptionPanel
- `majesticons:note-text` exact Figma icon
- Expand/collapse with 150-char threshold; chevron rotates 180° on expand

### Step 7: TimeTrackingCard
- `majesticons:clock-line` exact Figma icon
- Space Grotesk 24px for hours value
- Done state = read-only single "Історія" button; active state = History icon + Додати

### Step 8: PhotoGalleryCard
- 80×80 thumbnail grid; dashed 75×80 add slot
- 3-photo/day limit: `photosAddedToday < MAX_PHOTOS_PER_DAY`
- File input: `accept="image/*"`, `capture="environment"` for native camera

### Step 9: MapWidget
- OSM static map image with gradient overlay darkening bottom
- Pin SVG + address chip with `backdropFilter: blur(6px)`
- Graceful fallback to gradient + grid pattern if no lat/lng

### Step 10: StatusBanner
- `overdue` → narrow pill (`rounded-[32px]`, 42px tall)
- `checking` → full card with `rounded-[20px]`
- `locked` → same card style, green colors

### Step 11: DisputeResponseForm
- Dispute banner: `rgba(253,186,116,0.1)` bg + `#fdba74` border
- Timestamp: bottom-right, `formatDisputeDate()`
- `mdi:thought-bubble-outline` for "Ваша відповідь" header
- Validation: `explanation` required for "Оскаржити"

### Step 12: OrderHubScreen (Root)
- `useQuery(['order', orderId])` → fetchOrderById
- `useMutation` for status updates + dispute responses
- TMA BackButton in `useEffect` → `WebApp.BackButton.show()`
- Safe-area: `paddingTop: 'env(safe-area-inset-top, 0px)'`
- Sticky CTA: only renders when `order.ctaAction !== null`

### Step 13: App.tsx Routing
- `selectedOrderId: string | null` state drives full-screen overlay
- `handleTabChange` clears `selectedOrderId` when switching tabs
- `MyTasksScreen` receives `onTaskSelect` callback

### Step 14: TaskCard + MyTasksScreen
- `onPress` prop added; entire card `div` gets `onClick`
- Cursor changes to `pointer` when `onPress` is set

---

## Visual Fidelity — OrderInfoCard
- **Figma reference:** node 298:26477 (Block 1)
- **Status:** ✅ PASS
- **Left border:** Render-confirmed left-only border per status color
- **Space Grotesk amount:** Confirmed "₴12,400" with correct font family
- **Status badge:** Confirmed colored pills with dot indicator

## Visual Fidelity — StatusBanner (Overdue)
- **Figma reference:** Scenario §5.1
- **Status:** ✅ PASS
- **Screenshot shows:** Red pill "Прострочено на 3 дні" with warning triangle icon
- **Card border:** Left-only red border on OrderInfoCard

## Visual Fidelity — DisputeResponseForm
- **Figma reference:** Scenario §5.4 dispute_banner
- **Status:** ✅ PASS
- **Screenshot shows:** Orange border banner + "Менеджер оскаржив замовлення" header + description text + timestamp + textarea + red/green buttons

## Visual Fidelity — Checking Banner
- **Figma reference:** Scenario §5.2 checking banner
- **Status:** ✅ PASS
- **Screenshot shows:** Blue info card "Менеджер повинен підтвердити..." — no CTA button shown

## Known Issues & Limitations

| Issue | Severity | Notes |
|---|---|---|
| OSM static map: `ERR_NAME_NOT_RESOLVED` | Low | External CDN host not reachable in this env. Gradient placeholder renders correctly |
| "Додати час" bottom sheet | Deferred | Phase 2 feature — shows `alert()` stub |
| "Повідомити про проблему" bottom sheet | Deferred | Phase 2 feature — shows `alert()` stub |
| "Історія часу" bottom sheet | Deferred | Phase 2 feature — shows `alert()` stub |
