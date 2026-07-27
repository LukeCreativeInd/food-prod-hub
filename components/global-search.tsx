"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type GlobalSearchResult = {
  id: string;
  type: string;
  group: string;
  title: string;
  subtitle: string;
  badge?: string;
  href: string;
};

type GlobalSearchGroup = {
  label: string;
  results: GlobalSearchResult[];
};

type GlobalSearchResponse = {
  query: string;
  groups: GlobalSearchGroup[];
  error?: string;
};

const minimumSearchLength = 2;
const debounceMs = 300;

function getShortcutLabel() {
  if (typeof navigator === "undefined") {
    return "Ctrl K";
  }

  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform) ? "⌘K" : "Ctrl K";
}

function getResultCount(groups: GlobalSearchGroup[]) {
  return groups.reduce((count, group) => count + group.results.length, 0);
}

export function GlobalSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<GlobalSearchResponse>({
    query: "",
    groups: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortcutLabel, setShortcutLabel] = useState("Ctrl K");

  const resultCount = useMemo(
    () => getResultCount(response.groups),
    [response.groups],
  );
  const firstResult = response.groups[0]?.results[0];
  const trimmedQuery = query.trim();

  useEffect(() => {
    setShortcutLabel(getShortcutLabel());
  }, []);

  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      const isSearchShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";

      if (isSearchShortcut) {
        event.preventDefault();
        setIsOpen(true);
        window.setTimeout(() => inputRef.current?.focus(), 0);
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        panelRef.current &&
        event.target instanceof Node &&
        !panelRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handlePointerDown);
    }

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [isOpen]);

  useEffect(() => {
    if (trimmedQuery.length < minimumSearchLength) {
      setResponse({ query: trimmedQuery, groups: [] });
      setIsLoading(false);
      setError(null);

      return;
    }

    const abortController = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const searchResponse = await fetch(
          `/api/global-search?q=${encodeURIComponent(trimmedQuery)}`,
          {
            signal: abortController.signal,
          },
        );

        if (!searchResponse.ok) {
          throw new Error("Search request failed.");
        }

        const data = (await searchResponse.json()) as GlobalSearchResponse;
        setResponse(data);
      } catch (searchError) {
        if (abortController.signal.aborted) {
          return;
        }

        if (process.env.NODE_ENV !== "production") {
          console.error("[global-search] Client search failed", searchError);
        }

        setError("Search is temporarily unavailable.");
        setResponse({ query: trimmedQuery, groups: [] });
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(timeout);
      abortController.abort();
    };
  }, [trimmedQuery]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  function openSearch() {
    setIsOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function closeSearch() {
    setIsOpen(false);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && firstResult) {
      event.preventDefault();
      closeSearch();
      router.push(firstResult.href);
    }
  }

  return (
    <div ref={panelRef} className="relative w-full sm:w-96">
      <button
        type="button"
        onClick={openSearch}
        className="flex h-10 w-full items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-left text-sm text-slate-500 shadow-sm transition hover:border-[var(--tenant-primary-border)] hover:bg-[var(--tenant-surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary-border)]"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <span className="text-base text-[var(--tenant-primary)]">/</span>
        <span className="min-w-0 flex-1 truncate">Search</span>
        <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-400">
          {shortcutLabel}
        </span>
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label="Global search"
          className="absolute right-0 top-12 z-50 w-[min(92vw,34rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="border-b border-slate-200 p-3">
            <label className="relative block">
              <span className="sr-only">Search across Clean Eats Hub</span>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--tenant-primary)]">
                /
              </span>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search pages, suppliers, products, stock..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[var(--tenant-primary-border)] focus:bg-white focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
              />
            </label>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {trimmedQuery.length < minimumSearchLength ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Type at least 2 characters
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Results stay scoped to your tenant, modules and permissions.
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center gap-3 px-4 py-8 text-sm text-slate-600">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--tenant-primary-border)] border-t-[var(--tenant-primary)]" />
                Searching...
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-semibold text-red-700">{error}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Try again in a moment.
                </p>
              </div>
            ) : resultCount === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No results found
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Try a supplier, item, stock location or page name.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {response.groups.map((group) => (
                  <section key={group.label}>
                    <div className="px-2 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      {group.label}
                    </div>
                    <div className="space-y-1">
                      {group.results.map((result) => (
                        <Link
                          key={result.id}
                          href={result.href}
                          onClick={closeSearch}
                          className="flex gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-[var(--tenant-primary-soft)] focus:bg-[var(--tenant-primary-soft)] focus:outline-none"
                        >
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--tenant-primary)]" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold text-slate-950">
                              {result.title}
                            </span>
                            <span className="block truncate text-xs text-slate-500">
                              {result.subtitle}
                            </span>
                          </span>
                          {result.badge ? (
                            <span className="self-start rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                              {result.badge}
                            </span>
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
