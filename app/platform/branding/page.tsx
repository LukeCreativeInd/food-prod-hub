import { SectionCard, StatusBadge } from "@/components/ui";
import { brandAssetKinds, type BrandAssetKind } from "@/lib/brand-asset-plan";
import {
  PLATFORM_ADMIN_DOMAIN,
  PLATFORM_BRAND_NAME,
  PLATFORM_PRODUCT_LINE,
} from "@/lib/platform-brand";
import { createClient } from "@/lib/supabase/server";

type PlatformBrandingAssetRow = {
  asset_key: string;
  asset_kind: string;
  display_name: string;
  storage_bucket: string | null;
  storage_path: string | null;
  public_url: string | null;
  status: string;
  notes: string | null;
  updated_at: string | null;
};

const plannedSlots = [
  {
    kind: "logo_full",
    label: "Full logo",
    purpose: "Expanded Platform Admin sidebar, central login and brand headers.",
  },
  {
    kind: "logo_icon",
    label: "Icon",
    purpose: "Collapsed Platform Admin sidebar and compact EveryBatch surfaces.",
  },
  {
    kind: "favicon",
    label: "Favicon",
    purpose: "Browser tab and installed app icon. Static repo asset remains active.",
  },
  {
    kind: "login_brand_image",
    label: "Login brand image",
    purpose: "Optional future central login visual or campaign surface.",
  },
] satisfies Array<{
  kind: BrandAssetKind;
  label: string;
  purpose: string;
}>;

function formatDate(value: string | null) {
  if (!value) {
    return "Not updated";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function PlatformBrandingPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("platform_branding_assets")
    .select(
      "asset_key, asset_kind, display_name, storage_bucket, storage_path, public_url, status, notes, updated_at",
    )
    .order("asset_kind", { ascending: true });
  const assets = ((data as PlatformBrandingAssetRow[] | null) ?? []).filter(
    (asset) => brandAssetKinds.includes(asset.asset_kind as BrandAssetKind),
  );

  return (
    <div className="space-y-6 px-5 py-6 md:px-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#176B3D]">
              EveryBatch brand assets
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#0F2E23]">
              Metadata foundation
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Platform brand assets are recorded as metadata only in this v1.
              The current favicon/icon remains the reviewed static app asset,
              and platform uploads stay deferred until a dedicated bucket and
              policy review exists.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="success">{PLATFORM_BRAND_NAME}</StatusBadge>
            <StatusBadge tone="neutral">{PLATFORM_PRODUCT_LINE}</StatusBadge>
            <StatusBadge tone="warning">{PLATFORM_ADMIN_DOMAIN}</StatusBadge>
          </div>
        </div>
      </section>

      <SectionCard
        title="Planned Asset Slots"
        description="These are the EveryBatch asset surfaces this schema is prepared to manage."
        action={<StatusBadge tone="warning">Upload coming later</StatusBadge>}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {plannedSlots.map((slot) => {
            const matchingAsset = assets.find(
              (asset) => asset.asset_kind === slot.kind,
            );

            return (
              <article
                key={slot.kind}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-950">
                      {slot.label}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {slot.purpose}
                    </p>
                  </div>
                  <StatusBadge tone={matchingAsset ? "success" : "neutral"}>
                    {matchingAsset ? matchingAsset.status : "Empty"}
                  </StatusBadge>
                </div>

                {matchingAsset ? (
                  <dl className="mt-4 space-y-2 text-xs">
                    <div>
                      <dt className="font-bold uppercase text-slate-500">
                        Asset
                      </dt>
                      <dd className="mt-1 break-all font-semibold text-slate-900">
                        {matchingAsset.display_name}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold uppercase text-slate-500">
                        Reference
                      </dt>
                      <dd className="mt-1 break-all text-slate-600">
                        {matchingAsset.public_url ||
                          matchingAsset.storage_path ||
                          "No file reference yet"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold uppercase text-slate-500">
                        Updated
                      </dt>
                      <dd className="mt-1 text-slate-600">
                        {formatDate(matchingAsset.updated_at)}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-500">
                    Metadata row not created yet.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        title="Current Platform Asset Behaviour"
        description="Runtime rendering remains conservative until platform upload storage is reviewed."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Static favicon", "Active", "Uses app/icon.png and app/apple-icon.png."],
            ["Platform sidebar mark", "Fallback", "Still uses the temporary EB mark."],
            ["Dynamic upload", "Deferred", "Needs a reviewed platform bucket and policies."],
          ].map(([label, status, detail]) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-xs font-bold uppercase text-slate-500">
                {label}
              </p>
              <p className="mt-2 text-sm font-black text-slate-950">{status}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
