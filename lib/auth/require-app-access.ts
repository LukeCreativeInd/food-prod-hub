import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth/get-auth-context";

export async function requireAppAccess() {
  const authContext = await getAuthContext();

  if (!authContext.user) {
    redirect("/login");
  }

  if (
    !authContext.profile ||
    !authContext.membership ||
    !authContext.organisation
  ) {
    redirect("/access-issue");
  }

  return authContext;
}
