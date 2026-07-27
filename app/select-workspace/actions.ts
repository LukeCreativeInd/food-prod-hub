"use server";

import { redirect } from "next/navigation";

import { validateWorkspaceSelection } from "@/lib/workspace-options";

export async function selectWorkspaceAction(formData: FormData) {
  const slug = formData.get("slug");
  const validation = await validateWorkspaceSelection(
    typeof slug === "string" ? slug : "",
  );

  if (validation.isValid) {
    redirect(validation.destination.href);
  }

  redirect(`/select-workspace?error=${validation.reason}`);
}
