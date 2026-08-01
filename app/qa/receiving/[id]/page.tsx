import { notFound } from "next/navigation";

import {
  reviewReceivingQaCheckAction,
  saveReceivingQaCheckAction,
} from "@/app/qa/receiving/actions";
import { AppShell } from "@/components/app-shell";
import { AlertCard, PageActionButton, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import {
  fetchReceivingQaDetail,
  type ReceivingQaResult,
  type ReceivingQaTemplateItem,
} from "@/lib/qa-receiving-data";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ qa?: string }>;
};

const inputClass =
  "mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)] disabled:bg-slate-50 disabled:text-slate-500";
const selectClass =
  "mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)] disabled:bg-slate-50 disabled:text-slate-500";
const primaryButtonClass =
  "inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90";
const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";

function actionMessage(status?: string) {
  if (!status) {
    return null;
  }

  const messages: Record<
    string,
    { text: string; tone: "success" | "warning" | "danger" | "info" }
  > = {
    created: { text: "Receiving QA check started.", tone: "success" },
    saved: { text: "In-progress QA results saved.", tone: "success" },
    completed: { text: "Receiving QA check completed.", tone: "success" },
    completed_review: {
      text: "Receiving QA check completed and marked as needing review.",
      tone: "warning",
    },
    reviewed: { text: "QA review decision recorded.", tone: "success" },
    reviewed_hold_recommended: {
      text: "QA review recorded with a hold recommendation only. Formal hold/release begins in task 217.",
      tone: "warning",
    },
    missing_required: {
      text: "Complete all required checklist items before completing the check.",
      tone: "warning",
    },
    missing_comment: {
      text: "A comment is required for one or more failed or warning results.",
      tone: "warning",
    },
    read_only: { text: "Completed QA history is read-only.", tone: "info" },
    result_error: { text: "One or more QA results could not be saved.", tone: "danger" },
    complete_error: { text: "The QA check could not be completed.", tone: "danger" },
    review_not_available: { text: "This QA check is not ready for review.", tone: "warning" },
    invalid_review: { text: "Choose a valid review decision.", tone: "warning" },
    review_error: { text: "The QA review could not be recorded.", tone: "danger" },
    review_status_error: {
      text: "The review was saved, but the check status could not be moved to reviewed.",
      tone: "danger",
    },
    error: { text: "The Receiving QA action could not be completed.", tone: "danger" },
  };

  return messages[status] ?? { text: "Receiving QA action finished.", tone: "info" };
}

function resultByItem(results: ReceivingQaResult[], itemId: string) {
  return results.find((result) => result.templateItemId === itemId);
}

function resultValue(item: ReceivingQaTemplateItem, result?: ReceivingQaResult) {
  if (!result) {
    return "";
  }

  if (item.resultType === "number" || item.resultType === "temperature") {
    return result.valueNumber;
  }

  if (item.resultType === "date") {
    return result.valueDate;
  }

  if (item.resultType === "time") {
    return result.valueTime;
  }

  if (item.resultType === "datetime") {
    return result.valueTimestamp;
  }

  if (["pass_fail", "yes_no", "acknowledgement"].includes(item.resultType)) {
    if (result.valueBoolean === null) {
      return "";
    }

    if (item.resultType === "pass_fail") {
      return result.valueBoolean ? "pass" : "fail";
    }

    if (item.resultType === "yes_no") {
      return result.valueBoolean ? "yes" : "no";
    }

    return result.valueBoolean ? "acknowledged" : "not_acknowledged";
  }

  return result.valueText;
}

