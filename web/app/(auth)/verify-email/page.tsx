'use client';

/**
 * Verification gate. Unverified users are routed here by ProtectedRoute. They
 * can resend the email and re-check; verified users are bounced to the
 * dashboard. Email/password accounts land here after signup; Google accounts
 * are already verified and never see it.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { firebaseUser, emailVerified, isAuthenticated, isLoading, logout } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (emailVerified) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, emailVerified, router]);

  async function resend() {
    setSending(true);
    setStatus(null);
    try {
      const { resendVerificationEmail } = await import('@/lib/firebase/auth');
      await resendVerificationEmail();
      setStatus('Verification email sent. Check your inbox (and spam).');
    } catch (err: any) {
      setStatus(err?.message || 'Could not send the email. Try again shortly.');
    } finally {
      setSending(false);
    }
  }

  async function recheck() {
    setChecking(true);
    setStatus(null);
    try {
      await firebaseUser?.reload();
      if (firebaseUser?.emailVerified) {
        router.replace('/dashboard');
      } else {
        setStatus("Still not verified. Click the link in the email, then check again.");
      }
    } catch {
      setStatus('Could not refresh. Try again.');
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 size-14 rounded-2xl bg-[color:var(--gold)]/15 flex items-center justify-center text-2xl">
          ✉️
        </div>
        <h1 className="font-display text-4xl uppercase tracking-tighter">Verify your email</h1>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          We sent a verification link to{' '}
          <span className="font-semibold text-foreground">{firebaseUser?.email}</span>. Click it to
          activate your account, then come back and check.
        </p>

        {status && (
          <div className="mt-5 px-4 py-3 rounded-lg bg-secondary text-sm text-foreground/80">
            {status}
          </div>
        )}

        <div className="mt-7 space-y-3">
          <button
            type="button"
            onClick={recheck}
            disabled={checking}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 transition disabled:opacity-50"
          >
            {checking ? 'Checking…' : "I've verified — continue"}
          </button>
          <button
            type="button"
            onClick={resend}
            disabled={sending}
            className="w-full py-3.5 border border-[color:var(--input)] rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-secondary transition disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Resend email'}
          </button>
        </div>

        <button
          type="button"
          onClick={async () => {
            await logout();
            router.replace('/login');
          }}
          className="mt-6 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign out
        </button>

        <p className="mt-6 text-[10px] font-mono text-muted-foreground/70">
          Wrong email or stuck?{' '}
          <Link href="/contact" className="text-[color:var(--gold)] hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
