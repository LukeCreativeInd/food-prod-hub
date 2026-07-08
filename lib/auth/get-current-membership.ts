import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import type { CurrentMembership } from "@/lib/auth/types";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentMembership(): Promise<CurrentMembership | null> {
  const profile = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organisation_memberships")
    .select(
      `
        id,
        organisation_id,
        profile_id,
        role_key,
        team,
        access_level,
        status,
        invited_at,
        joined_at,
        created_at,
        updated_at,
        archived_at,
        organisation:organisations!inner (
          id,
          name,
          slug,
          industry,
          status,
          created_at,
          updated_at,
          archived_at
        )
      `,
    )
    .eq("profile_id", profile.id)
    .eq("status", "active")
    .is("archived_at", null)
    .eq("organisations.slug", "cleaneats")
    .eq("organisations.status", "active")
    .is("organisations.archived_at", null)
    .maybeSingle();

  if (error) {
    return null;
  }

  return (data as CurrentMembership | null) ?? null;
}
