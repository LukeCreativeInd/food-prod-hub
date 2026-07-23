"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

type ReviewActionPanelProps = {
  canCommit: boolean;
  commitReady: boolean;
  isCommitted: boolean;
  commitAction: (formData: FormData) => void | Promise<void>;
};

const commitSteps = [
  "Checking supplier",
  "Checking supplier items",
  "Checking internal items",
  "Creating mappings",
  "Recording price observations",
  "Updating approved prices",
  "Finalising document",
];

export function ReviewActionPanel({
  canCommit,
  commitReady,
  isCommitted,
  commitAction,
}: ReviewActionPanelProps) {
  const { pending } = useFormStatus();
  const [intent, setIntent] = useState<"save" | "commit" | null>(null);
  const commitPending = pending && intent === "commit";
  const savePending = pending && intent === "save";

  return (
    <div className="mt-5 space-y-4">
      {commitPending ? (
        <div
          aria-live="polite"
          className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3"
        >
          <p className="text-sm font-bold text-sky-950">
            Committing reviewed records...
          </p>
          <p className="mt-1 text-sm leading-6 text-sky-800">
            This can take 20-30 seconds for larger invoices while supplier,
            item, mapping and price records are checked.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {commitSteps.map((step) => (
              <div
                key={step}
                className="rounded-md border border-sky-100 bg-white px-3 py-2 text-xs font-bold uppercase text-sky-900"
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          onClick={() => setIntent("save")}
          disabled={pending || isCommitted}
          aria-busy={savePending}
          className="inline-flex items-center justify-center rounded-md bg-clean-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-clean-green-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          {isCommitted
            ? "Review locked after commit"
            : savePending
              ? "Saving..."
              : commitPending
                ? "Save disabled during commit"
                : "Save review progress"}
        </button>
        <button
          type="submit"
          formAction={commitAction}
          onClick={() => setIntent("commit")}
          disabled={pending || !canCommit || !commitReady}
          aria-busy={commitPending}
          className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          {isCommitted
            ? "Already committed"
            : commitPending
              ? "Committing records..."
              : canCommit
                ? "Commit reviewed records"
                : "Commit permission required"}
        </button>
      </div>
    </div>
  );
}
