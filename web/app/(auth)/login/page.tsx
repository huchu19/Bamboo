'use client';

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const search = useSearchParams();
  const router = useRouter();
  const { role } = useAuth();
  const isSignup = search.get("mode") === "signup";
  const [selectedRole, setSelectedRole] = useState<"investor" | "founder">("investor");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (isSignup) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignup) {
        const firebaseRole = selectedRole === "founder" ? "inventor" : "investor";
        const { registerUser } = await import("@/lib/firebase/auth");
        await registerUser(email, password, displayName, firebaseRole);
        router.push(firebaseRole === "inventor" ? "/pitch/new" : "/discover");
      } else {
        const { loginUser } = await import("@/lib/firebase/auth");
        const fbUser = await loginUser(email, password);
        const { getUser } = await import("@/lib/firebase/firestore");
        const userDoc = await getUser(fbUser.uid);
        const dest = userDoc?.role === "inventor" ? "/dashboard" : "/investor/dashboard";
        router.push(dest);
      }
    } catch (err: any) {
      const msg: Record<string, string> = {
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
        "auth/email-already-in-use": "An account with this email already exists.",
      };
      setError(msg[err.code] || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

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

          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {isSignup && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl mb-6">
              {(["investor", "founder"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                    selectedRole === r
                      ? "bg-gradient-to-r from-primary to-[color:var(--primary-deep)] text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  I&apos;m an {r}
                </button>
              ))}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isSignup && (
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 w-full px-4 py-3 bg-card border border-[color:var(--input)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Jane Doe"
                />
              </div>
            )}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {isSignup ? "Work Email" : "Email"}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-3 bg-card border border-[color:var(--input)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>

            {isSignup && (
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full px-4 py-3 bg-card border border-[color:var(--input)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
            )}

            {!isSignup && (
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-[color:var(--primary-deep)] text-primary-foreground rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isSignup ? "Plant Your Seed" : "Sign In"}
                  <span className="text-[color:var(--gold)] group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-xs text-muted-foreground text-center">
            {isSignup ? "Already in the grove?" : "New to the grove?"}{" "}
            <Link
              href={isSignup ? "/login" : "/login?mode=signup"}
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
