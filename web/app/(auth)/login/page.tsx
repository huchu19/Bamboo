'use client';

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const search = useSearchParams();
  const isSignup = search.get("mode") === "signup";
  const [role, setRole] = useState<"investor" | "founder">("investor");

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <aside className="relative hidden lg:flex flex-col justify-between p-12 bg-[color:var(--ink)] text-[color:var(--ink-foreground)] overflow-hidden bamboo-grain">
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--gold) 0px, transparent 1px), radial-gradient(circle at 80% 70%, var(--primary) 0px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <Link href="/" className="relative flex items-center gap-2 z-10">
          <span className="size-2 rounded-full bg-[color:var(--gold)]" />
          <span className="font-display text-2xl uppercase tracking-tighter">Bamboo</span>
        </Link>

        <div className="relative z-10 space-y-8">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)]">
            Members of the grove
          </span>
          <h1 className="font-display text-6xl uppercase leading-[0.9] tracking-tighter">
            Plant your <span className="text-[color:var(--gold)]">seed</span>.
          </h1>
          <p className="text-white/60 max-w-md text-sm leading-relaxed">
            Bamboo is the grove where Root-Verified founders plant 60-second pitches and
            accredited investors grow portfolios. Connected roots, exponential bloom.
          </p>
          <div className="grid grid-cols-3 gap-px bg-white/10 ring-1 ring-white/10 rounded-xl overflow-hidden">
            {[
              ["$240M+", "Capital Planted"],
              ["1,800", "Root-Verified Founders"],
              ["96%", "Grove Match Rate"],
            ].map(([k, v]) => (
              <div key={k} className="bg-[color:var(--ink)] p-4">
                <p className="font-display text-2xl text-[color:var(--gold)]">{k}</p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/50 mt-1">
                  {v}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[10px] font-mono text-white/40 tracking-widest uppercase">
          © Bamboo Asset Corp · SOC 2 · KYC/AML Verified
        </p>
      </aside>

      <main className="flex flex-col justify-center px-6 py-12 md:px-16">
        <div className="lg:hidden mb-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[color:var(--gold)]" />
            <span className="font-display text-2xl uppercase tracking-tighter">Bamboo</span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {isSignup ? "Join the Grove" : "Welcome Back"}
          </span>
          <h2 className="font-display text-5xl uppercase tracking-tighter mt-2 mb-8">
            {isSignup ? "Plant your seed." : "Sign in."}
          </h2>

          {isSignup && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl mb-6">
              {(["investor", "founder"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                    role === r
                      ? "bg-gradient-to-r from-primary to-[color:var(--primary-deep)] text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  I&apos;m an {r}
                </button>
              ))}
            </div>
          )}

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {isSignup && (
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full px-4 py-3 bg-card border border-[color:var(--input)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Jane Doe"
                />
              </div>
            )}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Work Email
              </label>
              <input
                type="email"
                required
                className="mt-1 w-full px-4 py-3 bg-card border border-[color:var(--input)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                required
                className="mt-1 w-full px-4 py-3 bg-card border border-[color:var(--input)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-primary to-[color:var(--primary-deep)] text-primary-foreground rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 group"
            >
              {isSignup ? "Plant Your Seed" : "Sign In"}
              <span className="text-[color:var(--gold)] group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[color:var(--border)]" /></div>
            <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-widest">
              <span className="bg-background px-3 text-muted-foreground">or</span>
            </div>
          </div>

          <button className="w-full py-3 border border-[color:var(--input)] rounded-lg text-sm font-semibold hover:bg-secondary transition-all">
            Continue with Google
          </button>

          <p className="mt-8 text-xs text-muted-foreground text-center">
            {isSignup ? "Already in the grove?" : "New to the grove?"}{" "}
            <Link
              href={isSignup ? "/login?mode=signin" : "/login?mode=signup"}
              className="text-foreground font-semibold underline-offset-4 hover:underline"
            >
              {isSignup ? "Sign in" : "Plant your seed"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
