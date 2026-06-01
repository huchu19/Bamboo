'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, calculateFundingProgress } from '@/types';
import type { Pitch } from '@/types';

const statusColors: Record<string, string> = {
  live: 'bg-green-100 text-green-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  pending_payment: 'bg-gray-100 text-gray-600',
  closed: 'bg-red-100 text-red-700',
  draft: 'bg-blue-100 text-blue-700',
};

const statusLabel: Record<string, string> = {
  live: 'Live',
  under_review: 'Under Review',
  pending_payment: 'Pending Payment',
  closed: 'Closed',
  draft: 'Draft',
};

export default function InventorDashboard() {
  const { user, firebaseUser } = useAuth();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser?.uid) return;

    let unsubscribe: (() => void) | undefined;

    import('@/lib/firebase/firestore').then(({ onInventorPitchesChange }) => {
      unsubscribe = onInventorPitchesChange(firebaseUser.uid, (data) => {
        setPitches(data);
        setLoading(false);
      });
    });

    return () => unsubscribe?.();
  }, [firebaseUser?.uid]);

  const totalRaised = pitches.reduce((sum, p) => sum + (p.amountRaised || 0), 0);
  const totalViews = pitches.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const totalInvestors = pitches.reduce((sum, p) => sum + (p.investorCount || 0), 0);
  const livePitches = pitches.filter((p) => p.status === 'live').length;

  const displayName = user?.displayName || firebaseUser?.displayName || 'there';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {displayName}! 👋</h1>
        <p className="text-gray-600 mt-2">Here's an overview of your pitches and investor interest</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Total Pitches</p>
          <p className="text-3xl font-bold text-gray-900">{pitches.length}</p>
          <p className="text-xs text-gray-500 mt-2">{livePitches} live</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Total Views</p>
          <p className="text-3xl font-bold text-gray-900">
            {totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews}
          </p>
          <p className="text-xs text-gray-500 mt-2">across all pitches</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Total Investors</p>
          <p className="text-3xl font-bold text-gray-900">{totalInvestors}</p>
          <p className="text-xs text-gray-500 mt-2">invested so far</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Funds Raised</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalRaised)}</p>
          <p className="text-xs text-gray-500 mt-2">total raised</p>
        </div>
      </div>

      <Link
        href="/pitch/new"
        className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
      >
        + Create New Pitch
      </Link>

      {/* Your Pitches */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Your Pitches</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading your pitches...</p>
          </div>
        ) : pitches.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pitches yet</h3>
            <p className="text-gray-600 mb-6">Plant your first seed — create a pitch and start raising.</p>
            <Link
              href="/pitch/new"
              className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition text-sm"
            >
              Create Your First Pitch
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pitches.map((pitch) => {
              const progress = calculateFundingProgress(pitch.amountRaised, pitch.fundingGoal);
              return (
                <div key={pitch.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 mr-4">
                      <h3 className="text-lg font-semibold text-gray-900">{pitch.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{pitch.tagline}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ${statusColors[pitch.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel[pitch.status] || pitch.status}
                    </span>
                  </div>

                  {/* Funding progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{formatCurrency(pitch.amountRaised || 0)} raised</span>
                      <span>{Math.round(progress)}% of {formatCurrency(pitch.fundingGoal)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-green-600 h-1.5 rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Views</p>
                      <p className="font-semibold text-gray-900">{pitch.viewCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Watchlist</p>
                      <p className="font-semibold text-gray-900">{pitch.watchlistCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Investors</p>
                      <p className="font-semibold text-gray-900">{pitch.investorCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Equity</p>
                      <p className="font-semibold text-gray-900">{pitch.equityOffered}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Verified Badge Upsell */}
      {!user?.inventorProfile?.isVerified && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 p-8">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">✓ Get Verified</h3>
              <p className="text-gray-700 mb-4">
                Earn our Verified Badge through a due diligence review. Investors trust verified founders.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-4">
                <li>✓ Increased investor confidence</li>
                <li>✓ Featured in "Verified" section</li>
                <li>✓ Higher conversion rates</li>
              </ul>
              <p className="font-semibold text-gray-900 mb-4">One-time fee: $199</p>
              <button className="bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-700 transition">
                Upgrade to Verified
              </button>
            </div>
            <div className="text-5xl">⭐</div>
          </div>
        </div>
      )}
    </div>
  );
}
