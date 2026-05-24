'use client';

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState } from "react";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      {/* Navigation */}
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

      {/* Hero Section */}
      <section
        className="flex-1 px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative overflow-hidden"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5" style={{ background: "var(--accent-green)" }} />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-8 inline-block px-4 py-2 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
            <span className="text-sm font-semibold" style={{ color: "var(--accent-green)" }}>
              The Future of Investing
            </span>
          </div>
          <h1 className="mb-8">
            Move Markets.
            <br />
            <span style={{ color: "var(--accent-green)" }}>Build Empires.</span>
          </h1>
          <p className="text-lg mb-12 max-w-2xl" style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
            Connect with ambitious entrepreneurs and exclusive investment opportunities. Curated deals from visionary founders. Your portfolio, your terms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register?role=inventor"
              className="font-semibold px-8 py-4 rounded-lg text-center transition-all"
              style={{
                background: "var(--accent-green)",
                color: "white",
                boxShadow: "var(--shadow-md)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Founder? Launch Your Deal
            </Link>
            <Link
              href="/register?role=investor"
              className="font-semibold px-8 py-4 rounded-lg text-center transition-all"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--accent-green)",
                border: `2px solid var(--accent-green)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent-green)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--bg-tertiary)";
                e.currentTarget.style.color = "var(--accent-green)";
              }}
            >
              Investor? Access Deals
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        className="py-20 border-b"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-light)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-3" style={{ color: "var(--accent-green)" }}>
                0
              </div>
              <p style={{ color: "var(--text-secondary)" }}>Pitches Closed</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-3" style={{ color: "var(--accent-gold)" }}>
                0
              </div>
              <p style={{ color: "var(--text-secondary)" }}>Active Investors</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-3" style={{ color: "var(--accent-green)" }}>
                $0M
              </div>
              <p style={{ color: "var(--text-secondary)" }}>Capital Deployed</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24" style={{ background: "var(--bg-primary)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Founders */}
            <div>
              <h3 className="mb-8 flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                  style={{ background: "var(--accent-green)", color: "white" }}
                >
                  ➔
                </span>
                For Founders
              </h3>
              <ol className="space-y-6">
                {[
                  "Create your pitch with a 60-second video showcase",
                  "Upload financials, decks, and key metrics",
                  "List for $49 — no hidden fees",
                  "Attract capital and close deals",
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <span
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        background: "var(--accent-gold)",
                        color: "var(--bg-primary)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Investors */}
            <div>
              <h3 className="mb-8 flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                  style={{ background: "var(--accent-green)", color: "white" }}
                >
                  $
                </span>
                For Investors
              </h3>
              <ol className="space-y-6">
                {[
                  "Browse curated, vetted investment opportunities",
                  "Review detailed pitch materials and metrics",
                  "Make informed decisions — your way",
                  "Track returns and build your portfolio",
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <span
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        background: "var(--accent-gold)",
                        color: "var(--bg-primary)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-24"
        style={{
          background: "var(--accent-green)",
          backgroundImage: "linear-gradient(135deg, var(--accent-green) 0%, #16574d 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-white mb-6">Ready to make your move?</h2>
          <p className="text-lg text-green-100 mb-12 max-w-2xl mx-auto">
            Join the network of ambitious founders and discerning investors building the future.
          </p>
          <Link
            href="/register"
            className="inline-block font-semibold px-8 py-4 rounded-lg transition-all"
            style={{
              background: "white",
              color: "var(--accent-green)",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.15)";
            }}
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-12 border-t"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-light)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" style={{ color: "var(--text-tertiary)" }}>
            <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              BAMBOO
            </p>
            <p>&copy; 2026 Bamboo Investing Platform. Move Markets. Build Empires.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
