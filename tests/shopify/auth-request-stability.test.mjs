import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  AuthInfrastructureError,
  isUnauthenticatedAuthError,
  resolveAuthUserError,
} from "../../lib/auth/auth-errors.ts";

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

test("missing, expired and revoked sessions remain signed-out states", () => {
  for (const error of [
    { status: 401, code: "unauthorized" },
    { status: 400, code: "session_not_found" },
    { status: 400, code: "refresh_token_not_found" },
    { status: 400, code: "refresh_token_already_used" },
    { status: 400, message: "Invalid Refresh Token: Refresh Token Not Found" },
  ]) {
    assert.equal(isUnauthenticatedAuthError(error), true);
    assert.equal(resolveAuthUserError(error), null);
  }
});

test("rate limits and auth infrastructure failures never become signed-out states", () => {
  for (const error of [
    { status: 429, code: "over_request_rate_limit" },
    { status: 500, code: "unexpected_failure" },
    { message: "fetch failed" },
  ]) {
    assert.equal(isUnauthenticatedAuthError(error), false);
    assert.throws(
      () => resolveAuthUserError(error),
      (thrown) =>
        thrown instanceof AuthInfrastructureError &&
        thrown.message === "Secure session verification is temporarily unavailable.",
    );
  }
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

test("middleware remains free of Supabase and session reads", () => {
  assert.doesNotMatch(middleware, /supabase|auth\.getUser|getSession|refreshSession/i);
});
