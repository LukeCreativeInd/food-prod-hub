import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionCard, StatusBadge } from "@/components/ui";
import { mappingLabel } from "@/lib/commerce-mapping";
import { getCommerceMappingDetailData } from "@/lib/commerce-mapping-data";
import type {
  CommerceMappingStatus,
} from "@/lib/commerce-mapping-types";

import {
  approveCommerceMappingAction,
  archiveCommerceMappingAction,
  createCommerceMappingDraftAction,
  rejectCommerceMappingAction,
  replaceCommerceMappingOutputsAction,
  submitCommerceMappingAction,
} from "../actions";
import { MappingOutputsEditor } from "../mapping-outputs-editor";

type PageProps = {
  params: Promise<{ catalogueItemId: string }>;
  searchParams: Promise<{ mapping?: string }>;
};

const resultMessages: Record<string, { tone: string; text: string }> = {
  draft_created: { tone: "success", text: "Draft mapping version created." },
  outputs_saved: { tone: "success", text: "Draft mapping outputs saved." },
  submitted: { tone: "success", text: "Mapping submitted for review." },
  approved: { tone: "success", text: "Mapping approved for future source-line interpretation." },
  rejected: { tone: "success", text: "Mapping rejected and retained in history." },
  archived: { tone: "success", text: "Mapping archived without deleting history." },
  invalid_request: { tone: "error", text: "The mapping request was invalid." },
  invalid_outputs: { tone: "error", text: "The output rows were incomplete or inconsistent." },
  draft_failed: { tone: "error", text: "Could not create the draft mapping." },
  outputs_failed: { tone: "error", text: "Could not save outputs. Check item status, quantity and base unit." },
  submit_failed: { tone: "error", text: "Could not submit the mapping. Confirm its output rules are complete." },
  approve_failed: { tone: "error", text: "Could not approve the mapping. Resolve conflicts or invalid targets first." },
  reject_failed: { tone: "error", text: "Could not reject the mapping." },
  archive_failed: { tone: "error", text: "Could not archive the mapping." },
};

