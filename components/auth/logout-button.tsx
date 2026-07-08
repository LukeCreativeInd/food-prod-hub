"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type LogoutButtonProps = {
  variant?: "sidebar" | "light";
};

const variantStyles: Record<NonNullable<LogoutButtonProps["variant"]>, string> = {
  sidebar:
    "border-white/10 text-emerald-50/80 hover:bg-white/10 hover:text-white",
  light:
    "border-green-200 bg-white text-clean-green-900 hover:bg-green-50 hover:text-clean-green-950",
};

export function LogoutButton({ variant = "sidebar" }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Unable to sign out.", error.message);
        return;
      }

      router.refresh();
      router.push("/login");
    } catch (error) {
      console.error("Unable to sign out.", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={`w-full rounded-md border px-3 py-2 text-left text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantStyles[variant]}`}
    >
      {isLoading ? "Signing out..." : "Sign out"}
    </button>
  );
}
