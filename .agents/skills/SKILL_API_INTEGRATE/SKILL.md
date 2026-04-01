---
name: SKILL_API_INTEGRATE
description: |
  Deterministic skill for replacing mock data services with production-ready backend API calls
  in Telegram Mini App (Flutter/Dart) screens. Consumes ADR, DAD, Tech Stack, Scenario,
  backend reference docs, and a Swagger URL provided by the user.
  Triggers on any mention of: "integrate API", "replace mock", "connect backend",
  "wire real API", "implement API layer", "swagger integration", or "live data".
  This skill is the primary tool for the API_Backend_Integrator role.
---

# SKILL_API_INTEGRATE: Production API Integration for TMA

This skill transforms mock-backed screens into fully API-wired production flows.
It enforces strict adherence to the project's backend contract, ADR constraints, and DAD data layer architecture.

## 1. Prerequisites (MANDATORY — all must be present before coding)

| Input | Path | Notes |
|---|---|---|
| ADR | `adr/ADR_SCREEN_[NAME].md` | Architectural constraints for the screen |
| DAD | `dad/DAD_[SCOPE].md` | Data layer: Repository, SyncQueue, entities |
| Tech Stack | `tech-stack/TECH_STACK_SCREEN_[NAME].md` | File structure, TypeScript/Dart interfaces |
| Scenario | `scenario/SCREEN_[NAME].md` | All user flows and actions |
| API Reference | `backend/api_endpoints_reference.md` | 98-endpoint map |
| API Detailed | `backend/api_endpoints_detailed.md` | Full request/response schemas |
| Integration Guide | `backend/frontend_integration_guide.md` | Auth, headers, environments |
| Error Codes | `backend/error_codes.md` | All known error types + frontend handling |
| Swagger URL | User-provided | e.g. `https://dev-api-larko.driveapp.work/docs` |

If Swagger URL is provided: fetch the JSON schema using `read_url_content` or the browser subagent.
If any file is missing: log as [BLOCKING] in Open Questions and **STOP**.

---

## 2. Execution Workflow

### Phase 0: Context Loading & Endpoint Mapping

1. Read ALL prerequisite files (view_file for each).
2. Fetch Swagger JSON if URL provided.
3. Build the **Endpoint Map** table in `implemented/IMPLEMENTED_API_[SCREEN_NAME].md`:

```markdown
## §Endpoint Map
| Flow Action | HTTP Method | Path | Swagger operationId | Request Model | Response Model |
|---|---|---|---|---|---|
| User taps "Submit timelog" | POST | /api/v1/timelogs | createTimelog | TimelogCreateDto | TimelogResponse |
```

**Do NOT proceed to Phase 1 until this table is fully populated.**

---

### Phase 1: API Client Infrastructure

Check if the API client infrastructure already exists. If not, create it.

#### 1.1 Constants (lib/core/constants/api_constants.dart)

```dart
class ApiConstants {
  static const String baseUrlStaging = 'https://dev-api-larko.driveapp.work/api/v1';
  static const String baseUrlProduction = 'https://api-larko.driveapp.work/api/v1';
  static const String apiKeyStaging  = 'IMuLwFzIMpJ7d7lQT9Q_9Z-uRNds3X0wUSuMHJS8bDM';
  // Use environment variable injection for production key — never hardcode prod key in source.
  static const Duration connectTimeout = Duration(seconds: 10);
  static const Duration receiveTimeout = Duration(seconds: 15);
}
```

#### 1.2 Dio Client (lib/core/network/dio_client.dart)

Must have:
- `BaseOptions` with `baseUrl`, `connectTimeout`, `receiveTimeout`.
- `X-API-Key` header in default headers.
- `AuthInterceptor`: injects `Authorization: Bearer <token>` from SecureStorage.
- `ErrorInterceptor`: maps `DioException` to `AppError`.
- `LoggingInterceptor` (debug only).

#### 1.3 AppError model (lib/core/errors/app_error.dart)

```dart
sealed class AppError {
  factory AppError.fromDio(DioException e) { ... }
}
class UnauthorizedError extends AppError { ... }   // 401
class ForbiddenError extends AppError { ... }       // 403
class NotFoundError extends AppError { ... }        // 404
class ConflictError extends AppError { ... }        // 409
class ValidationError extends AppError { ... }      // 422
class RateLimitedError extends AppError { ... }     // 429
class ServerError extends AppError { ... }          // 5xx
class NetworkError extends AppError { ... }         // no connection
```

Reference `backend/error_codes.md` for error message keys.

Log: "Phase 1 — API Client Infrastructure: PASS/FAIL" in `IMPLEMENTED_API_[SCREEN_NAME].md`.

---

### Phase 2: Request/Response Models

For each endpoint in the Endpoint Map:

1. Create `lib/data/models/[entity]_model.dart` with `fromJson` / `toJson`.
2. All fields MUST match the Swagger / `api_endpoints_detailed.md` response schema exactly.
3. Nullable fields → `Type?` in Dart.
4. Enum fields → Dart `enum` matching the string values from the API.
5. Timestamps → `DateTime.parse(json['created_at'])`.

**Model Contract Check** (run after each model):
- List every field in the API response.
- Mark each as `✅ mapped` or `⚠️ delta: [reason]`.

Log: "Phase 2 — Models: [EntityName] PASS/FAIL" per model in implementation log.

---

### Phase 3: Remote Datasource

For each screen entity, create `lib/data/remote/[entity]_remote_datasource.dart`:

