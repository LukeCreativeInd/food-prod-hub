import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { selectWorkspaceAction } from "@/app/select-workspace/actions";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  PLATFORM_BRAND_CATEGORY,
  PLATFORM_BRAND_NAME,
  PLATFORM_BRAND_TAGLINE,
  PLATFORM_CONTACT_SUPPORT_URL,
} from "@/lib/platform-brand";
import {
  getCurrentUserWorkspaceOptions,
  getWorkspaceDestinationHref,
  type WorkspaceOption,
} from "@/lib/workspace-options";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export const metadata: Metadata = {
  title: `Choose your workspace | ${PLATFORM_BRAND_NAME}`,
};

const errorMessages: Record<string, string> = {
  missing_selection: "Choose a workspace before continuing.",
  workspace_not_found: "That workspace could not be found.",
  no_access: "Your account does not have active access to that workspace.",
  not_authenticated: "Sign in before choosing a workspace.",
};

function getInitials(value: string) {
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "EB";
}

function canRenderLogo(value: string | null) {
  return Boolean(value && /^https?:\/\//.test(value));
}

function WorkspaceLogo({ workspace }: { workspace: WorkspaceOption }) {
  if (canRenderLogo(workspace.logoUrl)) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={workspace.logoUrl ?? ""}
          alt={`${workspace.displayName} logo`}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-green-100 bg-green-50 text-sm font-black text-clean-green-800">
      {getInitials(workspace.displayName)}
    </div>
  );
}

function PlatformMark() {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-950 text-sm font-black text-lime-200 shadow-lg shadow-green-950/15">
      EB
    </div>
  );
}

function getSafeNextPath(value: string | undefined) {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

function WorkspaceCard({
  workspace,
  nextPath,
}: {
  workspace: WorkspaceOption;
  nextPath: string | null;
}) {
  return (
    <form
      action={selectWorkspaceAction}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-lg hover:shadow-green-950/10"
    >
      <div className="flex items-start gap-4">
        <WorkspaceLogo workspace={workspace} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-clean-green-700">
            Workspace
          </p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
            {workspace.workspaceName}
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {workspace.slug}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-4">
          <span>Role</span>
          <span className="font-bold text-slate-800">
            {workspace.roleKey.replaceAll("_", " ")}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Access level</span>
          <span className="font-bold text-slate-800">
            {workspace.accessLevel ?? "standard"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Status</span>
          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-black uppercase tracking-[0.12em] text-clean-green-800">
            {workspace.status}
          </span>
        </div>
      </div>

      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

      <button
        type="submit"
        name="slug"
        value={workspace.slug}
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-clean-green-700 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-clean-green-900"
      >
        Open workspace
      </button>
    </form>
  );
}

function PlatformAdminCard({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-green-200 bg-green-950 p-5 text-white shadow-lg shadow-green-950/15 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-950/20"
    >
      <div className="flex items-start gap-4">
        <PlatformMark />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-lime-200">
            Platform
          </p>
          <h2 className="mt-2 text-xl font-black tracking-tight">
            Platform Admin Console
          </h2>
          <p className="mt-3 text-sm leading-6 text-green-50/85">
            Manage EveryBatch tenants, modules and platform operations.
          </p>
        </div>
      </div>
      <span className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-lime-300 px-4 py-3 text-sm font-black text-green-950">
        Open Platform Admin
      </span>
    </Link>
  );
}

function NoWorkspaceState() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-200/70 md:p-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-sm font-black text-slate-600">
        EB
      </div>
      <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950">
        No active workspace found
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
        Contact your EveryBatch administrator or support to confirm your
        workspace access.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href={PLATFORM_CONTACT_SUPPORT_URL}
          className="inline-flex items-center justify-center rounded-xl border border-green-200 bg-white px-4 py-3 text-sm font-black text-clean-green-900 transition hover:bg-green-50"
        >
          Contact support
        </Link>
        <LogoutButton variant="light" />
      </div>
    </section>
  );
}

export default async function SelectWorkspacePage({ searchParams }: PageProps) {
  const [workspaceOptions, query, requestHeaders] = await Promise.all([
    getCurrentUserWorkspaceOptions(),
    searchParams,
    headers(),
  ]);

  if (!workspaceOptions.isAuthenticated) {
    redirect("/login");
  }

  const currentHost =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const nextPath = getSafeNextPath(query.next);

  if (
    nextPath &&
    !workspaceOptions.isPlatformAdmin &&
    workspaceOptions.workspaces.length === 1
  ) {
    redirect(
      getWorkspaceDestinationHref(workspaceOptions.defaultDestination, {
        currentHost,
        nextPath,
      }),
    );
  }

  const errorMessage = query.error ? errorMessages[query.error] : null;
  const hasWorkspaces = workspaceOptions.workspaces.length > 0;
  const showNoWorkspaceState =
    !hasWorkspaces && !workspaceOptions.isPlatformAdmin;
  const platformAdminHref = getWorkspaceDestinationHref(
    {
      type: "platform",
      href: "/platform",
    },
    { currentHost },
  );

  return (
    <main className="min-h-screen bg-[#eef4ea] px-5 py-8 md:px-8 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative overflow-hidden rounded-3xl bg-green-950 px-6 py-7 text-white shadow-2xl shadow-green-950/25 md:px-8 md:py-9">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(190,242,100,0.28),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(34,197,94,0.18),transparent_28%)]" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div>
              <div className="flex items-center gap-4">
                <PlatformMark />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-200">
                    {PLATFORM_BRAND_CATEGORY}
                  </p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                    {PLATFORM_BRAND_NAME}
                  </h1>
                </div>
              </div>

              <p className="mt-8 max-w-md text-3xl font-black leading-tight tracking-tight md:text-5xl">
                Choose your workspace.
              </p>
              <p className="mt-5 max-w-md text-base leading-7 text-green-50/85">
                Select the EveryBatch workspace you want to open.
              </p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur">
                <p className="text-sm font-bold text-lime-100">
                  {PLATFORM_BRAND_TAGLINE}
                </p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-100/80">
                Central workspace selector
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-center">
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-xl shadow-slate-200/70 backdrop-blur md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-clean-green-700">
                  Signed in
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Available workspaces
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Workspace access is validated server-side before you continue.
                </p>
              </div>
              <LogoutButton variant="light" />
            </div>

            {errorMessage ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                {errorMessage}
              </div>
            ) : null}

            {showNoWorkspaceState ? (
              <div className="mt-6">
                <NoWorkspaceState />
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {workspaceOptions.workspaces.map((workspace) => (
                  <WorkspaceCard
                    key={workspace.organisationId}
                    workspace={workspace}
                    nextPath={nextPath}
                  />
                ))}
                {workspaceOptions.isPlatformAdmin ? (
                  <PlatformAdminCard href={platformAdminHref} />
                ) : null}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
