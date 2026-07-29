import { LoginForm } from "@/app/login/login-form";
import { PLATFORM_BRAND_NAME } from "@/lib/platform-brand";

type LoginFormCardProps = {
  mode: "platform" | "tenant";
  tenantName?: string;
};

export function LoginFormCard({
  mode,
  tenantName = "Clean Eats Hub",
}: LoginFormCardProps) {
  const isTenantMode = mode === "tenant";

  return (
    <section className="flex h-full flex-col justify-center rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 md:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-clean-green-700">
          Secure access
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
          {isTenantMode ? `Sign in to ${tenantName}` : "Sign in to EveryBatch"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {isTenantMode
            ? `Use your ${tenantName} workspace account to continue.`
            : "Use your workspace account to continue."}
        </p>
      </div>

      <LoginForm />

      <div className="mt-6 rounded-2xl border border-green-100 bg-green-50/80 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-clean-green-700">
          Your workspace, connected
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          EveryBatch keeps each tenant workspace separated and secure across
          products, production, inventory, purchasing and costings.
        </p>
      </div>

      <p className="mt-5 text-center text-xs font-semibold text-slate-500">
        {isTenantMode ? `Powered by ${PLATFORM_BRAND_NAME}` : PLATFORM_BRAND_NAME}
      </p>
    </section>
  );
}
