"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type LogoutButtonProps = {
  variant?: "sidebar" | "light";
};

const variantStyles: Record<NonNullable<LogoutButtonProps["variant"]>, string> = {
  sidebar:
    "w-full border-white/10 px-3 py-2 text-left text-emerald-50/80 hover:bg-white/10 hover:text-white",
  light:
    "inline-flex w-auto items-center justify-center border-green-200 bg-white px-3 py-2 text-clean-green-900 hover:bg-green-50 hover:text-clean-green-950",
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
      className={`rounded-md border text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantStyles[variant]}`}
    >
      {isLoading ? "Signing out..." : "Sign out"}
    </button>
  );
}
