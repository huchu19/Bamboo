'use client';

import { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { auth } = await import('@/lib/firebase/config');
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        // Don't reveal whether email exists — show success anyway
        setSent(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200 text-center">
        <div className="text-5xl mb-4">📬</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
        <p className="text-gray-600 mb-6">
          If an account exists for <strong>{email}</strong>, you'll receive a password reset link
          shortly.
        </p>
        <Link
          href="/login"
          className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition text-sm"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
      <p className="text-gray-600 mb-8">
        Enter your email and we'll send you a link to reset your password.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-gray-500 hover:text-green-600">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}
