import {
  PLATFORM_BRAND_CATEGORY,
  PLATFORM_BRAND_NAME,
  PLATFORM_BRAND_TAGLINE,
} from "@/lib/platform-brand";

export type LoginBrandMode = "platform" | "tenant";

type LoginBrandPanelProps = {
  mode: LoginBrandMode;
  tenantName?: string;
  tenantLogoUrl?: string | null;
};

function PlatformMark() {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-300 text-base font-black text-green-950 shadow-lg shadow-green-950/20 ring-1 ring-white/20">
      <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white/80" />
      EB
    </div>
  );
}

function TenantLogo({ tenantName, tenantLogoUrl }: LoginBrandPanelProps) {
  if (tenantLogoUrl) {
    return (
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-lg shadow-green-950/20 ring-1 ring-white/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tenantLogoUrl}
          alt={`${tenantName ?? "Tenant"} logo`}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-sm font-black text-white shadow-lg shadow-green-950/20 ring-1 ring-white/25">
      {(tenantName ?? "Tenant")
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 2)}
    </div>
  );
}

export function LoginBrandPanel({
  mode,
  tenantName = "Clean Eats Hub",
  tenantLogoUrl = null,
}: LoginBrandPanelProps) {
  const isTenantMode = mode === "tenant";
  const heading = isTenantMode ? tenantName : PLATFORM_BRAND_NAME;
  const eyebrow = isTenantMode ? "Workspace login" : PLATFORM_BRAND_CATEGORY;
  const supportingCopy = isTenantMode
    ? "Access your tenant workspace with secure EveryBatch account access."
    : "Access recipes, production, inventory, purchasing and traceability in one place.";

  return (
    <section className="relative h-full overflow-hidden rounded-3xl bg-green-950 px-6 py-7 text-white shadow-2xl shadow-green-950/25 md:px-8 md:py-9">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(190,242,100,0.28),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(34,197,94,0.18),transparent_28%)]" />
      <div className="relative flex h-full flex-col justify-between gap-10">
        <div>
          <div className="flex items-center gap-4">
            {isTenantMode ? (
              <TenantLogo
                mode={mode}
                tenantName={tenantName}
                tenantLogoUrl={tenantLogoUrl}
              />
            ) : (
              <PlatformMark />
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-200">
                {eyebrow}
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                {heading}
              </h1>
            </div>
          </div>

          <p className="mt-8 max-w-md text-3xl font-black leading-tight tracking-tight md:text-4xl">
            Sign in to your workspace.
          </p>
          <p className="mt-5 max-w-md text-base leading-7 text-green-50/85">
            {supportingCopy}
          </p>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur">
            <p className="text-sm font-bold text-lime-100">
              {PLATFORM_BRAND_TAGLINE}
            </p>
          </div>
          {isTenantMode ? (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-100/80">
              Powered by {PLATFORM_BRAND_NAME}
            </p>
          ) : (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-100/80">
              Secure workspace gateway
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
