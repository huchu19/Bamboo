'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/types';
import type { Investment, Pitch } from '@/types';

interface InvestmentWithPitch extends Investment {
  pitch?: Pitch;
}

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  failed: 'bg-red-100 text-red-700',
};

export default function InvestorDashboard() {
  const { user, firebaseUser } = useAuth();
  const [investments, setInvestments] = useState<InvestmentWithPitch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser?.uid) return;

    let unsubscribe: (() => void) | undefined;

    import('@/lib/firebase/firestore').then(async ({ onInvestorInvestmentsChange, getPitch }) => {
      unsubscribe = onInvestorInvestmentsChange(firebaseUser.uid, async (data) => {
        // Enrich investments with pitch data
        const enriched = await Promise.all(
          data.map(async (inv) => {
            const pitch = await getPitch(inv.pitchId).catch(() => undefined);
            return { ...inv, pitch: pitch ?? undefined };
          })
        );
        setInvestments(enriched);
        setLoading(false);
      });
    });

    return () => unsubscribe?.();
  }, [firebaseUser?.uid]);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const completedCount = investments.filter((inv) => inv.status === 'completed').length;

  // Category breakdown
  const categoryBreakdown = investments.reduce<Record<string, number>>((acc, inv) => {
    const cat = inv.pitch?.category || 'other';
    acc[cat] = (acc[cat] || 0) + inv.amount;
    return acc;
  }, {});

  const displayName = user?.displayName || firebaseUser?.displayName || 'there';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {displayName}! 👋</h1>
        <p className="text-gray-600 mt-2">Your investment portfolio at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Total Invested</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalInvested)}</p>
          <p className="text-xs text-gray-500 mt-2">across all deals</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Investments</p>
          <p className="text-3xl font-bold text-gray-900">{investments.length}</p>
          <p className="text-xs text-gray-500 mt-2">{completedCount} completed</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Unique Deals</p>
          <p className="text-3xl font-bold text-gray-900">
            {new Set(investments.map((i) => i.pitchId)).size}
          </p>
          <p className="text-xs text-gray-500 mt-2">companies</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Categories</p>
          <p className="text-3xl font-bold text-gray-900">
            {Object.keys(categoryBreakdown).length}
          </p>
          <p className="text-xs text-gray-500 mt-2">sectors</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href="/discover"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Browse Pitches
        </Link>
        <Link
          href="/investor/watchlist"
          className="inline-block bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          View Watchlist
        </Link>
      </div>

      {/* Investment History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Investment History</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading investments...</p>
          </div>
        ) : investments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">💼</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No investments yet</h3>
            <p className="text-gray-600 mb-6">
              Browse pitches and make your first investment to start building your portfolio.
            </p>
            <Link
              href="/discover"
              className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition text-sm"
            >
              Browse Pitches
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {investments.map((inv) => (
              <div key={inv.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {inv.pitch?.title || 'Unknown Pitch'}
                    </h3>
                    {inv.pitch && (
                      <p className="text-sm text-gray-500 capitalize mt-0.5">
                        {inv.pitch.category.replace(/-/g, ' ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">{formatCurrency(inv.amount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-6 text-sm text-gray-500 mt-3">
                  {inv.equityPortion !== undefined && (
                    <span>Equity: {inv.equityPortion.toFixed(3)}%</span>
                  )}
                  <span>
                    {new Date(inv.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {inv.pitch && (
                    <Link
                      href={`/discover/${inv.pitchId}`}
                      className="text-green-600 hover:underline ml-auto"
                    >
                      View pitch →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Portfolio by Sector</h2>
          <div className="space-y-3">
            {Object.entries(categoryBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, amount]) => {
                const pct = totalInvested > 0 ? (amount / totalInvested) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{cat.replace(/-/g, ' ')}</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(amount)} ({Math.round(pct)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
