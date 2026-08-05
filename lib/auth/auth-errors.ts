type SupabaseAuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
};

const unauthenticatedCodes = new Set([
  "bad_jwt",
  "jwt_expired",
  "refresh_token_already_used",
  "refresh_token_not_found",
  "session_not_found",
  "user_not_found",
]);

const unauthenticatedMessagePatterns = [
  /invalid refresh token/i,
  /jwt expired/i,
  /refresh token not found/i,
  /session.*not found/i,
];

export class AuthInfrastructureError extends Error {
  readonly code: string | null;
  readonly status: number | null;

  constructor(error: SupabaseAuthErrorLike) {
    super("Secure session verification is temporarily unavailable.");
    this.name = "AuthInfrastructureError";
    this.code = error.code ?? null;
    this.status = error.status ?? null;
  }
}

export function isUnauthenticatedAuthError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const authError = error as SupabaseAuthErrorLike;

  if (authError.status === 401) {
    return true;
  }

  if (authError.code && unauthenticatedCodes.has(authError.code)) {
    return true;
  }

  return unauthenticatedMessagePatterns.some((pattern) =>
    pattern.test(authError.message ?? ""),
  );
}

export function resolveAuthUserError(error: unknown): null {
  if (isUnauthenticatedAuthError(error)) {
    return null;
  }

  const authError =
    error && typeof error === "object"
      ? (error as SupabaseAuthErrorLike)
      : {};

  throw new AuthInfrastructureError(authError);
}
