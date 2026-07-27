import { NextResponse } from "next/server";

import { getCurrentUserWorkspaceOptions } from "@/lib/workspace-options";

const allowedPostLoginHrefs = new Set([
  "/dashboard",
  "/select-workspace",
  "/platform",
  "/no-access",
]);

export async function GET() {
  const workspaceOptions = await getCurrentUserWorkspaceOptions();
  const href = workspaceOptions.defaultDestination.href;
  const destination = allowedPostLoginHrefs.has(href) ? href : "/dashboard";

  return NextResponse.json({ destination });
}
