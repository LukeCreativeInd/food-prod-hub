import { redirect } from "next/navigation";

import { LoginBrandPanel } from "@/components/auth/login-brand-panel";
import { LoginFormCard } from "@/components/auth/login-form-card";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#eef4ea] px-5 py-8 md:px-8 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <LoginBrandPanel mode="platform" />
        <LoginFormCard mode="platform" />
      </div>
    </div>
  );
}
