import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const appModeRouting = readFileSync(
  new URL("../../lib/app-mode-routing.ts", import.meta.url),
  "utf8",
);
const middleware = readFileSync(
  new URL("../../middleware.ts", import.meta.url),
  "utf8",
);
const navigation = readFileSync(
  new URL("../../lib/navigation.ts", import.meta.url),
  "utf8",
);
const demandData = readFileSync(
  new URL("../../lib/production-demand-data.ts", import.meta.url),
  "utf8",
);
const requirePermission = readFileSync(
  new URL("../../lib/auth/require-permission.ts", import.meta.url),
  "utf8",
);
const migrationsDirectory = new URL("../../supabase/migrations/", import.meta.url);
const migration051 = readFileSync(
  new URL("051_production_demand_contribution_foundation.sql", migrationsDirectory),
  "utf8",
);
const migration052 = readFileSync(
  new URL("052_production_demand_digest_schema_fix.sql", migrationsDirectory),
  "utf8",
);

function sha256(source) {
  return createHash("sha256").update(source).digest("hex");
}

function extractFunction(name, nextName) {
  const start = appModeRouting.indexOf(`export function ${name}`);
  const end = nextName
    ? appModeRouting.indexOf(`export function ${nextName}`, start)
    : appModeRouting.length;

  assert.notEqual(start, -1, `${name} must exist`);
  assert.notEqual(end, -1, `${nextName} must exist`);
  return appModeRouting.slice(start, end);
}

const prefixBlock = appModeRouting.match(
  /const tenantRoutePrefixes = \[([\s\S]*?)\];/,
)?.[1];
assert.ok(prefixBlock, "tenantRoutePrefixes must exist");
const tenantRoutePrefixes = [...prefixBlock.matchAll(/"([^"]+)"/g)].map(
  (match) => match[1],
);

function pathMatchesPrefix(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isCanonicalTenantRoute(pathname) {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return tenantRoutePrefixes.some((prefix) => pathMatchesPrefix(path, prefix));
}

test("Production Demand is registered once as a canonical tenant route", () => {
  assert.equal(
    tenantRoutePrefixes.filter((prefix) => prefix === "/production-demand")
      .length,
    1,
  );
  assert.equal(isCanonicalTenantRoute("/production-demand"), true);
  assert.equal(isCanonicalTenantRoute("/production-demand/"), true);
  assert.equal(isCanonicalTenantRoute("/production-demand/source/123"), true);
  assert.equal(
    isCanonicalTenantRoute(
      new URL("https://cleaneats.everybatchmrp.com/production-demand?date=2026-08-10")
        .pathname,
    ),
    true,
  );
});

test("Production Demand exact-prefix semantics do not capture unrelated routes", () => {
  assert.equal(isCanonicalTenantRoute("/production-demanding"), false);
  assert.equal(isCanonicalTenantRoute("/platform/production-demand"), false);
  assert.equal(pathMatchesPrefix("/production", "/production-demand"), false);
  assert.equal(pathMatchesPrefix("/production-plan", "/production-demand"), false);

  for (const existingRoute of [
    "/production",
    "/production-plan",
    "/products",
    "/qa/receiving",
    "/logistics/dispatch-runs",
    "/shopify",
  ]) {
    assert.equal(isCanonicalTenantRoute(existingRoute), true);
  }
});

test("all production hosts classify the route through the shared canonical policy", () => {
  const tenant = extractFunction(
    "getTenantAppModeRedirect",
    "getSupportAppModeRedirect",
  );
  const central = extractFunction(
    "getCentralAppModeRedirect",
    "getTenantAppModeRedirect",
  );
  const platform = extractFunction(
    "getPlatformAdminAppModeRedirect",
    "getCentralAppModeRedirect",
  );
  const support = extractFunction(
    "getSupportAppModeRedirect",
    "getAppModeRedirect",
  );

  assert.match(
    tenant,
    /if \(isTenantAppCanonicalRoute\(path\)\)[\s\S]*shouldRedirect: false/,
  );
  assert.match(
    central,
    /if \(isTenantAppCanonicalRoute\(path\)\)[\s\S]*href: `\/select-workspace\?next=/,
  );
  assert.match(
    platform,
    /isTenantAppCanonicalRoute\(path\)[\s\S]*href: "\/platform"/,
  );
  assert.match(
    support,
    /if \(isTenantAppCanonicalRoute\(path\)\)[\s\S]*href: "\/"/,
  );
});

test("marketing, unknown and local behavior retain the shared app-mode policy", () => {
  const routeAllowed = extractFunction(
    "isRouteAllowedForAppMode",
    "getPlatformAdminAppModeRedirect",
  );

  assert.match(routeAllowed, /resolvedMode\.mode === "local_dev"[\s\S]*return true/);
  assert.match(
    routeAllowed,
    /resolvedMode\.mode === "marketing"[\s\S]*return path === "\/"/,
  );
  assert.match(routeAllowed, /return false;\s*}/);
});

test("middleware delegates host isolation without a Production Demand exception", () => {
  assert.doesNotMatch(middleware, /production-demand/);
  for (const helper of [
    "getTenantAppModeRedirect",
    "getCentralAppModeRedirect",
    "getPlatformAdminAppModeRedirect",
    "getSupportAppModeRedirect",
  ]) {
    assert.match(middleware, new RegExp(`${helper}\\(`));
  }
  assert.match(middleware, /request\.nextUrl\.pathname/);
});

test("Production Demand remains read-gated and appears once in Production navigation", () => {
  assert.match(
    demandData,
    /requirePermissionAccessWithPermissions\("production\.view"\)/,
  );
  assert.doesNotMatch(demandData, /production\.manage[\s\S]*requirePermissionAccess/);
  assert.match(
    requirePermission,
    /if \(!permissionKeys\.includes\(permissionKey\)\) \{\s*redirect\("\/no-access"\)/,
  );

  const productionStart = navigation.indexOf('label: "Production"');
  const qaStart = navigation.indexOf('label: "QA"', productionStart);
  const productionNavigation = navigation.slice(productionStart, qaStart);
  assert.equal(
    (productionNavigation.match(/href: "\/production-demand"/g) ?? []).length,
    1,
  );
  assert.match(
    productionNavigation,
    /label: "Production Demand"[\s\S]*requiredPermission: "production\.view"/,
  );
});

test("Task 237 nested routes leave Task 236 migrations immutable and use one Migration 053", () => {
  assert.equal(
    sha256(migration051),
    "388504209314465b3e9b5774cd57480492d4f087944dcda1603e5e49a1621cd4",
  );
  assert.equal(
    sha256(migration052),
    "39952e96feb877c214f5b6503639038351899246c30a419189157ac9d35c57dd",
  );
  assert.equal(
    readdirSync(migrationsDirectory).filter((name) => name.startsWith("053_")).length,
    1,
  );
});
