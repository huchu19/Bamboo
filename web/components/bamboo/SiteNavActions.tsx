'use client';

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { BambooLeaf } from "./BambooIcons";
import { RoleSwitcherChip } from "./RoleSwitcherChip";

export function SiteNavActions({ variant = "light" }: { variant?: "light" | "ink" }) {
  const { user, isAuthenticated, isLoading, logout, role } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isInk = variant === "ink";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dashboardHref = role === "inventor" ? "/dashboard" : "/investor/dashboard";
  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="flex items-center gap-3">
      <RoleSwitcherChip />
      {!isLoading && isAuthenticated && user ? (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 focus:outline-none"
            aria-label="Account menu"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "var(--primary)" }}
            >
              {initials}
            </div>
          </button>
          {menuOpen && (
            <div
              className={`absolute right-0 mt-2 w-52 rounded-xl shadow-lg overflow-hidden z-50 ${
                isInk
                  ? "bg-[color:var(--ink)] border border-white/10 text-[color:var(--ink-foreground)]"
                  : "bg-background border border-[color:var(--border)] text-foreground"
              }`}
            >
              <div
                className={`px-4 py-3 border-b ${isInk ? "border-white/10" : "border-[color:var(--border)]"}`}
              >
                <p className="text-xs font-semibold truncate">{user.displayName || user.email}</p>
                <p className="text-[10px] font-mono uppercase tracking-widest mt-0.5 opacity-60">
                  {role}
                </p>
              </div>
              <Link
                href={dashboardHref}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 text-xs font-mono uppercase tracking-widest transition-colors ${
                  isInk ? "hover:bg-white/5" : "hover:bg-foreground/5"
                }`}
              >
                Dashboard
              </Link>
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  await logout();
                }}
                className={`w-full text-left px-4 py-2.5 text-xs font-mono uppercase tracking-widest transition-colors ${
                  isInk ? "hover:bg-white/5" : "hover:bg-foreground/5"
                }`}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      ) : !isLoading ? (
        <>
          <Link
            href="/login"
            className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${
              isInk ? "hover:bg-white/5" : "hover:bg-foreground/5"
            }`}
          >
            Login
          </Link>
          <Link
            href="/login?mode=signup"
            className="text-xs font-semibold bg-gradient-to-r from-primary to-[color:var(--primary-deep)] text-primary-foreground px-5 py-2 rounded-full shadow-sm hover:opacity-90 transition-all flex items-center gap-1.5"
          >
            <BambooLeaf size={11} className="text-[color:var(--gold)]" />
            Plant Your Seed
          </Link>
        </>
      ) : null}
    </div>
  );
}
