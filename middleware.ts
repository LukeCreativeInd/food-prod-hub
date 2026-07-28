import { NextResponse, type NextRequest } from "next/server";

import {
  getPlatformAdminAppModeRedirect,
  resolveAppModeFromHeaders,
} from "@/lib/app-mode-routing";

export function middleware(request: NextRequest) {
  const resolvedMode = resolveAppModeFromHeaders(request.headers);

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
