import { NextResponse } from "next/server";

import {
  getCurrentUserWorkspaceOptions,
  getWorkspaceDestinationHref,
} from "@/lib/workspace-options";

const allowedPostLoginHrefs = new Set([
  "/dashboard",
  "/select-workspace",
  "/platform",
  "/no-access",
]);

function getRequestHost(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");

  return forwardedHost ?? request.headers.get("host");
}

export async function GET(request: Request) {
  const workspaceOptions = await getCurrentUserWorkspaceOptions();
  const fallbackHref = workspaceOptions.defaultDestination.href;
  const href = allowedPostLoginHrefs.has(fallbackHref)
    ? getWorkspaceDestinationHref(workspaceOptions.defaultDestination, {
        currentHost: getRequestHost(request),
      })
    : "/dashboard";

  return NextResponse.json({ destination: href });
}