```dart
abstract interface class ITimelogRemoteDatasource {
  Future<Either<AppError, TimelogModel>> createTimelog(TimelogCreateDto dto);
  Future<Either<AppError, List<TimelogModel>>> getMyTimelogs(String companyId);
}

class TimelogRemoteDatasource implements ITimelogRemoteDatasource {
  final Dio _dio;
  TimelogRemoteDatasource(this._dio);

  @override
  Future<Either<AppError, TimelogModel>> createTimelog(TimelogCreateDto dto) async {
    try {
      final response = await _dio.post('/timelogs', data: dto.toJson());
      return Right(TimelogModel.fromJson(response.data));
    } on DioException catch (e) {
      return Left(AppError.fromDio(e));
    }
  }
}
```

Rules:
- Always `return Right(...)` on success, `return Left(AppError.fromDio(e))` on error.
- Never throw from datasource — always return `Either`.
- Authentication header is injected by `AuthInterceptor` — do NOT add it inline.

Log: "Phase 3 — Datasource: [Entity] PASS/FAIL" in implementation log.

---

### Phase 4: Repository Wiring

Update `lib/data/repositories/[entity]_repository_impl.dart`:

1. Inject `IRemoteDatasource` via constructor (alongside `ILocalDatasource` if DAD requires).
2. Replace mock returns with remote datasource calls.
3. If DAD specifies local-first: write to local DB first, then queue sync via `SyncQueue`.
4. If DAD specifies server-first: call API, then optionally cache response in local DB.

```dart
class TimelogRepositoryImpl implements ITimelogRepository {
  final ITimelogRemoteDatasource _remote;
  final ITimelogLocalDatasource _local; // from DAD

  @override
  Future<Either<AppError, TimelogEntity>> submitTimelog(TimelogEntity entity) async {
    // Per DAD §6 Data Flow: local-first write → SyncQueue
    await _local.save(entity.toModel());
    await _syncQueue.enqueue(SyncAction.createTimelog, entity.toJson());
    return Right(entity);
  }
}
```

**Mock Removal Check**: After wiring each Repository method:
- Search for mock data references: `grep -r "MockData\|mockService\|isMock" lib/`.
- For integrated screen: zero active mocks allowed.

Log: "Phase 4 — Repository Wiring: [Entity] PASS/FAIL".

---

### Phase 5: Authentication Flow Integration

If auth flow is part of the screen integration:

1. TMA Auth (primary flow):
```dart
final initData = WebApp.instance.initDataRaw; // from telegram_web_app package
final result = await _authRemote.loginTelegram(
  TelegramAuthDto(initData: initData, fullName: user.fullName, language: 'uk')
);
result.fold(
  (error) => emit(AuthState.error(error)),
  (auth) async {
    await _secureStorage.write(key: 'access_token', value: auth.tokens.accessToken);
    await _secureStorage.write(key: 'refresh_token', value: auth.tokens.refreshToken);
    emit(AuthState.authenticated(auth.account));
  }
);
```

2. Token injection in `AuthInterceptor`:
```dart
final token = await _secureStorage.read(key: 'access_token');
if (token != null) options.headers['Authorization'] = 'Bearer $token';
```

3. 401 handling: clear token → navigate to auth screen.

Log: "Phase 5 — Auth Integration: PASS/FAIL" with sequence diagram.

---

### Phase 6: Final Verification (Integration Gate)

Run ALL checks before marking integration as DONE:

```bash
# 1. Static analysis
flutter analyze --no-pub
# Must exit with 0 errors

# 2. Integration validation script
.agents/skills/SKILL_API_INTEGRATE/scripts/validate_api_integration.sh [SCREEN_NAME]
# Must exit with 0 errors

# 3. Network verification
# Run app against Staging → check each endpoint returns 2xx in Flutter DevTools / Proxyman
```

Log entry in `IMPLEMENTED_API_[SCREEN_NAME].md`:

```markdown
## Phase 6 — API Integration Gate
- Integrated endpoints: [list]
- flutter analyze: 0 errors ✅
- Network verification: [screenshot or log excerpt]
- validate_api_integration.sh: PASS ✅
- Active mocks for this screen: NONE ✅
```

---

## 3. Output Standard

Every integration must produce:
1. `implemented/IMPLEMENTED_API_[SCREEN_NAME].md` — step-by-step log (use [log template](./assets/api_integration_log_template.md)).
2. Updated source files: models, datasources, repositories, interceptors.
3. `implemented/IMPLEMENTED_API_[SCREEN_NAME].md` Phase 6 Integration Gate: **PASS**.

---

## 4. Constraints

| Rule | WRONG | CORRECT |
|---|---|---|
| Token storage | `SharedPreferences.setString('token', t)` | `SecureStorage.write(key: 'access_token', value: t)` |
| Inline API key | `headers: {'X-API-Key': 'abc...'}` in every call | `ApiConstants.apiKeyStaging` via interceptor |
| Error handling | `try { ... } catch (e) { print(e); }` | `on DioException catch (e) { return Left(AppError.fromDio(e)); }` |
| Environment | Call production API during dev | Always use Staging URL |
| Mock removal | Leave mock active alongside live call | Guard with `MOCK_MODE` flag OR remove entirely |
| Bypass Repository | Call datasource directly from BLoC | BLoC → Repository → Datasource |

---

## 5. References

- [API Endpoints Reference](../../../backend/api_endpoints_reference.md)
- [API Endpoints Detailed](../../../backend/api_endpoints_detailed.md)
- [Frontend Integration Guide](../../../backend/frontend_integration_guide.md)
- [Error Codes](../../../backend/error_codes.md)
- [Integration Log Template](./assets/api_integration_log_template.md)
- [API Integration Checklist](./references/api_integration_checklist.md)
- [Validate Script](./scripts/validate_api_integration.sh)
- [Swagger Parser Script](./scripts/parse_swagger.py)
