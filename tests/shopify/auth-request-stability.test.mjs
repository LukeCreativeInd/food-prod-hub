import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  AuthConfigurationError,
  AuthInfrastructureError,
  AuthUnexpectedError,
  getAuthErrorDiagnostic,
  isUnauthenticatedAuthError,
  resolveAuthUserError,
} from "../../lib/auth/auth-errors.ts";
import { getDeterministicRootRoute } from "../../lib/root-route-policy.ts";

function source(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const getCurrentUser = source("../../lib/auth/get-current-user.ts");
const getCurrentProfile = source("../../lib/auth/get-current-profile.ts");
const getCurrentMembership = source("../../lib/auth/get-current-membership.ts");
const getCurrentOrganisation = source("../../lib/auth/get-current-organisation.ts");
const getAuthContext = source("../../lib/auth/get-auth-context.ts");
const permissions = source("../../lib/auth/permissions.ts");
const enabledModules = source("../../lib/auth/get-current-enabled-modules.ts");
const appShellContext = source("../../lib/app-shell-context.ts");
const requirePermission = source("../../lib/auth/require-permission.ts");
const requireAuth = source("../../lib/auth/require-auth.ts");
const deliveryData = source("../../lib/delivery-configuration-data.ts");
const shopifyData = source("../../lib/shopify-integration-data.ts");
const serverClient = source("../../lib/supabase/server.ts");
const browserClient = source("../../lib/supabase/client.ts");
const cookieOptions = source("../../lib/supabase/cookie-options.ts");
const appSidebar = source("../../components/app-sidebar.tsx");
const platformShell = source("../../components/platform/platform-shell.tsx");
const supportShell = source("../../components/support/support-shell.tsx");
const shopifyNav = source("../../components/shopify/shopify-workspace-nav.tsx");
const shopifyPage = source("../../app/shopify/page.tsx");
const middleware = source("../../middleware.ts");
const appError = source("../../app/error.tsx");
const appPage = source("../../app/page.tsx");
const loginPage = source("../../app/login/page.tsx");
const authObservability = source("../../lib/auth/auth-observability.ts");

test("status 400 with the Supabase missing-session error remains signed out", () => {
  const error = {
    name: "AuthSessionMissingError",
    status: 400,
    code: null,
    message: "Auth session missing!",
  };

  assert.deepEqual(getAuthErrorDiagnostic(error), {
    classification: "signed_out",
    code: null,
    messageCategory: "missing_session",
    name: "AuthSessionMissingError",
    status: 400,
  });
  assert.equal(isUnauthenticatedAuthError(error), true);
  assert.equal(resolveAuthUserError(error), null);
});

test("expired and revoked refresh/session evidence remains signed out", () => {
  for (const error of [
    { status: 401, code: "unauthorized" },
    { status: 400, code: "session_not_found" },
    { status: 400, code: "session_expired" },
    { status: 400, code: "refresh_token_not_found" },
    { status: 400, code: "refresh_token_already_used" },
    { status: 400, message: "Invalid Refresh Token: Refresh Token Not Found" },
  ]) {
    assert.equal(isUnauthenticatedAuthError(error), true);
    assert.equal(resolveAuthUserError(error), null);
  }
});

test("status 400 configuration/request failures are not silently signed out", () => {
  for (const error of [
    { status: 400, message: "Invalid API key" },
    { status: 400, code: "bad_json", message: "Request body is not valid JSON" },
  ]) {
    assert.equal(getAuthErrorDiagnostic(error).classification, "configuration");
    assert.equal(isUnauthenticatedAuthError(error), false);
    assert.throws(() => resolveAuthUserError(error), (thrown) =>
      thrown instanceof AuthConfigurationError &&
      thrown.classification === "configuration",
    );
  }
});

test("Auth 429 remains a temporary infrastructure failure", () => {
  const error = { status: 429, code: "over_request_rate_limit" };

  assert.equal(getAuthErrorDiagnostic(error).classification, "temporary");
  assert.throws(() => resolveAuthUserError(error), (thrown) =>
    thrown instanceof AuthInfrastructureError &&
    thrown.classification === "temporary",
  );
});

test("network failures remain temporary infrastructure failures", () => {
  const error = { name: "AuthRetryableFetchError", message: "fetch failed" };

  assert.equal(getAuthErrorDiagnostic(error).classification, "temporary");
  assert.throws(() => resolveAuthUserError(error), AuthInfrastructureError);
});

test("Auth 5xx responses remain temporary infrastructure failures", () => {
  const error = { status: 500, code: "unexpected_failure" };

  assert.equal(getAuthErrorDiagnostic(error).classification, "temporary");
  assert.throws(() => resolveAuthUserError(error), AuthInfrastructureError);
});

test("a null structured code is classified by named/message evidence, not status alone", () => {
  assert.equal(
    getAuthErrorDiagnostic({
      status: 400,
      code: null,
      message: "Auth session missing!",
    }).classification,
    "signed_out",
  );
  assert.equal(
    getAuthErrorDiagnostic({
      status: 400,
      code: null,
      message: "Invalid project URL",
    }).classification,
    "configuration",
  );
  assert.equal(
    getAuthErrorDiagnostic({
      status: 400,
      code: null,
      message: "Unrecognised Auth response",
    }).classification,
    "unexpected",
  );
  assert.throws(
    () =>
      resolveAuthUserError({
        status: 400,
        code: null,
        message: "Unrecognised Auth response",
      }),
    AuthUnexpectedError,
  );
});

test("the verified user lookup remains one request-cached network validation", () => {
  assert.equal((getCurrentUser.match(/auth\.getUser\(\)/g) ?? []).length, 1);
  assert.match(getCurrentUser, /export const getCurrentUser = cache/);
  assert.match(getCurrentUser, /resolveAuthUserError\(error\)/);
  assert.doesNotMatch(getCurrentUser, /if \(error\) \{\s*return null/);
  assert.match(serverClient, /const createRequestClient = cache/);
  assert.match(serverClient, /return createRequestClient\(\)/);
  assert.doesNotMatch(serverClient, /let currentUser|globalThis|unstable_cache/);
});

test("nested access and shell helpers reuse request-scoped auth context", () => {
  for (const helper of [
    getCurrentProfile,
    getCurrentMembership,
    getCurrentOrganisation,
    getAuthContext,
    permissions,
    enabledModules,
    appShellContext,
  ]) {
    assert.match(helper, /cache\(/);
    assert.doesNotMatch(helper, /auth\.getUser\(\)/);
  }
});

test("permission denial and direct Task 235 guards remain authoritative", () => {
  assert.match(requirePermission, /redirect\("\/no-access"\)/);
  assert.match(deliveryData, /requirePermissionAccessWithPermissions\("admin\.integrations\.view"\)/);
  assert.match(shopifyData, /requirePermissionAccessWithPermissions\("admin\.integrations\.view"\)/);
  assert.doesNotMatch(deliveryData, /service[_-]?role/i);
  assert.doesNotMatch(shopifyData, /service[_-]?role/i);
});

test("every root app mode has a deterministic host-routing decision", () => {
  assert.deepEqual(getDeterministicRootRoute("marketing"), {
    action: "redirect",
    href: "https://app.everybatchmrp.com/login",
  });
  assert.deepEqual(getDeterministicRootRoute("central_app"), {
    action: "redirect",
    href: "/select-workspace",
  });
  assert.deepEqual(getDeterministicRootRoute("tenant_app"), {
    action: "redirect",
    href: "/dashboard",
  });
  assert.deepEqual(
    getDeterministicRootRoute("tenant_app", { isActiveTenant: false }),
    { action: "redirect", href: "/login" },
  );
  assert.deepEqual(getDeterministicRootRoute("platform_admin"), {
    action: "redirect",
    href: "/platform",
  });
  assert.deepEqual(getDeterministicRootRoute("support"), {
    action: "rewrite",
    href: "/support",
  });
  assert.deepEqual(getDeterministicRootRoute("local_dev"), {
    action: "redirect",
    href: "/dashboard",
  });
  assert.deepEqual(getDeterministicRootRoute("unknown"), {
    action: "redirect",
    href: "/login",
  });
});

test("deterministic root routing performs no Supabase Auth verification", () => {
  assert.match(middleware, /getDeterministicRootRoute/);
  assert.doesNotMatch(appPage, /requireAppAccess|getCurrentUser|auth\.getUser/);
  assert.doesNotMatch(middleware, /supabase|auth\.getUser|getSession|refreshSession/i);
});

test("stale and duplicate legacy cookie failures reach login without a 500 loop", () => {
  for (const error of [
    { status: 400, code: "refresh_token_not_found" },
    {
      name: "AuthSessionMissingError",
      status: 400,
      message: "Auth session missing!",
    },
  ]) {
    assert.equal(resolveAuthUserError(error), null);
  }

  assert.match(requireAuth, /if \(!user\) \{\s*redirect\("\/login"\)/);
  assert.match(loginPage, /if \(user\)/);
  assert.doesNotMatch(loginPage, /if \(!user\).*redirect/);
  assert.deepEqual(getDeterministicRootRoute("support"), {
    action: "rewrite",
    href: "/support",
  });
});

test("the browser Supabase client is a singleton without auth listener churn", () => {
  assert.match(browserClient, /let browserClient:/);
  assert.match(browserClient, /if \(browserClient\) \{\s*return browserClient/);
  assert.equal((browserClient.match(/createBrowserClient\(/g) ?? []).length, 1);
  assert.doesNotMatch(browserClient, /onAuthStateChange|refreshSession|getSession/);
});

test("production support shares the EveryBatch session while local and preview hosts do not", () => {
  assert.match(cookieOptions, /domain: EVERYBATCH_AUTH_COOKIE_DOMAIN/);
  assert.match(cookieOptions, /parsedHost\.isLocalhost/);
  assert.match(cookieOptions, /parsedHost\.isPreview/);
  assert.match(cookieOptions, /parsedHost\.mode === "marketing"/);
  assert.doesNotMatch(cookieOptions, /parsedHost\.mode === "support"/);
});

test("dense authenticated navigation does not prefetch sibling route trees", () => {
  assert.equal((shopifyNav.match(/prefetch=\{false\}/g) ?? []).length, 1);
  assert.equal((shopifyPage.match(/prefetch=\{false\}/g) ?? []).length, 1);
  assert.ok((appSidebar.match(/prefetch=\{false\}/g) ?? []).length >= 4);
  assert.ok((platformShell.match(/prefetch=\{false\}/g) ?? []).length >= 5);
  assert.ok((supportShell.match(/prefetch=\{false\}/g) ?? []).length >= 3);

  const shopifyWorkspaceLinks = (shopifyNav.match(/\["[^"]+", "\/[^"]+"\]/g) ?? []).length;
  const shopifyConfigurationLinks = (shopifyPage.match(/\["[^"]+", "[^"]+", "\/[^"]+"\]/g) ?? []).length;
  assert.equal(shopifyWorkspaceLinks, 7);
  assert.equal(shopifyConfigurationLinks, 6);
});

test("transient auth failure has a safe retry state and does not become empty data", () => {
  assert.match(appError, /Workspace temporarily unavailable/);
  assert.match(appError, /No access decision or tenant data\s+has been assumed/);
  assert.match(appError, /onClick=\{reset\}/);
  assert.doesNotMatch(appError, /token|cookie|ciphertext/i);
});

test("failure-only Auth diagnostics expose categories and booleans, never secrets", () => {
  assert.match(authObservability, /diagnostic\.classification === "signed_out"/);
  assert.match(authObservability, /authCookiePresent/);
  assert.match(authObservability, /duplicateAuthCookieName/);
  assert.match(authObservability, /authMessageCategory/);
  assert.match(authObservability, /requestKind/);
  assert.doesNotMatch(
    authObservability,
    /cookie\.value|authorization|access[_-]?token|refresh[_-]?token|error\.message/i,
  );
});

test("middleware remains free of Supabase and session reads", () => {
  assert.doesNotMatch(middleware, /supabase|auth\.getUser|getSession|refreshSession/i);
});
