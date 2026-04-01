// src/api/apiError.ts
// Typed API error model.
// Source: backend/error_codes.md — RFC 7807 Problem Details format
//
// Error hierarchy (from error_codes.md):
//   401 Unauthorized       → UnauthorizedError
//   403 Forbidden          → ForbiddenError (incl. plan_limit_exceeded)
//   404 Not Found          → NotFoundError
//   409 Conflict           → ConflictError
//   422 Validation/Biz     → ValidationError | BusinessRuleError
//   429 Too Many Requests  → RateLimitedError
//   503 External service   → ExternalServiceError
//   500 Internal           → ServerError
//   network fail           → NetworkError

export type ApiErrorType =
  | 'unauthorized'
  | 'forbidden'
  | 'plan_limit_exceeded'
  | 'not_found'
  | 'conflict'
  | 'validation_error'
  | 'business_rule_violation'
  | 'rate_limited'
  | 'external_service_error'
  | 'server_error'
  | 'network_error'
  | 'unknown';

export interface ApiErrorField {
  field: string;
  message: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly type: ApiErrorType;
  readonly detail: string;
  readonly errors: ApiErrorField[];

  constructor(opts: {
    status: number;
    type: ApiErrorType;
    detail: string;
    errors?: ApiErrorField[];
    message?: string;
  }) {
    super(opts.message ?? opts.detail);
    this.name = 'ApiError';
    this.status = opts.status;
    this.type = opts.type;
    this.detail = opts.detail;
    this.errors = opts.errors ?? [];
  }

  get isUnauthorized(): boolean { return this.status === 401; }
  get isForbidden(): boolean { return this.status === 403; }
  get isNotFound(): boolean { return this.status === 404; }
  get isConflict(): boolean { return this.status === 409; }
  get isValidation(): boolean { return this.status === 422; }
  get isRateLimited(): boolean { return this.status === 429; }
  get isServerError(): boolean { return this.status >= 500; }

  /** Map a fetch Response to a typed ApiError */
  static async fromResponse(response: Response): Promise<ApiError> {
    let body: Record<string, unknown> = {};
    try {
      body = await response.json();
    } catch {
      // Non-JSON body
    }

    const detail = (body.detail as string) ?? response.statusText ?? 'Unknown error';
    const rawErrors = (body.errors as ApiErrorField[]) ?? [];
    const status = response.status;

    let type: ApiErrorType;
    switch (status) {
      case 401: type = 'unauthorized'; break;
      case 403:
        type = (body.type as string)?.includes('plan_limit') ? 'plan_limit_exceeded' : 'forbidden';
        break;
      case 404: type = 'not_found'; break;
      case 409: type = 'conflict'; break;
      case 422:
        type = (body.type as string)?.includes('business_rule') ? 'business_rule_violation' : 'validation_error';
        break;
      case 429: type = 'rate_limited'; break;
      case 503: type = 'external_service_error'; break;
      default:
        type = status >= 500 ? 'server_error' : 'unknown';
    }

    return new ApiError({ status, type, detail, errors: rawErrors });
  }

  /** Create a network/fetch failure error */
  static networkError(cause?: unknown): ApiError {
    return new ApiError({
      status: 0,
      type: 'network_error',
      detail: cause instanceof Error ? cause.message : 'Network request failed',
    });
  }
}
