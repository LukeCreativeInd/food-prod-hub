import { getCurrentMembership } from "@/lib/auth/get-current-membership";
import type { CurrentOrganisation } from "@/lib/auth/types";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentOrganisation(): Promise<CurrentOrganisation | null> {
  const membership = await getCurrentMembership();

  if (!membership) {
    return null;
  }

  if (
    membership.organisation?.status === "active" &&
    !membership.organisation.archived_at
  ) {
    return membership.organisation;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organisations")
    .select("id, name, slug, industry, status, created_at, updated_at, archived_at")
    .eq("id", membership.organisation_id)
    .eq("status", "active")
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    return null;
  }

  return (data as CurrentOrganisation | null) ?? null;
}
