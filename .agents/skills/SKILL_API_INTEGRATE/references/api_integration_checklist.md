# API Integration Checklist — SKILL_API_INTEGRATE

Use this checklist before marking any screen's API integration as DONE.
Every item must be PASS. A single FAIL blocks completion.

---

## 📋 Phase 0: Context & Endpoint Map

- [ ] All prerequisite files read: ADR, DAD, Tech Stack, Scenario, backend/*, error_codes.md
- [ ] Swagger JSON fetched (if URL provided)
- [ ] `§Endpoint Map` table in IMPLEMENTED_API log: ALL flow actions mapped to endpoints
- [ ] No row in Endpoint Map has empty operationId or path

---

## 🔌 Phase 1: API Client Infrastructure

- [ ] `lib/core/constants/api_constants.dart` exists with `baseUrlStaging`, `apiKeyStaging`
- [ ] `DioClient` configured with `BaseOptions` (baseUrl, timeouts)
- [ ] `AuthInterceptor`: injects `X-API-Key` + `Authorization: Bearer <token>` on every request
- [ ] `ErrorInterceptor`: maps `DioException` → `AppError` (sealed class)
- [ ] `AppError` covers: 401, 403, 404, 409, 422, 429, 5xx, NetworkError
- [ ] 401 handling: clear SecureStorage token → navigate to auth screen
- [ ] Log entry "Phase 1 — API Client: PASS" in IMPLEMENTED_API log

---

## 📦 Phase 2: Request/Response Models

- [ ] Every endpoint in Endpoint Map has a corresponding Dart model
- [ ] All model fields match Swagger / api_endpoints_detailed.md schema
- [ ] Nullable API fields have `Type?` in Dart model
- [ ] Enum fields use Dart `enum` with matching string values
- [ ] `fromJson` and `toJson` are implemented and tested
- [ ] Model Contract Check logged per model (✅ mapped / ⚠️ delta)
- [ ] Log entry "Phase 2 — Models: PASS" in IMPLEMENTED_API log

---

## 🌐 Phase 3: Remote Datasource

- [ ] `IRemoteDatasource` abstract interface defined for each entity
- [ ] `RemoteDatasourceImpl` implements every interface method
- [ ] Every method returns `Future<Either<AppError, T>>` — never throws
- [ ] `try/catch on DioException` in every method — no uncaught exceptions
- [ ] No inline headers (`X-API-Key`, `Authorization`) in datasource — injected by interceptor
- [ ] Log entry "Phase 3 — Datasource: PASS" per entity in IMPLEMENTED_API log

---

## 🏛️ Phase 4: Repository Wiring

- [ ] Repository now calls remote datasource (not directly returning mock data)
- [ ] Local-first vs server-first strategy matches DAD §6 Data Flow decision
- [ ] SyncQueue is enqueued for mutating operations (if DAD requires)
- [ ] Mock removal: `grep -r "MockData\|mockService\|isMock" lib/` returns 0 hits for this screen
- [ ] Log entry "Phase 4 — Repository: PASS" in IMPLEMENTED_API log

---

## 🔐 Phase 5: Authentication

- [ ] TMA: `initData` from `WebApp.instance.initDataRaw` sent to `POST /auth/telegram`
- [ ] `access_token` stored in `SecureStorage` (NOT SharedPreferences / localStorage)
- [ ] `refresh_token` stored in `SecureStorage`
- [ ] `AuthInterceptor` reads token from `SecureStorage` on each request
- [ ] 401 → clears token → navigates to auth screen (no infinite loop)
- [ ] Log entry "Phase 5 — Auth: PASS" with Mermaid sequence diagram in log

---

## 🧪 Phase 6: Final Integration Gate

- [ ] `flutter analyze --no-pub` → 0 errors, 0 warnings (or documented acceptable warnings)
- [ ] `validate_api_integration.sh [SCREEN_NAME]` → exits with 0
- [ ] App runs against **Staging** (never Production during dev)
- [ ] Every integrated endpoint verified in Flutter DevTools Network tab: returns 2xx
- [ ] IMPLEMENTED_API log has Phase 6 section with network evidence
- [ ] Zero active mock bypasses for the integrated screen
- [ ] Sequence diagram for main API flow present in log

---

## 🎯 Figma / UI Impact

- [ ] UI layer continues to work after mock→API swap (no regressions)
- [ ] Loading states display while API call is in-flight
- [ ] Error states display AppError messages correctly
- [ ] Empty states render when API returns empty list

---

## ⛔ Blockers That PREVENT Completion

- Any endpoint calling Production during development
- Any token stored outside SecureStorage
- Any DioException escaping datasource without `Left(AppError)` wrap
- `flutter analyze` with errors
- Active mock bypasses for the integrated screen
- Missing Endpoint Map rows
