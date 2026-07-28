"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export function PlatformMobileMenu({
  children,
}: {
  children: (onNavigate: () => void) => ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="border-t border-white/10 lg:hidden">
      <button
        type="button"
        aria-controls="platform-mobile-menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between px-5 py-3 text-left text-sm font-black text-emerald-50 transition hover:bg-white/10"
      >
        <span>Platform menu</span>
        <span
          aria-hidden="true"
          className={`text-lg leading-none transition ${isOpen ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>

      {isOpen ? (
        <div
          id="platform-mobile-menu"
          className="max-h-[65vh] overflow-y-auto border-t border-white/10 px-3 py-4"
        >
          {children(closeMenu)}
        </div>
      ) : null}
    </div>
  );
}
