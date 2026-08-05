"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("EveryBatch route error", {
        name: error.name,
        digest: error.digest,
      });
    }
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div
          aria-hidden="true"
          className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-green-50 text-lg font-black text-green-800"
        >
          EB
        </div>
        <h1 className="mt-4 text-lg font-bold">Workspace temporarily unavailable</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          We could not verify secure access. No access decision or tenant data
          has been assumed. Try the request again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex items-center justify-center rounded-md bg-green-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-900"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