function statusTone(status: CommerceMappingStatus) {
  switch (status) {
    case "approved":
      return "success" as const;
    case "pending_review":
      return "warning" as const;
    case "rejected":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

function ActionButton({ children, tone = "primary" }: { children: string; tone?: "primary" | "danger" | "secondary" }) {
  const className =
    tone === "danger"
      ? "border border-red-200 bg-white text-red-700 hover:bg-red-50"
      : tone === "secondary"
        ? "border border-[color:var(--tenant-primary-border)] bg-white text-[var(--tenant-primary)] hover:bg-[var(--tenant-primary-soft)]"
        : "bg-[var(--tenant-primary)] text-white hover:brightness-90";

  return (
    <button
      type="submit"
      className={`rounded-md px-3.5 py-2 text-sm font-semibold transition ${className}`}
    >
      {children}
    </button>
  );
}

export default async function CommerceMappingDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ catalogueItemId }, { mapping: resultKey }] = await Promise.all([
    params,
    searchParams,
  ]);
  const data = await getCommerceMappingDetailData(catalogueItemId);
  const resultMessage = resultKey ? resultMessages[resultKey] : null;

  if (data.schemaStatus === "ready" && !data.catalogueItem) {
    notFound();
  }

  const item = data.catalogueItem;
  const workingMapping = data.mappingHistory.find((mapping) =>
    ["draft", "pending_review"].includes(mapping.status),
  );
  const approvedMapping = data.mappingHistory.find(
    (mapping) => mapping.status === "approved" && !mapping.archived_at,
  );
  const workingOutputs = workingMapping
    ? data.historyOutputs.filter((output) => output.mapping_id === workingMapping.id)
    : [];

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/integrations/shopify/mappings"
            className="font-semibold text-[var(--tenant-primary)]"
          >
            Back to product mappings
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500">Source variant review</span>
        </div>

        {resultMessage ? (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              resultMessage.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {resultMessage.text}
          </div>
        ) : null}

        {data.schemaStatus !== "ready" ? (
          <SectionCard title="Mapping foundation unavailable">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              {data.schemaMessage}
            </div>
          </SectionCard>
        ) : item ? (
          <>
            <SectionCard
              title="Source variant"
              description="Provider identity is preserved independently from review labels and SKU evidence."
              action={
                <StatusBadge
                  tone={
                    item.resolvedState === "approved" || item.resolvedState === "excluded"
                      ? "success"
                      : item.resolvedState === "error"
                        ? "danger"
                        : item.resolvedState === "pending"
                          ? "warning"
                          : "neutral"
                  }
                >
                  {mappingLabel(item.resolvedState)}
                </StatusBadge>
              }
            >
              <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Product", item.source_product_title],
                  ["Variant", item.source_variant_title ?? "Default variant"],
                  ["Source SKU", item.source_sku ?? "Not supplied"],
                  ["Source status", item.source_status ?? "Not supplied"],
                  ["Provider product ID", item.provider_product_id],
                  ["Provider variant ID", item.provider_variant_id],
                  ["Last observed", new Date(item.last_observed_at).toLocaleString("en-AU")],
                  ["Source lifecycle", item.archived_at ? "Archived" : "Active discovery record"],
                ].map(([term, value]) => (
                  <div key={term} className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-3">
                    <dt className="text-xs font-semibold uppercase text-slate-500">{term}</dt>
                    <dd className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </SectionCard>

            {!workingMapping && !approvedMapping ? (
              <SectionCard
                title="Create reviewed interpretation"
                description="Choose the interpretation kind explicitly. Titles and SKUs are not used to auto-map."
              >
                {data.canManage ? (
                  <form action={createCommerceMappingDraftAction} className="grid gap-4 md:grid-cols-2">
                    <input type="hidden" name="catalogue_item_id" value={item.id} />
                    <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                      <span>Mapping kind</span>
                      <select
                        name="mapping_kind"
                        defaultValue="direct"
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
                      >
                        <option value="direct">Direct · one internal item</option>
                        <option value="bundle">Bundle or pack · multiplied/multiple outputs</option>
                        <option value="exclusion">Explicit exclusion · no manufacturing output</option>
                      </select>
                    </label>
                    <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                      <span>Safe review note (optional)</span>
                      <input
                        name="safe_note"
                        maxLength={500}
                        placeholder="No credentials, payloads or customer information"
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
                      />
                    </label>
                    <div className="md:col-span-2">
                      <ActionButton>Create draft</ActionButton>
                    </div>
                  </form>
                ) : (
                  <p className="text-sm text-slate-600">You have read-only mapping access.</p>
                )}
              </SectionCard>
            ) : null}

            {workingMapping?.status === "draft" ? (
              <SectionCard
                title={`Draft ${mappingLabel(workingMapping.mapping_kind)} mapping · version ${workingMapping.version_number}`}
                description={
                  workingMapping.mapping_kind === "exclusion"
                    ? "This source variant will be explicitly resolved as non-manufacturing after review and approval."
                    : "One source-line unit will contribute the reviewed output quantities shown below."
                }
                action={<StatusBadge tone="neutral">Draft</StatusBadge>}
              >
                {workingMapping.mapping_kind !== "exclusion" && data.canManage ? (
                  <form action={replaceCommerceMappingOutputsAction} className="space-y-4">
                    <input type="hidden" name="catalogue_item_id" value={item.id} />
                    <input type="hidden" name="mapping_id" value={workingMapping.id} />
                    <MappingOutputsEditor
                      mappingKind={workingMapping.mapping_kind}
                      items={data.internalItems.filter(
                        (internalItem) =>
                          internalItem.status === "active" && !internalItem.archivedAt,
                      )}
                      initialOutputs={workingOutputs.map((output) => ({
                        internalItemId: output.internal_item_id,
                        quantity: Number(output.quantity_multiplier),
                        outputUom: output.output_uom,
                        outputRole: output.output_role,
                      }))}
                    />
                    <ActionButton>Save outputs</ActionButton>
                  </form>
                ) : workingMapping.mapping_kind !== "exclusion" ? (
                  <div className="space-y-3">
                    {workingOutputs.length > 0 ? (
                      workingOutputs.map((output) => {
                        const internalItem = data.internalItems.find(
                          (candidate) => candidate.id === output.internal_item_id,
                        );
                        return (
                          <div
                            key={output.id}
                            className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm"
                          >
                            <span className="font-semibold text-slate-950">
                              {output.quantity_multiplier} {output.output_uom}
                            </span>{" "}
                            <span className="text-slate-600">
                              {internalItem?.displayName ?? "Unavailable internal item"} ·{" "}
                              {mappingLabel(output.output_role)}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                        No draft outputs have been saved yet.
                      </p>
                    )}
                    <p className="text-sm text-slate-600">
                      You have read-only mapping access.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    Exclusions intentionally contain zero outputs. Approval will mark matching source lines excluded without changing their quantities.
                  </div>
                )}

                {data.canManage ? (
                  <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                    <form action={submitCommerceMappingAction}>
                      <input type="hidden" name="catalogue_item_id" value={item.id} />
                      <input type="hidden" name="mapping_id" value={workingMapping.id} />
                      <ActionButton>Submit for review</ActionButton>
                    </form>
                    <form action={archiveCommerceMappingAction}>
                      <input type="hidden" name="catalogue_item_id" value={item.id} />
                      <input type="hidden" name="mapping_id" value={workingMapping.id} />
                      <ActionButton tone="danger">Archive draft</ActionButton>
                    </form>
                  </div>
                ) : null}
              </SectionCard>
            ) : null}

            {workingMapping?.status === "pending_review" ? (
              <SectionCard
                title={`Mapping review · version ${workingMapping.version_number}`}
                description="Approval is transactional and makes this version immutable for future interpretation."
                action={<StatusBadge tone="warning">Pending Review</StatusBadge>}
              >
                <div className="space-y-3">
                  {workingMapping.mapping_kind === "exclusion" ? (
                    <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      Explicit exclusion · no manufacturing outputs.
                    </p>
                  ) : (
                    workingOutputs.map((output) => {
                      const internalItem = data.internalItems.find(
                        (candidate) => candidate.id === output.internal_item_id,
                      );
                      return (
                        <div key={output.id} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                          <span className="font-semibold text-slate-950">
                            {output.quantity_multiplier} {output.output_uom}
                          </span>{" "}
                          <span className="text-slate-600">
                            {internalItem?.displayName ?? "Unavailable internal item"} · {mappingLabel(output.output_role)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {data.canManage ? (
                  <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 lg:grid-cols-[auto_minmax(18rem,1fr)]">
                    <form action={approveCommerceMappingAction}>
                      <input type="hidden" name="catalogue_item_id" value={item.id} />
                      <input type="hidden" name="mapping_id" value={workingMapping.id} />
                      <ActionButton>Approve mapping</ActionButton>
                    </form>
                    <form action={rejectCommerceMappingAction} className="flex flex-wrap items-end gap-3">
                      <input type="hidden" name="catalogue_item_id" value={item.id} />
                      <input type="hidden" name="mapping_id" value={workingMapping.id} />
                      <label className="min-w-60 flex-1 space-y-1.5 text-sm font-semibold text-slate-700">
                        <span>Rejection reason</span>
                        <select
                          name="reason_category"
                          defaultValue="business_decision"
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
                        >
                          <option value="business_decision">Business decision</option>
                          <option value="invalid_target">Invalid target</option>
                          <option value="invalid_quantity">Invalid quantity</option>
                          <option value="invalid_source_identity">Invalid source identity</option>
                          <option value="duplicate_mapping">Duplicate mapping</option>
                          <option value="other">Other</option>
                        </select>
                      </label>
                      <ActionButton tone="danger">Reject mapping</ActionButton>
                    </form>
                  </div>
                ) : null}
              </SectionCard>
            ) : null}

            {approvedMapping && !workingMapping ? (
              <SectionCard
                title={`Current approved mapping · version ${approvedMapping.version_number}`}
                description="Approved outputs are immutable. Changes begin as a new superseding draft version."
                action={<StatusBadge tone="success">Approved</StatusBadge>}
              >
                <div className="space-y-3">
                  {approvedMapping.mapping_kind === "exclusion" ? (
                    <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                      Explicitly excluded from manufacturing interpretation.
                    </p>
                  ) : (
                    data.historyOutputs
                      .filter((output) => output.mapping_id === approvedMapping.id)
                      .map((output) => {
                        const internalItem = data.internalItems.find(
                          (candidate) => candidate.id === output.internal_item_id,
                        );
                        return (
                          <div key={output.id} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                            <span className="font-semibold text-slate-950">
                              {output.quantity_multiplier} {output.output_uom}
                            </span>{" "}
                            <span className="text-slate-600">
                              {internalItem?.displayName ?? "Archived or inaccessible internal item"} · {mappingLabel(output.output_role)}
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>

                {data.canManage ? (
                  <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                    <form action={createCommerceMappingDraftAction}>
                      <input type="hidden" name="catalogue_item_id" value={item.id} />
                      <input type="hidden" name="mapping_kind" value={approvedMapping.mapping_kind} />
                      <input type="hidden" name="supersedes_mapping_id" value={approvedMapping.id} />
                      <ActionButton>Create superseding draft</ActionButton>
                    </form>
                    <form action={archiveCommerceMappingAction}>
                      <input type="hidden" name="catalogue_item_id" value={item.id} />
                      <input type="hidden" name="mapping_id" value={approvedMapping.id} />
                      <ActionButton tone="danger">Archive current mapping</ActionButton>
                    </form>
                  </div>
                ) : null}
              </SectionCard>
            ) : null}

            <SectionCard
              title="Version and approval history"
              description="Rejected, approved, superseded and archived records remain visible; no hard-delete workflow is exposed."
            >
              {data.mappingHistory.length === 0 ? (
                <EmptyState
                  title="No mapping history"
                  description="Create a reviewed draft when the correct interpretation is known."
                />
              ) : (
                <div className="space-y-3">
                  {data.mappingHistory.map((mapping) => (
                    <article key={mapping.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            Version {mapping.version_number} · {mappingLabel(mapping.mapping_kind)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Updated {new Date(mapping.updated_at).toLocaleString("en-AU")}
                          </p>
                        </div>
                        <StatusBadge tone={statusTone(mapping.status)}>
                          {mappingLabel(mapping.status)}
                        </StatusBadge>
                      </div>
                      {mapping.safe_note ? (
                        <p className="mt-3 text-sm leading-6 text-slate-600">{mapping.safe_note}</p>
                      ) : null}
                      {mapping.rejection_reason_category ? (
                        <p className="mt-3 text-sm text-red-700">
                          Rejection: {mappingLabel(mapping.rejection_reason_category)}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Lifecycle events"
              description="Append-only review evidence. No credentials, raw payloads or customer data are stored here."
            >
              {data.events.length === 0 ? (
                <EmptyState title="No lifecycle events" description="Events appear when a mapping draft is created." />
              ) : (
                <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                  {data.events.map((event) => (
                    <div key={event.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-950">
                          {mappingLabel(event.event_type)}
                        </p>
                        <span className="text-xs text-slate-500">
                          {new Date(event.created_at).toLocaleString("en-AU")}
                        </span>
                      </div>
                      {event.safe_summary ? (
                        <p className="mt-1 text-sm text-slate-600">{event.safe_summary}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
