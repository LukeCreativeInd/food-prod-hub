"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  uploadPurchaseDocumentAction,
  type UploadPurchaseDocumentActionState,
} from "@/app/purchase-documents/actions";

type UploadDocumentFormProps = {
  acceptedTypes: string[];
  maxUploadLabel: string;
  supportedUploadLabel: string;
};

const initialState: UploadPurchaseDocumentActionState = {
  status: "idle",
  message: "",
};

function UploadSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex items-center justify-center rounded-md bg-clean-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-clean-green-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
    >
      {pending ? "Uploading..." : "Upload document"}
    </button>
  );
}

export function UploadDocumentForm({
  acceptedTypes,
  maxUploadLabel,
  supportedUploadLabel,
}: UploadDocumentFormProps) {
  const [state, formAction] = useActionState(
    uploadPurchaseDocumentAction,
    initialState,
  );
  const [selectedFilename, setSelectedFilename] = useState("");

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <label className="block rounded-lg border border-dashed border-slate-300 bg-white p-4 transition focus-within:border-clean-green-700 focus-within:ring-2 focus-within:ring-clean-green-100">
        <span className="text-xs font-semibold uppercase text-slate-500">
          Supplier invoice file
        </span>
        <input
          name="purchase_document"
          type="file"
          accept={acceptedTypes.join(",")}
          required
          onChange={(event) =>
            setSelectedFilename(event.currentTarget.files?.[0]?.name ?? "")
          }
          className="mt-3 block w-full text-sm font-semibold text-slate-800 file:mr-4 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
        />
        <span className="mt-3 block text-sm text-slate-600">
          {selectedFilename
            ? `Selected: ${selectedFilename}`
            : `Accepted: ${supportedUploadLabel}. Maximum ${maxUploadLabel}.`}
        </span>
      </label>

      {state.status === "error" ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {state.message}
        </div>
      ) : null}

      <UploadSubmitButton />
    </form>
  );
}
