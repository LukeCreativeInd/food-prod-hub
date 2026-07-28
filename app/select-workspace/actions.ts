"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import {
  getWorkspaceDestinationHref,
  validateWorkspaceSelection,
} from "@/lib/workspace-options";

function getSafeNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return null;
  }

  if (value.startsWith("//")) {
    return null;
  }

  return value;
}

export async function selectWorkspaceAction(formData: FormData) {
  const slug = formData.get("slug");
  const nextPath = getSafeNextPath(formData.get("next"));
  const validation = await validateWorkspaceSelection(
    typeof slug === "string" ? slug : "",
  );

  if (validation.isValid) {
    const requestHeaders = await headers();
    const currentHost =
      requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

    redirect(
      getWorkspaceDestinationHref(validation.destination, {
        currentHost,
        nextPath,
      }),
    );
  }

  redirect(`/select-workspace?error=${validation.reason}`);
}
