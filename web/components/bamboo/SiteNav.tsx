'use client';

import { useState } from "react";
import Link from "next/link";
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
            {/* The raster bakes the wordmark into a flat #f1f1f1 square, so
                instead of blending it we use it as a luminance mask and paint
                flat fills through it: lettering follows the nav text colour
                (so it adapts to theme/ink automatically), rings are the gold
                accent. The background stays fully transparent in both modes.
                The viewBox crops the 632px square to the wordmark bounds;
                the rect split at x=413 is the gap between "bamb" and "oo". */}
            <svg
              viewBox="141 276 357 74"
              className="block h-7 w-auto"
              role="img"
              aria-label="Bamboo"
            >
              <defs>
                <filter id="bambooLogoMaskFilter" colorInterpolationFilters="sRGB">
                  {/* Invert (dark artwork -> light mask), then steepen so the
                      mid-tone rings go fully opaque and the near-white
                      background goes fully transparent. */}
                  <feColorMatrix
                    type="matrix"
                    values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"
                  />
                  <feComponentTransfer>
                    <feFuncR type="linear" slope="2.2" intercept="-0.13" />
                    <feFuncG type="linear" slope="2.2" intercept="-0.13" />
                    <feFuncB type="linear" slope="2.2" intercept="-0.13" />
                  </feComponentTransfer>
                </filter>
                <mask id="bambooLogoMask">
                  <image
                    href="/logo.png"
                    width={632}
                    height={632}
                    filter="url(#bambooLogoMaskFilter)"
                  />
                </mask>
              </defs>
              <g mask="url(#bambooLogoMask)">
                <rect x="0" y="0" width="413" height="632" fill="currentColor" />
                <rect x="413" y="0" width="219" height="632" fill="#D4A546" />
              </g>
            </svg>
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
