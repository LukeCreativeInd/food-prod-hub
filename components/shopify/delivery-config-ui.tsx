import { EmptyState, StatusBadge } from "@/components/ui";
import type { DeliveryConfigurationStatus } from "@/lib/delivery-configuration-data";

export const deliveryFieldClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900";

export function DeliveryFoundationState({
  status,
  message,
}: {
  status: DeliveryConfigurationStatus;
  message: string;
}) {
  if (status === "ready") {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
      <p className="font-semibold">Delivery configuration unavailable</p>
      <p className="mt-1">{message}</p>
    </div>
  );
}

export function DeliveryActionFeedback({ result }: { result?: string }) {
  if (!result) {
    return null;
  }

  const success = result === "created" || result === "draft_created";
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {success
        ? result === "draft_created"
          ? "Draft created. Add and review its configuration before publishing."
          : "Configuration record created."
        : "The configuration action could not be completed. Review the fields and database foundation, then try again."}
    </div>
  );
}

export function DeliveryPrerequisiteEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return <EmptyState title={title} description={description} />;
}

export function LifecycleBadge({ status }: { status: string }) {
  const tone =
    status === "published" || status === "active"
      ? "success"
      : status === "rejected" || status === "blocked"
        ? "danger"
        : status === "draft" || status === "pending_review"
          ? "warning"
          : "neutral";
  return <StatusBadge tone={tone}>{status.replaceAll("_", " ")}</StatusBadge>;
}
