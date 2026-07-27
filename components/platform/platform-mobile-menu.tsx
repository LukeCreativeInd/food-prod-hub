"use client";

import { useState } from "react";

import { PlatformNavigation } from "@/components/platform/platform-shell";

export function PlatformMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-slate-800 lg:hidden">
      <button
        type="button"
        aria-controls="platform-mobile-menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between px-5 py-3 text-left text-sm font-black text-slate-100 transition hover:bg-white/5"
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
          className="max-h-[65vh] overflow-y-auto border-t border-slate-800 px-3 py-4"
        >
          <PlatformNavigation onNavigate={() => setIsOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
