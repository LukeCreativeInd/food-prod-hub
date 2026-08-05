import { cache } from "react";

import { resolveAuthUserError } from "@/lib/auth/auth-errors";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return resolveAuthUserError(error);
  }

  return data.user ?? null;
});
