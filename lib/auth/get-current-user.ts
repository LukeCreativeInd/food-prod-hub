import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user ?? null;
});
