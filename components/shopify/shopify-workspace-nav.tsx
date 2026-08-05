import Link from "next/link";

const links = [
  ["Overview", "/shopify"],
  ["Product mappings", "/integrations/shopify/mappings"],
  ["Delivery zones", "/shopify/delivery-zones"],
  ["Delivery services", "/shopify/delivery-services"],
  ["Delivery calendars", "/shopify/delivery-calendars"],
  ["Parser profiles", "/shopify/delivery-parser"],
  ["Exceptions & overrides", "/shopify/delivery-exceptions"],
] as const;

export function ShopifyWorkspaceNav() {
  return (
    <nav aria-label="Shopify workspace" className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-2">
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-[color:var(--tenant-primary-border)] hover:bg-[var(--tenant-primary-soft)] hover:text-[var(--tenant-primary)]"
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
