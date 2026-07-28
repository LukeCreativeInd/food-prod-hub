import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { isValidTenantSlug } from "@/lib/tenant-resolver";

export type ResolvedTenant = {
  id: string;
  slug: string;
  name: string;
  status: string;
};

export const resolveTenantFromSlug = cache(
  async function resolveTenantFromSlug(
    slug: string,
  ): Promise<ResolvedTenant | null> {
    if (!isValidTenantSlug(slug)) {
      return null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("organisations")
      .select("id, slug, name, status")
      .eq("slug", slug)
      .eq("status", "active")
      .is("archived_at", null)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as ResolvedTenant;
  },
);
