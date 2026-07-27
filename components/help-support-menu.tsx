"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { getPageTitleMeta } from "@/lib/page-title";
import {
  PLATFORM_BRAND_NAME,
  PLATFORM_CONTACT_SUPPORT_URL,
  PLATFORM_KNOWLEDGE_BASE_URL,
  PLATFORM_MODULE_GUIDES_URL,
  PLATFORM_SUPPORT_TICKET_URL,
} from "@/lib/platform-brand";

const supportLinks = [
  {
    label: "Knowledge Base",
    description: "EveryBatch setup notes and how-to articles.",
    href: PLATFORM_KNOWLEDGE_BASE_URL,
  },
  {
    label: "Module Guides",
    description: "Guides for Products, Costings, Production and Inventory.",
    href: PLATFORM_MODULE_GUIDES_URL,
  },
  {
    label: "Submit Support Ticket",
    description: "Future support ticket entry point.",
    href: PLATFORM_SUPPORT_TICKET_URL,
  },
  {
    label: "Contact Support",
    description: "Future contact and support options.",
    href: PLATFORM_CONTACT_SUPPORT_URL,
  },
];

function HelpIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.6 2.6 0 0 1 5 1c0 1.8-2.5 2.1-2.5 4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

export function HelpSupportMenu() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const pageTitle = getPageTitleMeta(pathname);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--tenant-border)] bg-[var(--tenant-surface)] text-[var(--tenant-muted)] shadow-sm transition hover:border-[color:var(--tenant-primary-border)] hover:bg-[var(--tenant-primary-soft)] hover:text-[var(--tenant-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary-border)]"
        aria-label="Help and support"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title="Help and support"
      >
        <HelpIcon />
      </button>

      {isOpen ? (
        <div
          role="menu"
          aria-label="Help and support"
          className="absolute right-0 z-40 mt-2 w-[min(90vw,22rem)] overflow-hidden rounded-xl border border-[var(--tenant-border)] bg-[var(--tenant-surface)] shadow-xl"
        >
          <div className="border-b border-[var(--tenant-border)] px-4 py-4">
            <p className="text-sm font-bold text-[var(--tenant-text)]">
              Help & Support
            </p>
            <p className="mt-1 text-sm leading-5 text-[var(--tenant-muted)]">
              {PLATFORM_BRAND_NAME} guides and support for your workspace.
            </p>
          </div>

          <div className="border-b border-[var(--tenant-border)] bg-[var(--tenant-surface-muted)] px-4 py-3">
            <p className="text-xs font-semibold uppercase text-[var(--tenant-muted)]">
              Current page
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-[var(--tenant-text)]">
              {pageTitle.title}
            </p>
            <p className="mt-1 text-xs text-[var(--tenant-muted)]">
              Page-specific guides coming soon.
            </p>
          </div>

          <div className="p-2">
            {supportLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                className="flex items-start gap-3 rounded-lg px-3 py-3 text-sm transition hover:bg-[var(--tenant-primary-soft)] focus:bg-[var(--tenant-primary-soft)] focus:outline-none"
                onClick={() => setIsOpen(false)}
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[color:var(--tenant-primary-border)] bg-[var(--tenant-primary-soft)] text-[var(--tenant-primary)]">
                  <ExternalLinkIcon />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-[var(--tenant-text)]">
                    {link.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--tenant-muted)]">
                    {link.description}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
