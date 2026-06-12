'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NavLinks, useNavItems } from "./NavLinks";
import { SiteNavActions } from "./SiteNavActions";
import { ThemeToggleButton } from "./ThemeToggleButton";

export function SiteNav({ variant = "light" }: { variant?: "light" | "ink" }) {
  const isInk = variant === "ink";
  const [open, setOpen] = useState(false);
  const items = useNavItems();

  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-md border-b ${
        isInk
          ? "bg-[color:var(--ink)]/80 border-white/10 text-[color:var(--ink-foreground)]"
          : "bg-background/80 border-[color:var(--border)] text-foreground"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="Bamboo home" className="shrink-0">
            <span className="flex items-center justify-center size-10 rounded-xl bg-white ring-1 ring-black/5 shadow-sm overflow-hidden">
              <Image
                src="/logo.png"
                alt="Bamboo"
                width={40}
                height={40}
                priority
                className="size-9 object-contain"
              />
            </span>
          </Link>
          <div className="hidden md:flex gap-6 text-[10px] font-mono uppercase tracking-widest opacity-80">
            <NavLinks />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggleButton variant={variant} />
          <SiteNavActions variant={variant} />

          {/* Hamburger — visible only below the md breakpoint. */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            className={`md:hidden inline-flex items-center justify-center size-9 rounded-lg transition-colors ${
              isInk ? "hover:bg-white/10" : "hover:bg-foreground/5"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {open ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel — renders the same items as the desktop bar. */}
      {open && (
        <div
          className={`md:hidden border-t ${
            isInk
              ? "border-white/10 bg-[color:var(--ink)]/95"
              : "border-[color:var(--border)] bg-background/95"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-xs font-mono uppercase tracking-widest hover:text-[color:var(--gold)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
