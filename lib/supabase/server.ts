import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { cache } from "react";

import { getSupabaseAuthCookieOptionsForHost } from "@/lib/supabase/cookie-options";

function getSupabasePublicConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase public environment variables.");
  }

  return { supabaseUrl, supabaseAnonKey };
}

const createRequestClient = cache(async function createRequestClient() {
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicConfig();
  const currentHost =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: getSupabaseAuthCookieOptionsForHost(currentHost),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies. Middleware/actions can.
        }
      },
    },
  });
});

export async function createClient() {
  return createRequestClient();
}
