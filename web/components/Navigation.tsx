'use client';

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isLoading, logout, role } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        borderBottom: `1px solid var(--border-light)`,
        background: isScrolled
          ? "color-mix(in srgb, var(--bg-primary) 95%, transparent)"
          : "var(--bg-primary)",
        backdropFilter: isScrolled ? "blur(8px)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
        <div className="text-2xl font-bold" style={{ color: "var(--accent-green)" }}>
          BAMBOO
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden sm:flex items-center gap-6">
            {!isLoading && isAuthenticated && user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full focus:outline-none"
                  aria-label="Account menu"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: "var(--accent-green)" }}
                  >
                    {initials}
                  </div>
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl shadow-lg overflow-hidden"
                    style={{
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-light)" }}>
                      <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {user.displayName || user.email}
                      </p>
                      <p className="text-[10px] font-mono uppercase tracking-widest mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        {role}
                      </p>
                    </div>
                    <Link
                      href={dashboardHref}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bg-secondary)]"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={async () => { setMenuOpen(false); await logout(); }}
                      className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bg-secondary)]"
                      style={{ color: "var(--text-primary)" }}
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
                  className="font-medium transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Login
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="font-semibold px-6 py-2.5 rounded-lg transition-all"
                  style={{
                    background: "var(--accent-green)",
                    color: "white",
                    boxShadow: "0 2px 8px rgba(30, 122, 92, 0.2)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(30, 122, 92, 0.3)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(30, 122, 92, 0.2)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Plant Your Seed
                </Link>
              </>
            ) : null}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
