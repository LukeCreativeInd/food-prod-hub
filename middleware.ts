import { NextResponse, type NextRequest } from "next/server";

import {
  getCentralAppModeRedirect,
  isActiveTenantSubdomain,
  getPlatformAdminAppModeRedirect,
  getSupportAppModeRedirect,
  getSupportAppModeRewritePath,
  getTenantAppModeRedirect,
  resolveAppModeFromHeaders,
} from "@/lib/app-mode-routing";
import { PLATFORM_APP_DOMAIN } from "@/lib/platform-brand";
import { getDeterministicRootRoute } from "@/lib/root-route-policy";

export function middleware(request: NextRequest) {
  const resolvedMode = resolveAppModeFromHeaders(request.headers);

  if (request.nextUrl.pathname === "/") {
    const rootRoute = getDeterministicRootRoute(resolvedMode.mode, {
      centralAppDomain: PLATFORM_APP_DOMAIN,
      isActiveTenant: isActiveTenantSubdomain(resolvedMode),
    });
    const rootUrl = rootRoute.href.startsWith("http")
      ? new URL(rootRoute.href)
      : new URL(rootRoute.href, request.url);

    return rootRoute.action === "rewrite"
      ? NextResponse.rewrite(rootUrl)
      : NextResponse.redirect(rootUrl);
  }

  if (resolvedMode.mode === "tenant_app") {
    const redirectIntent = getTenantAppModeRedirect(
      request.nextUrl.pathname,
      resolvedMode,
    );

    if (!redirectIntent.shouldRedirect) {
      return NextResponse.next();
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirectIntent.href;
    redirectUrl.search = "";

    return NextResponse.redirect(redirectUrl);
  }

  if (resolvedMode.mode === "central_app") {
    const redirectIntent = getCentralAppModeRedirect(
      request.nextUrl.pathname,
    );

    if (!redirectIntent.shouldRedirect) {
      return NextResponse.next();
    }

    const redirectUrl = redirectIntent.href.startsWith("http")
      ? new URL(redirectIntent.href)
      : new URL(redirectIntent.href, request.url);

    return NextResponse.redirect(redirectUrl);
  }

  if (resolvedMode.mode === "support") {
    const redirectIntent = getSupportAppModeRedirect(request.nextUrl.pathname);

    if (redirectIntent.shouldRedirect) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = redirectIntent.href;
      redirectUrl.search = "";

      return NextResponse.redirect(redirectUrl);
    }

    const rewritePath = getSupportAppModeRewritePath(request.nextUrl.pathname);

    if (!rewritePath) {
      return NextResponse.next();
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = rewritePath;

    return NextResponse.rewrite(rewriteUrl);
  }

  if (resolvedMode.mode !== "platform_admin") {
    return NextResponse.next();
  }

  const redirectIntent = getPlatformAdminAppModeRedirect(
    request.nextUrl.pathname,
  );

  if (!redirectIntent.shouldRedirect) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = redirectIntent.href;
  redirectUrl.search = "";

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
