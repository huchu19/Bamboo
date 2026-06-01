'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          <div className="hidden sm:flex gap-6">
            <Link
              href="/login"
              className="font-medium transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Login
            </Link>
            <Link
              href="/register"
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
              Start Investing
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
