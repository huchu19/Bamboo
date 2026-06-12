'use client';

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isInviteRequired } from "@/lib/invites";

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
  useAuth();
  const isSignup = search.get("mode") === "signup";
  const [selectedRole, setSelectedRole] = useState<"investor" | "inventor">("investor");

  const inviteRequired = isInviteRequired();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
      if (!acceptedTerms) {
        setError("Please accept the Terms of Service and Privacy Policy to continue.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignup) {
        const firebaseRole = selectedRole === "inventor" ? "inventor" : "investor";

        if (inviteRequired) {
          const res = await fetch("/api/invites/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: inviteCode }),
          });
          const data = await res.json();
          if (!data.valid) {
            setError(data.reason || "That invite code is not valid.");
            setLoading(false);
            return;
          }
        }

        const { registerUser } = await import("@/lib/firebase/auth");
        const user = await registerUser(email, password, displayName, firebaseRole);

        if (inviteRequired) {
          const token = await user.getIdToken();
          const res = await fetch("/api/invites/redeem", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ code: inviteCode }),
          });
          if (!res.ok) {
            const data = await res.json();
            setError(`${data.error || "Could not redeem the invite."} Your account was created — contact us and we'll activate it.`);
            setLoading(false);
            return;
          }
        }

        router.push("/dashboard");
      } else {
        const { loginUser } = await import("@/lib/firebase/auth");
        await loginUser(email, password);
        router.push("/dashboard");
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
            Bamboo is the grove where Root-Verified inventors plant 60-second pitches and
            accredited investors grow portfolios. Connected roots, exponential bloom.
          </p>
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
              {(["investor", "inventor"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                    selectedRole === r
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  I&apos;m {r === "investor" ? "an" : "an"} {r}
                </button>
              ))}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isSignup && inviteRequired && (
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Invite Code
                </label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="mt-1 w-full px-4 py-3 bg-card border border-[color:var(--input)] rounded-lg text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="BAMBOO-XXXX-XXXX"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <p className="text-[10px] font-mono text-muted-foreground mt-1">
                  Bamboo is invite-only. No code? Ask the person who invited you.
                </p>
              </div>
            )}
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

            {isSignup && (
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 rounded border-[color:var(--input)] text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <span className="text-xs text-muted-foreground leading-snug">
                  I agree to Bamboo&apos;s{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-foreground font-semibold underline-offset-2 hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-foreground font-semibold underline-offset-2 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
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
              disabled={loading || (isSignup && !acceptedTerms)}
              className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
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