function ResultInput({
  item,
  result,
  disabled,
}: {
  item: ReceivingQaTemplateItem;
  result?: ReceivingQaResult;
  disabled: boolean;
}) {
  const name = `result_${item.id}`;
  const defaultValue = resultValue(item, result);

  if (item.resultType === "pass_fail") {
    return (
      <select className={selectClass} defaultValue={defaultValue} disabled={disabled} name={name}>
        <option value="">Not recorded</option>
        <option value="pass">Pass</option>
        <option value="fail">Fail</option>
      </select>
    );
  }

  if (item.resultType === "yes_no") {
    return (
      <select className={selectClass} defaultValue={defaultValue} disabled={disabled} name={name}>
        <option value="">Not recorded</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    );
  }

  if (item.resultType === "acknowledgement") {
    return (
      <select className={selectClass} defaultValue={defaultValue} disabled={disabled} name={name}>
        <option value="">Not recorded</option>
        <option value="acknowledged">Acknowledged</option>
        <option value="not_acknowledged">Not acknowledged</option>
      </select>
    );
  }

  if (item.resultType === "selection") {
    return (
      <select className={selectClass} defaultValue={defaultValue} disabled={disabled} name={name}>
        <option value="">Not recorded</option>
        {item.optionValues.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (item.resultType === "text") {
    return (
      <textarea
        className={inputClass}
        defaultValue={defaultValue}
        disabled={disabled}
        name={name}
        rows={3}
      />
    );
  }

  return (
    <input
      className={inputClass}
      defaultValue={defaultValue}
      disabled={disabled}
      name={name}
      step={item.resultType === "number" || item.resultType === "temperature" ? "0.01" : undefined}
      type={
        item.resultType === "number" || item.resultType === "temperature"
          ? "number"
          : item.resultType === "datetime"
            ? "datetime-local"
            : item.resultType
      }
    />
  );
}

function ResultSummary({ result }: { result?: ReceivingQaResult }) {
  if (!result || result.status === "draft") {
    return <StatusBadge tone="neutral">Draft</StatusBadge>;
  }

  if (result.requiresHoldReview) {
    return <StatusBadge tone="warning">Hold review recommended</StatusBadge>;
  }

  if (result.requiresReview) {
    return <StatusBadge tone="warning">Review required</StatusBadge>;
  }

  return <StatusBadge tone={result.exceptionFlag ? "danger" : "success"}>{result.outcome}</StatusBadge>;
}

export default async function ReceivingQaDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const data = await fetchReceivingQaDetail(id);

  if (!data) {
    notFound();
  }

  const message = actionMessage(query.qa);
  const canEdit = data.check.isEditable && data.check.canEdit;
  const canReview =
    data.check.canReview &&
    ["completed", "needs_review"].includes(data.check.status);

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        {message ? (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
            <span>{message.text}</span>
            <StatusBadge tone={message.tone}>{query.qa ?? "status"}</StatusBadge>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Check"
            value={data.check.reference}
            helperText={`${data.template.name} ${data.template.versionLabel}`}
            badge="Receiving"
            tone="info"
            icon="QA"
          />
          <StatCard
            label="Status"
            value={data.check.statusLabel}
            helperText="Completed checks are historical and read-only."
            badge={data.check.statusLabel}
            tone={data.check.statusTone}
            icon="ST"
          />
          <StatCard
            label="Outcome"
            value={data.check.overallOutcome}
            helperText="Failed or triggering results mark review readiness."
            badge="Result"
            tone={data.check.outcomeTone}
            icon="OC"
          />
          <StatCard
            label="Review"
            value={data.check.requiresReview ? "Required" : "Not required"}
            helperText="Review is separate from check completion."
            badge={data.check.requiresReview ? "QA review" : "Clear"}
            tone={data.check.requiresReview ? "warning" : "success"}
            icon="RV"
          />
        </section>

        <SectionCard
          title="Receiving source"
          description="The check references Goods Inwards records. It does not copy or alter receipt, lot, movement or Stock On Hand data."
          action={<StatusBadge tone={data.check.statusTone}>{data.check.statusLabel}</StatusBadge>}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Receipt", data.receipt.receiptNumber],
              ["Supplier", data.receipt.supplierName],
              ["Supplier reference", data.receipt.supplierReference],
              ["Source invoice", data.receipt.purchaseDocumentLabel],
              ["Received", data.receipt.receivedAt],
              ["Receipt status", data.receipt.status],
              ["Started", data.check.startedAt],
              ["Completed", data.check.completedAt],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>

          {data.line ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-950">{data.line.itemName}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {data.line.quantity} {data.line.unit} into {data.line.locationName}
                  </p>
                </div>
                <StatusBadge tone="neutral">Line check</StatusBadge>
              </div>
              <dl className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-4">
                <div>
                  <dt className="font-semibold uppercase">Lot</dt>
                  <dd>{data.line.lotNumber}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase">Expiry</dt>
                  <dd>{data.line.expiryDate}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase">QA status</dt>
                  <dd>{data.line.qaStatus}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase">Line status</dt>
                  <dd>{data.line.lineStatus}</dd>
                </div>
              </dl>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3">
            <PageActionButton href="/qa/receiving" variant="secondary">
              Back to Receiving Checks
            </PageActionButton>
            {data.receipt.id ? (
              <PageActionButton href={`/goods-inwards/${data.receipt.id}`} variant="secondary">
                Open Goods Inwards receipt
              </PageActionButton>
            ) : null}
          </div>
        </SectionCard>

        <form action={saveReceivingQaCheckAction} className="space-y-6">
          <input name="check_id" type="hidden" value={data.check.id} />
          <SectionCard
            title="Checklist results"
            description={canEdit ? "Save in-progress results, then complete when required items are ready." : "Completed QA records are historical and read-only."}
            action={canEdit ? <StatusBadge tone="warning">Editable</StatusBadge> : <StatusBadge tone="neutral">Read only</StatusBadge>}
          >
            <div className="space-y-5">
              <AlertCard
                title="No automatic hold"
                description="Failed or uncertain Receiving QA results can require review or recommend a hold, but this task does not create qa_holds, qa_hold_events or inventory availability changes."
                meta="Task 217"
                tone="warning"
              />

              {data.template.instructions !== "No instructions recorded" ? (
                <AlertCard
                  title="Template instructions"
                  description={data.template.instructions}
                  meta={data.template.versionLabel}
                  tone="info"
                />
              ) : null}

              {data.sections.map((section) => (
                <section key={section.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-950">{section.title}</h3>
                    {section.description ? (
                      <p className="mt-1 text-sm leading-6 text-slate-500">{section.description}</p>
                    ) : null}
                    {section.instructions ? (
                      <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
                        {section.instructions}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    {section.items.map((item) => {
                      const result = resultByItem(data.results, item.id);
                      const defaultNotApplicable = result?.outcome === "Not Applicable";

                      return (
                        <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-950">{item.prompt}</h4>
                                {item.isRequired ? <StatusBadge tone="warning">Required</StatusBadge> : null}
                                {item.requiresCommentOnFail ? (
                                  <StatusBadge tone="info">Comment if failed</StatusBadge>
                                ) : null}
                                {item.triggersReview ? (
                                  <StatusBadge tone="info">Review if failed</StatusBadge>
                                ) : null}
                                {item.recommendsHold ? (
                                  <StatusBadge tone="warning">Hold if failed</StatusBadge>
                                ) : null}
                              </div>
                              {item.helpText ? (
                                <p className="mt-2 text-sm leading-6 text-slate-500">{item.helpText}</p>
                              ) : null}
                              <p className="mt-2 text-xs text-slate-500">
                                Type: {item.resultType.replaceAll("_", " ")}
                                {item.unit ? ` / Unit: ${item.unit}` : ""}
                                {item.warningMin !== null || item.warningMax !== null
                                  ? ` / Warning: ${item.warningMin ?? "-"} to ${item.warningMax ?? "-"}`
                                  : ""}
                                {item.criticalMin !== null || item.criticalMax !== null
                                  ? ` / Critical: ${item.criticalMin ?? "-"} to ${item.criticalMax ?? "-"}`
                                  : ""}
                              </p>
                            </div>
                            <ResultSummary result={result} />
                          </div>

                          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                            <label className="block">
                              <span className="text-xs font-semibold uppercase text-slate-500">Result</span>
                              <ResultInput item={item} result={result} disabled={!canEdit} />
                            </label>
                            <label className="block">
                              <span className="text-xs font-semibold uppercase text-slate-500">Comment</span>
                              <input
                                className={inputClass}
                                defaultValue={result?.comment ?? ""}
                                disabled={!canEdit}
                                name={`comment_${item.id}`}
                                placeholder={
                                  item.requiresCommentOnFail
                                    ? "Required for failed or warning result"
                                    : "Optional comment"
                                }
                              />
                            </label>
                          </div>

                          {item.allowNotApplicable ? (
                            <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
                              <input
                                className="h-4 w-4 rounded border-slate-300 text-[var(--tenant-primary)]"
                                defaultChecked={defaultNotApplicable}
                                disabled={!canEdit}
                                name={`not_applicable_${item.id}`}
                                type="checkbox"
                              />
                              Not applicable
                            </label>
                          ) : null}

                          {result?.requiresHoldReview ? (
                            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                              Hold recommendation only. Formal inventory hold/release begins in task 217.
                            </p>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}

              <label className="block">
                <span className="text-xs font-semibold uppercase text-slate-500">Check notes</span>
                <textarea
                  className={inputClass}
                  defaultValue={data.check.notes}
                  disabled={!canEdit}
                  name="notes"
                  placeholder="Optional overall QA notes"
                  rows={3}
                />
              </label>

              {canEdit ? (
                <div className="flex flex-wrap gap-3">
                  <button className={secondaryButtonClass} name="intent" type="submit" value="save">
                    Save in progress
                  </button>
                  <button className={primaryButtonClass} name="intent" type="submit" value="complete">
                    Complete check
                  </button>
                </div>
              ) : null}
            </div>
          </SectionCard>
        </form>

        <SectionCard
          title="QA review"
          description="Review decisions are separate from completion and do not alter Goods Inwards, lots, movements or availability."
          action={
            data.check.requiresReview ? (
              <StatusBadge tone="warning">Review required</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Review optional</StatusBadge>
            )
          }
        >
          <div className="space-y-4">
            {data.reviews.length > 0 ? (
              <div className="space-y-3">
                {data.reviews.map((review) => (
                  <article key={review.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-950">{review.decisionLabel}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {review.reviewer} / {review.reviewedAt}
                        </p>
                      </div>
                      <StatusBadge tone="info">Review record</StatusBadge>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{review.notes}</p>
                  </article>
                ))}
              </div>
            ) : (
              <AlertCard
                title="No review decision recorded"
                description="Checks with failed, uncertain or review-triggering results can be reviewed by users with qa.reviews.manage."
                tone={canReview ? "warning" : "neutral"}
              />
            )}

            {canReview ? (
              <form action={reviewReceivingQaCheckAction} className="rounded-lg border border-slate-200 bg-white p-4">
                <input name="check_id" type="hidden" value={data.check.id} />
                <div className="grid gap-3 lg:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase text-slate-500">Decision</span>
                    <select className={selectClass} defaultValue="" name="decision" required>
                      <option value="">Choose decision</option>
                      <option value="accepted">Accepted</option>
                      <option value="conditional_acceptance">Conditional acceptance</option>
                      <option value="rejected">Rejected</option>
                      <option value="escalated">Escalated</option>
                    </select>
                  </label>
                  <label className="flex items-end gap-2 text-sm font-semibold text-slate-600">
                    <input
                      className="mb-2 h-4 w-4 rounded border-slate-300 text-[var(--tenant-primary)]"
                      name="recommend_hold"
                      type="checkbox"
                    />
                    Recommend hold review only
                  </label>
                </div>
                <label className="mt-3 block">
                  <span className="text-xs font-semibold uppercase text-slate-500">Review notes</span>
                  <textarea
                    className={inputClass}
                    name="review_notes"
                    placeholder="Record the QA review decision and any follow-up notes."
                    rows={3}
                  />
                </label>
                <div className="mt-4">
                  <button className={primaryButtonClass} type="submit">
                    Record review decision
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
