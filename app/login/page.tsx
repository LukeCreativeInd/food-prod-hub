import { redirect } from "next/navigation";

import { LoginForm } from "@/app/login/login-form";
import { getCurrentUser } from "@/lib/auth";

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
            CE
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-clean-green-700">
              Clean Eats Hub
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Sign in
            </h1>
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-slate-600">
          Access the internal food operations hub for Clean Eats Australia.
        </p>

        <div className="mt-5 rounded-md border border-green-100 bg-green-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase text-clean-green-700">
            Secure foundation
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Login uses Supabase Auth. Tenant access, permissions and module
            visibility are checked after sign-in.
          </p>
        </div>

        <LoginForm />
      </section>
    </div>
  );
}
