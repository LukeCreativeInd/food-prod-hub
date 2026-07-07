import { PageHeader } from "@/components/page-header";
import {
  EmptyState,
  PageActionButton,
  SectionCard,
  StatusBadge,
} from "@/components/ui";

const mockIntegrations = [
  {
    name: "Shopify Retail",
    purpose: "Import retail orders, customers and products.",
    status: "Planned",
    direction: "Import",
    futureUse: "Retail order intake and customer/product references.",
  },
  {
    name: "Shopify Wholesale",
    purpose: "Import wholesale orders and account data.",
    status: "Planned",
    direction: "Import",
    futureUse: "Wholesale account order intake and customer matching.",
  },
  {
    name: "Xero",
    purpose: "Send purchase orders, bills or financial references.",
    status: "Future",
    direction: "Export",
    futureUse: "Accounting handoff for purchasing and financial workflows.",
  },
  {
    name: "Detrack",
    purpose: "Send manifests and delivery data.",
    status: "Future",
    direction: "Export",
    futureUse: "Delivery manifests and logistics dispatch support.",
  },
  {
    name: "Klaviyo",
    purpose: "Future customer/marketing insights.",
    status: "Future",
    direction: "Import",
    futureUse: "Customer insights for marketing and retention reporting.",
  },
  {
    name: "CSV Imports",
    purpose: "Manual upload pathway for early-stage workflows.",
    status: "Placeholder",
    direction: "Import",
    futureUse: "Controlled imports for ingredients, suppliers, and setup data.",
  },
  {
    name: "Barcode / Label Printing",
    purpose: "Future scanning and label generation support.",
    status: "Future",
    direction: "Two-way",
    futureUse: "Label generation, scanning events, and production traceability.",
  },
  {
    name: "Email Notifications",
    purpose: "Future automated operational notifications.",
    status: "Placeholder",
    direction: "Export",
    futureUse: "Operational alerts, task reminders, and exception emails.",
  },
  {
    name: "Future API",
    purpose: "Future custom client integrations.",
    status: "Future",
    direction: "Two-way",
    futureUse: "Approved client-specific or partner system connections.",
  },
];

const mockSyncLogs = [
  {
    event: "Shopify Retail order sync",
    status: "Planned",
    direction: "Import",
    lastRun: "Not connected",
  },
  {
    event: "Xero purchase order export",
    status: "Future",
    direction: "Export",
    lastRun: "Not connected",
  },
  {
    event: "Detrack manifest export",
    status: "Future",
    direction: "Export",
    lastRun: "Not connected",
  },
  {
    event: "CSV ingredient import",
    status: "Placeholder",
    direction: "Import",
    lastRun: "Static example",
  },
];

const tenantSummary = {
  organisation: "Clean Eats Australia",
  tenantSlug: "cleaneats",
  connectedSystems: "0 live connections",
  integrationMode: "Placeholder",
};

const summaryFields = [
  ["Organisation", tenantSummary.organisation],
  ["Tenant slug", tenantSummary.tenantSlug],
  ["Connected systems", tenantSummary.connectedSystems],
  ["Integration mode", tenantSummary.integrationMode],
];

const workflowSteps = [
  "External system",
  "Integration layer",
  "Normalised Hub data",
  "Modules use normalised data",
];

function DetailGrid({ items }: { items: string[][] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <dt className="text-xs font-semibold uppercase text-slate-500">
            {label}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function statusTone(status: string) {
  if (status === "Planned") {
    return "info";
  }

  if (status === "Placeholder") {
    return "neutral";
  }

  return "warning";
}

export default function IntegrationsPage() {
  return (
    <>
      <PageHeader
        title="Integrations"
        description="Integrations will eventually connect each organisation/tenant to external systems for orders, purchasing, accounting, delivery, marketing, and imports."
      />

      <div className="space-y-6 px-5 py-6 md:px-8">
        <SectionCard
          title="Current Tenant Summary"
          description="Static Clean Eats integration summary for the platform foundation."
          action={<StatusBadge tone="info">Placeholder</StatusBadge>}
        >
          <DetailGrid items={summaryFields} />
        </SectionCard>

        <SectionCard
          title="Integration Catalogue"
          description="Future connection options for tenant-specific external systems."
          action={
            <PageActionButton variant="secondary">
              Connect disabled
            </PageActionButton>
          }
        >
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {mockIntegrations.map((integration) => (
              <article
                key={integration.name}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">
                      {integration.name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {integration.purpose}
                    </p>
                  </div>
                  <StatusBadge tone={statusTone(integration.status)}>
                    {integration.status}
                  </StatusBadge>
                </div>
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Data direction
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {integration.direction}
                  </p>
                </div>
                <p className="mt-4 text-xs font-semibold uppercase text-slate-500">
                  Example future use
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {integration.futureUse}
                </p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Integration Workflow Notes"
          description="Preferred architecture for external system connections."
        >
          <div className="grid gap-4 lg:grid-cols-4">
            {workflowSteps.map((step, index) => (
              <div
                key={step}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold uppercase text-clean-green-700">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 text-sm font-semibold text-slate-950">
                  {step}
                </h3>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            Modules should use normalised Hub data where possible, instead of
            being tightly coupled directly to one external provider.
          </p>
        </SectionCard>

        <SectionCard
          title="API / Sync Log Placeholder"
          description="Example future sync activity records for tenant integrations."
        >
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500 lg:grid-cols-[1.4fr_auto_auto_1fr]">
              <span>Sync event</span>
              <span>Status</span>
              <span className="hidden lg:block">Direction</span>
              <span className="hidden lg:block">Last run</span>
            </div>
            <div className="divide-y divide-slate-200 bg-white">
              {mockSyncLogs.map((log) => (
                <div
                  key={log.event}
                  className="grid grid-cols-[1fr_auto] gap-3 px-4 py-4 lg:grid-cols-[1.4fr_auto_auto_1fr] lg:items-center"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">
                      {log.event}
                    </h3>
                    <p className="mt-1 text-xs font-semibold uppercase text-slate-500 lg:hidden">
                      {log.direction} / {log.lastRun}
                    </p>
                  </div>
                  <StatusBadge tone={statusTone(log.status)}>
                    {log.status}
                  </StatusBadge>
                  <p className="hidden text-sm text-slate-600 lg:block">
                    {log.direction}
                  </p>
                  <p className="hidden text-sm text-slate-600 lg:block">
                    {log.lastRun}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Future Notes"
          description="Architecture preparation for safe, tenant-specific integrations."
        >
          <EmptyState
            title="Integrations are not connected yet"
            description="Integrations will eventually be configured per organisation. Credentials and secrets will need secure storage. Sync activity should be logged, and failures should create alerts. This version is static only and does not save or connect anything."
          />
        </SectionCard>
      </div>
    </>
  );
}
