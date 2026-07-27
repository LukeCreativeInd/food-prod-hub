import { redirect } from "next/navigation";

import { LoginForm } from "@/app/login/login-form";
import { getCurrentUser } from "@/lib/auth";
import {
  PLATFORM_BRAND_CATEGORY,
  PLATFORM_BRAND_NAME,
  PLATFORM_BRAND_TAGLINE,
} from "@/lib/platform-brand";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7f2] px-5 py-10 md:px-8">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-green-100/80 to-transparent" />
      <section className="relative w-full max-w-md rounded-lg border border-white bg-white/90 p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200/70 backdrop-blur md:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-clean-green-700 text-sm font-bold text-white shadow-sm">
            EB
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-clean-green-700">
              {PLATFORM_BRAND_CATEGORY}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              {PLATFORM_BRAND_NAME}
            </h1>
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-slate-600">
          Sign in to your workspace.
          <span className="mt-2 block font-semibold text-slate-800">
            {PLATFORM_BRAND_TAGLINE}
          </span>
        </p>

        <div className="mt-5 rounded-md border border-green-100 bg-green-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase text-clean-green-700">
            Workspace access
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Clean Eats Hub is Tenant 1 during this foundation build. Tenant
            access, permissions and module visibility are checked after sign-in.
          </p>
        </div>

        <LoginForm />
        <p className="mt-5 text-center text-xs text-slate-500">
          Powered by {PLATFORM_BRAND_NAME}
        </p>
      </section>
    </div>
  );
}
