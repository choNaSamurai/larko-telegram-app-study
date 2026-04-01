# IMPLEMENTED_API_ALL_SCREENS.md
# API Integration Log — Larko TMA
# Source: SKILL_API_INTEGRATE/SKILL.md §Integration Log Template
# Date: 2026-04-01

---

## §Endpoint Map

| Screen | Action | HTTP | Path | operationId | Status |
|---|---|---|---|---|---|
| Boot | Telegram auth | POST | `/auth/telegram` | `telegram_auth_api_v1_auth_telegram_post` | ✅ wired |
| Boot | List companies | GET | `/companies` | `list_companies_api_v1_companies_get` | ✅ wired |
| Boot | List members | GET | `/members/companies/{id}/members` | `list_members_api_v1_members_companies__company_id__members_get` | ✅ wired |
| W1 My Tasks | Fetch my orders | GET | `/orders/orders/my?company_id=` | `my_orders_api_v1_orders_orders_my_get` | ✅ wired |
| W2 Order Hub | Get order detail | GET | `/orders/orders/{order_id}` | `get_order_api_v1_orders_orders__order_id__get` | ✅ wired |
| W2 Order Hub | Get order timelogs | GET | `/timelogs/orders/{order_id}/timelogs` | `list_order_timelogs_api_v1_timelogs_orders__order_id__timelogs_get` | ✅ wired |
| W2 Order Hub | Signal worker start | POST | `/orders/orders/{id}/worker-start` | `signal_worker_start_api_v1_orders_orders__order_id__worker_start_post` | ✅ wired |
| W2 Order Hub | Signal worker done | POST | `/orders/orders/{id}/worker-done` | `signal_worker_done_api_v1_orders_orders__order_id__worker_done_post` | ✅ wired |
| W2.1 Add Time Log | Submit timelog | POST | `/timelogs` | `submit_timelog_api_v1_timelogs_post` | ✅ wired |
| W3 My Balance | Get balance | GET | `/finance/companies/{cid}/balance/{mid}` | `get_worker_balance_...` | ✅ wired |
| W3 My Balance | Get history | GET | `/finance/companies/{cid}/balance/{mid}/history` | `get_balance_history_...` | ✅ wired |
| W4 Profile | Get me | GET | `/auth/me` | `get_me_api_v1_auth_me_get` | ✅ wired |
| W5 Time Off | List absences | GET | `/workflows/companies/{cid}/absences?worker_id=` | `list_absences_...` | ✅ wired |
| W5 Time Off | List absence types | GET | `/catalog/companies/{cid}/absence-types` | `list_absence_types_...` | ✅ wired |
| W6 Leave Form | Create absence | POST | `/workflows/companies/{cid}/absences` | `create_absence_...` | ✅ wired |

---

## §Verification Gates

### Model Contract ✅
All request/response types defined in `src/api/*.ts` match Swagger 3.1.0 schemas verified against:
`https://dev-api-larko.driveapp.work/openapi.json`

### Auth Integration ✅
- `X-API-Key: IMuLwFzIMpJ7d7lQT9Q_9Z-uRNds3X0wUSuMHJS8bDM` injected on **every** request via `httpClient.ts`
- `Authorization: Bearer <token>` injected when `authStore.accessToken` is set
- `SyncService.ts` — both headers injected via `getAuthState()` + `ACTIVE_API_KEY`
- Token stored in `localStorage` (TMA web standard, confirmed by `frontend_integration_guide.md`)
- 401 → `clearAuth()` + `auth:expired` CustomEvent dispatched

### Mock Removal ✅
All service files (`tasksService`, `orderService`, `timeLogService`, `balanceService`, `leaveService`, `profileService`) **no longer import from MockData.ts**.

Verification:
```bash
grep -rn "MOCK_TASKS\|MOCK_ORDER\|MOCK_BALANCE\|MOCK_LEAVE\|MOCK_PROFILE" src/services/
# Returns: only MockData.ts itself (definitions, not usages)
```

### Error Coverage ✅
- `ApiError` class covers all RFC 7807 error types (401, 403, 404, 409, 422, 429, 503, 500)
- 409 on timelog → localized Ukrainian error message (BR-TL-001)
- Network errors → `ApiError.networkError()`
- `SyncService` dead letter + retry logic preserved

### Build Verification ✅
```
npm run build → ✓ built in 589ms (0 TypeScript errors, 167 modules)
```

---

## §New Files Created

| File | Purpose |
|---|---|
| `src/constants/apiConstants.ts` | Staging URL + API key constants |
| `src/stores/authStore.ts` | Zustand auth state store (token + company/member IDs) |
| `src/api/apiError.ts` | Typed RFC 7807 error class |
| `src/api/httpClient.ts` | Fetch wrapper with auth + error interceptors |
| `src/api/authApi.ts` | `/auth/telegram`, `/auth/register`, `/auth/login`, `/auth/me` |
| `src/api/companiesApi.ts` | `/companies`, `/members/companies/{id}/members` |
| `src/api/ordersApi.ts` | `/orders/orders/my`, `/orders/{id}`, worker-start, worker-done |
| `src/api/timelogsApi.ts` | `POST /timelogs`, `GET /timelogs/orders/{id}/timelogs` |
| `src/api/financeApi.ts` | `/finance/companies/{cid}/balance/{mid}` + `/history` |
| `src/api/workflowsApi.ts` | `/workflows/.../absences`, `/catalog/.../absence-types` |

## §Modified Files

| File | Change |
|---|---|
| `src/main.tsx` | Silent Telegram auto-auth boot (Option A) + company/member resolution |
| `src/services/tasksService.ts` | Wired to `getMyOrders()` → real API |
| `src/services/orderService.ts` | Wired to `getOrder()` + `getOrderTimelogs()` + `signalWorker*()` |
| `src/services/timeLogService.ts` | Wired to `submitTimelog()` directly (no SyncQueue for timelogs) |
| `src/services/balanceService.ts` | Wired to `getWorkerBalance()` + `getBalanceHistory()` |
| `src/services/leaveService.ts` | Wired to `listAbsences()` + `createAbsence()` + `listAbsenceTypes()` |
| `src/services/profileService.ts` | Wired to `getMe()` with authStore fallback |
| `src/services/SyncService.ts` | Updated: full staging URL + X-API-Key header + reads token from authStore |

---

## §Business Rules Verified

| Rule | Implementation |
|---|---|
| BR-TL-001 — duplicate timelog | Client-side DB guard + API 409 handling → localized error |
| Q2 — overdue derivation | `due_date < today` client-side in `tasksService` + `orderService` |
| Q3 — leave type mapping | `mapLeaveTypeToReason()` in workflowsApi — extras → `'other'` |
| Auth timeout | 401 → `clearAuth()` + `auth:expired` event |
| No mock bypass | All MockData imports removed from active services |
