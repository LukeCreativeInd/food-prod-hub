import { cache } from "react";

import { getCurrentMembership } from "@/lib/auth/get-current-membership";
import { getCurrentOrganisation } from "@/lib/auth/get-current-organisation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export const getAuthContext = cache(async function getAuthContext() {
  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;
  const membership = profile ? await getCurrentMembership() : null;
  const organisation = membership ? await getCurrentOrganisation() : null;

  return {
    user,
    profile,
    membership,
    organisation,
    roleKey: membership?.role_key ?? null,
    isAuthenticated: Boolean(user),
    hasMembership: Boolean(membership),
  };
});
