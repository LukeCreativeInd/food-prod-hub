import { cache } from "react";

import { logAuthVerificationFailure } from "@/lib/auth/auth-observability";
import { resolveAuthUserError } from "@/lib/auth/auth-errors";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    try {
      return resolveAuthUserError(error);
    } catch (resolvedError) {
      await logAuthVerificationFailure(error);
      throw resolvedError;
    }
  }

  return data.user ?? null;
});
