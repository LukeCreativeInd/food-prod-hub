type SupabaseAuthErrorLike = {
  code?: string | null;
  message?: string;
  name?: string;
  status?: number;
};

export type AuthErrorClassification =
  | "signed_out"
  | "temporary"
  | "configuration"
  | "unexpected";

export type AuthErrorMessageCategory =
  | "missing_session"
  | "invalid_refresh_token"
  | "expired_session"
  | "missing_session_record"
  | "invalid_jwt"
  | "rate_limited"
  | "network_failure"
  | "upstream_failure"
  | "invalid_configuration"
  | "invalid_request"
  | "unclassified";

export type AuthErrorDiagnostic = {
  classification: AuthErrorClassification;
  code: string | null;
  messageCategory: AuthErrorMessageCategory;
  name: string | null;
  status: number | null;
};

const unauthenticatedCodes = new Set([
  "bad_jwt",
  "jwt_expired",
  "refresh_token_already_used",
  "refresh_token_not_found",
  "session_expired",
  "session_not_found",
  "user_not_found",
]);

const temporaryCodes = new Set([
  "over_request_rate_limit",
  "request_timeout",
  "temporarily_unavailable",
  "unexpected_failure",
]);

const configurationCodes = new Set([
  "bad_code_verifier",
  "bad_json",
  "pkce_code_verifier_not_found",
  "validation_failed",
]);

function asAuthError(error: unknown): SupabaseAuthErrorLike {
  if (!error || typeof error !== "object") {
    return {};
  }

  return error as SupabaseAuthErrorLike;
}

function getMessageCategory(
  error: SupabaseAuthErrorLike,
): AuthErrorMessageCategory {
  const message = error.message?.trim() ?? "";

  if (
    error.name === "AuthSessionMissingError" ||
    /^auth session missing!?$/i.test(message)
  ) {
    return "missing_session";
  }

  if (
    error.code === "refresh_token_not_found" ||
    error.code === "refresh_token_already_used" ||
    /^invalid refresh token(?:: refresh token not found)?$/i.test(message) ||
    /^refresh token not found$/i.test(message)
  ) {
    return "invalid_refresh_token";
  }

  if (
    error.code === "jwt_expired" ||
    error.code === "session_expired" ||
    /^jwt expired$/i.test(message) ||
    /^(?:auth )?session (?:has )?expired$/i.test(message)
  ) {
    return "expired_session";
  }

  if (
    error.code === "session_not_found" ||
    error.code === "user_not_found" ||
    /^(?:auth )?session(?: record)? not found$/i.test(message)
  ) {
    return "missing_session_record";
  }

  if (
    error.code === "bad_jwt" ||
    /^(?:invalid|malformed) jwt$/i.test(message)
  ) {
    return "invalid_jwt";
  }

  if (error.status === 429 || error.code === "over_request_rate_limit") {
    return "rate_limited";
  }

  if (
    error.name === "AuthRetryableFetchError" ||
    /^(?:fetch failed|network request failed|request timed out|network timeout)$/i.test(
      message,
    )
  ) {
    return "network_failure";
  }

  if (
    error.code === "request_timeout" ||
    error.code === "temporarily_unavailable" ||
    error.code === "unexpected_failure" ||
    (typeof error.status === "number" && error.status >= 500)
  ) {
    return "upstream_failure";
  }

  if (
    /^(?:invalid|missing) (?:supabase )?(?:api key|project url)$/i.test(
      message,
    ) ||
    /^(?:supabase|auth) url is required$/i.test(message)
  ) {
    return "invalid_configuration";
  }

  if (
    configurationCodes.has(error.code ?? "") ||
    /^(?:invalid|malformed|unsupported) auth request$/i.test(message) ||
    /^request body is not valid json$/i.test(message)
  ) {
    return "invalid_request";
  }

  return "unclassified";
}

export function getAuthErrorDiagnostic(error: unknown): AuthErrorDiagnostic {
  const authError = asAuthError(error);
  const messageCategory = getMessageCategory(authError);
  let classification: AuthErrorClassification = "unexpected";

  if (
    messageCategory === "invalid_configuration" ||
    messageCategory === "invalid_request"
  ) {
    classification = "configuration";
  } else if (
    authError.name === "AuthSessionMissingError" ||
    (authError.code && unauthenticatedCodes.has(authError.code)) ||
    [
      "missing_session",
      "invalid_refresh_token",
      "expired_session",
      "missing_session_record",
      "invalid_jwt",
    ].includes(messageCategory) ||
    authError.status === 401
  ) {
    classification = "signed_out";
  } else if (
    authError.name === "AuthRetryableFetchError" ||
    (authError.code && temporaryCodes.has(authError.code)) ||
    messageCategory === "rate_limited" ||
    messageCategory === "network_failure" ||
    messageCategory === "upstream_failure" ||
    authError.status === 408 ||
    authError.status === 425 ||
    authError.status === 429 ||
    (typeof authError.status === "number" && authError.status >= 500)
  ) {
    classification = "temporary";
  }

  return {
    classification,
    code: authError.code ?? null,
    messageCategory,
    name: authError.name ?? null,
    status: authError.status ?? null,
  };
}

export class AuthVerificationError extends Error {
  readonly classification: Exclude<AuthErrorClassification, "signed_out">;
  readonly code: string | null;
  readonly messageCategory: AuthErrorMessageCategory;
  readonly status: number | null;

  constructor(
    message: string,
    name: string,
    diagnostic: AuthErrorDiagnostic,
  ) {
    super(message);
    this.name = name;
    this.classification =
      diagnostic.classification === "signed_out"
        ? "unexpected"
        : diagnostic.classification;
    this.code = diagnostic.code;
    this.messageCategory = diagnostic.messageCategory;
    this.status = diagnostic.status;
  }
}

export class AuthInfrastructureError extends AuthVerificationError {
  constructor(diagnostic: AuthErrorDiagnostic) {
    super(
      "Secure session verification is temporarily unavailable.",
      "AuthInfrastructureError",
      diagnostic,
    );
  }
}

export class AuthConfigurationError extends AuthVerificationError {
  constructor(diagnostic: AuthErrorDiagnostic) {
    super(
      "Secure session verification is unavailable.",
      "AuthConfigurationError",
      diagnostic,
    );
  }
}

export class AuthUnexpectedError extends AuthVerificationError {
  constructor(diagnostic: AuthErrorDiagnostic) {
    super(
      "Secure session verification is unavailable.",
      "AuthUnexpectedError",
      diagnostic,
    );
  }
}

export function isUnauthenticatedAuthError(error: unknown) {
  return getAuthErrorDiagnostic(error).classification === "signed_out";
}

export function resolveAuthUserError(error: unknown): null {
  const diagnostic = getAuthErrorDiagnostic(error);

  if (diagnostic.classification === "signed_out") {
    return null;
  }

  if (diagnostic.classification === "temporary") {
    throw new AuthInfrastructureError(diagnostic);
  }

  if (diagnostic.classification === "configuration") {
    throw new AuthConfigurationError(diagnostic);
  }

  throw new AuthUnexpectedError(diagnostic);
}
