import { getCurrentUser } from "@/lib/auth/get-current-user";
import type { CurrentProfile } from "@/lib/auth/types";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, avatar_url, status, created_at, updated_at, archived_at",
    )
    .eq("id", user.id)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    return null;
  }

  return (data as CurrentProfile | null) ?? null;
}
