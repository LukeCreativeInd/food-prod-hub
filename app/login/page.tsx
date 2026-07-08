import { LoginForm } from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10 md:px-8">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-clean-green-700 text-sm font-bold text-white">
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
          Use your Supabase Auth email and password to access the operations
          hub. Profiles and memberships will be connected in a later step.
        </p>

        <LoginForm />
      </section>
    </div>
  );
}
