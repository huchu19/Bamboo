'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { isInviteRequired } from '@/lib/invites';

export default function RegisterPage() {
  const router = useRouter();
  const [roleParam, setRoleParam] = useState<'inventor' | 'investor' | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    setRoleParam((params.get('role') as 'inventor' | 'investor') || null);
  }, []);

  const [step, setStep] = useState<'role' | 'form'>(roleParam ? 'form' : 'role');
  const [role, setRole] = useState<'inventor' | 'investor'>(roleParam || 'investor');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Invite-only beta: gate registrations behind a code when
  // NEXT_PUBLIC_INVITE_REQUIRED=true (Phase 7 launch posture).
  const inviteRequired = isInviteRequired();

  const handleRoleSelect = (selectedRole: 'inventor' | 'investor') => {
    setRole(selectedRole);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Pre-check the invite before creating the auth account, so a bad code
      // never leaves an orphaned account behind.
      if (inviteRequired) {
        const res = await fetch('/api/invites/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: inviteCode }),
        });
        const data = await res.json();
        if (!data.valid) {
          setError(data.reason || 'That invite code is not valid.');
          setLoading(false);
          return;
        }
      }

      const { registerUser } = await import('@/lib/firebase/auth');
      const user = await registerUser(email, password, displayName, role);

      // Consume the invite (transactional + idempotent server-side). A race
      // where the last seat was taken between validate and redeem surfaces
      // here; the account exists but the seat is gone — tell them to reach out.
      if (inviteRequired) {
        const token = await user.getIdToken();
        const res = await fetch('/api/invites/redeem', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code: inviteCode }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(
            `${data.error || 'Could not redeem the invite.'} Your account was created — contact us and we'll activate it.`,
          );
          setLoading(false);
          return;
        }
      }

      router.push(role === 'inventor' ? '/pitch/new' : '/discover');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Bamboo</h1>
          <p className="text-gray-600">What's your role?</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect('inventor')}
            className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition text-left group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition">🚀</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">I'm an Inventor</h3>
            <p className="text-sm text-gray-600">Pitch my idea and raise funds</p>
          </button>

          <button
            onClick={() => handleRoleSelect('investor')}
            className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition text-left group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition">💰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">I'm an Investor</h3>
            <p className="text-sm text-gray-600">Discover and fund innovative ideas</p>
          </button>
        </div>

        <div className="text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-green-600 font-semibold hover:text-green-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
      <div className="mb-6">
        <button
          onClick={() => {
            setStep('role');
            setError('');
          }}
          className="text-green-600 text-sm font-medium hover:text-green-700 flex items-center gap-1"
        >
          ← Back
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {role === 'inventor' ? 'Become an Inventor' : 'Become an Investor'}
      </h1>
      <p className="text-gray-600 mb-8">Create your Bamboo account</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {inviteRequired && (
          <div>
            <label htmlFor="invite" className="block text-sm font-medium text-gray-900 mb-1.5">
              Invite Code
            </label>
            <input
              id="invite"
              type="text"
              required
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="BAMBOO-XXXX-XXXX"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-mono tracking-wider focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              Bamboo is in invite-only beta. No code? Ask the person who invited you.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1.5">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1.5">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-gray-900 mb-1.5">
            Confirm Password
          </label>
          <input
            id="confirm"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Already have an account?{' '}
          <Link href="/login" className="text-green-600 font-semibold hover:text-green-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
