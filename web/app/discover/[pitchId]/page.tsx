'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import type { Pitch } from '@/types';
import { formatCurrency, calculateFundingProgress } from '@/types';

const categoryEmoji: Record<string, string> = {
  technology: '💻', health: '🏥', fintech: '💳', sustainability: '🌱',
  'food-beverage': '🍽️', education: '📚', 'real-estate': '🏠',
  entertainment: '🎬', 'consumer-goods': '🛍️', 'b2b-saas': '⚙️',
};

export default function PitchDetailPage({ params }: { params: { pitchId: string } }) {
  const { pitchId } = params;
  const { firebaseUser, role } = useAuth();

  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [investmentStep, setInvestmentStep] = useState<'amount' | 'review' | 'confirm' | 'success'>('amount');
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [investmentLoading, setInvestmentLoading] = useState(false);

  // Load pitch from Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    import('@/lib/firebase/firestore').then(({ onPitchChange }) => {
      unsubscribe = onPitchChange(pitchId, (data) => {
        setPitch(data);
        setLoading(false);
      });
    });

    return () => unsubscribe?.();
  }, [pitchId]);

  // Check watchlist status
  useEffect(() => {
    if (!firebaseUser?.uid) return;

    import('@/lib/firebase/firestore').then(({ isInWatchlist }) => {
      isInWatchlist(firebaseUser.uid, pitchId).then(setIsWatchlisted);
    });
  }, [firebaseUser?.uid, pitchId]);

  const handleWatchlistToggle = async () => {
    if (!firebaseUser?.uid) return;
    setWatchlistLoading(true);
    try {
      const { addToWatchlist, removeFromWatchlist } = await import('@/lib/firebase/firestore');
      if (isWatchlisted) {
        await removeFromWatchlist(firebaseUser.uid, pitchId);
        setIsWatchlisted(false);
      } else {
        await addToWatchlist(firebaseUser.uid, pitchId);
        setIsWatchlisted(true);
      }
    } catch (err) {
      console.error('Watchlist error:', err);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleConfirmInvestment = async () => {
    if (!firebaseUser?.uid || !pitch) return;
    setInvestmentLoading(true);
    try {
      const { createInvestment } = await import('@/lib/firebase/firestore');
      await createInvestment({
        investorId: firebaseUser.uid,
        pitchId: pitch.id,
        amount: investmentAmount,
      });
      setInvestmentStep('success');
    } catch (err) {
      console.error('Investment error:', err);
      alert('Investment failed. Please try again.');
    } finally {
      setInvestmentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading pitch...</p>
        </div>
      </div>
    );
  }

  if (!pitch) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/discover" className="text-green-600 hover:text-green-700 mb-4 inline-block">
            ← Back to Discover
          </Link>
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Pitch not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const fundingProgress = calculateFundingProgress(pitch.amountRaised, pitch.fundingGoal);
  const amountInput = investmentAmount || 0;
  const equityPortion = pitch.fundingGoal > 0
    ? (amountInput / pitch.fundingGoal) * pitch.equityOffered
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back nav */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/discover" className="text-green-600 hover:text-green-700 text-sm font-medium">
            ← Back to Discover
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Placeholder */}
        {pitch.videoURL ? (
          <div className="rounded-2xl overflow-hidden aspect-video mb-8 bg-black">
            <video src={pitch.videoURL} controls className="w-full h-full" />
          </div>
        ) : (
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl aspect-video flex items-center justify-center mb-8 border border-green-200">
            <div className="text-6xl">🎥</div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                  {categoryEmoji[pitch.category] || '🚀'} {pitch.category.replace(/-/g, ' ')}
                </span>
                {pitch.isVerified && (
                  <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{pitch.title}</h1>
              <p className="text-xl text-gray-600 mb-6">{pitch.tagline}</p>
            </div>
            {firebaseUser && (
              <button
                onClick={handleWatchlistToggle}
                disabled={watchlistLoading}
                className={`px-4 py-2 rounded-lg font-medium transition flex-shrink-0 ${
                  isWatchlisted
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {isWatchlisted ? '♥ Watchlisted' : '♡ Watchlist'}
              </button>
            )}
          </div>

          <div className="pb-6 border-b border-gray-200">
            <p className="text-sm text-gray-600">Founded by</p>
            <p className="text-lg font-semibold text-gray-900">{pitch.inventorName}</p>
          </div>

          {/* Funding Progress */}
          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Funding Progress</span>
                <span className="text-sm font-semibold text-green-600">{Math.round(fundingProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div>
                <p className="text-sm text-gray-600">Raised</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(pitch.amountRaised)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Goal</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(pitch.fundingGoal)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Investors</p>
                <p className="text-2xl font-bold text-gray-900">{pitch.investorCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Equity Offered</p>
                <p className="text-2xl font-bold text-gray-900">{pitch.equityOffered}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Min. Investment</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(pitch.minimumInvestment)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Pitch</h2>
              <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {pitch.description}
              </div>

              {pitch.tags && pitch.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {pitch.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {pitch.documents && pitch.documents.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Documents</h2>
                <div className="space-y-3">
                  {pitch.documents.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <span className="text-2xl">📄</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{doc.name}</p>
                      </div>
                      <span className="text-green-600">↓</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column: Invest CTA */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24 space-y-4">
              {role === 'investor' || !firebaseUser ? (
                <button
                  onClick={() => {
                    if (!firebaseUser) {
                      window.location.href = '/login';
                      return;
                    }
                    setInvestmentStep('amount');
                    setShowInvestmentForm(true);
                  }}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  {firebaseUser ? 'Invest Now' : 'Sign in to Invest'}
                </button>
              ) : (
                <div className="text-sm text-gray-500 text-center py-2">
                  Switch to an investor account to invest.
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-semibold text-gray-900 capitalize">{pitch.status}</p>
                </div>
                <div>
                  <p className="text-gray-600">Views</p>
                  <p className="font-semibold text-gray-900">{pitch.viewCount || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Watchlisted by</p>
                  <p className="font-semibold text-gray-900">{pitch.watchlistCount || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {investmentStep === 'success' ? 'Investment Confirmed' : `Invest in ${pitch.title}`}
              </h2>
              <button
                onClick={() => {
                  setShowInvestmentForm(false);
                  setInvestmentStep('amount');
                  setInvestmentAmount(0);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {investmentStep === 'amount' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Investment Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-600">$</span>
                      <input
                        type="number"
                        min={Math.ceil(pitch.minimumInvestment / 100)}
                        step="100"
                        value={investmentAmount ? Math.ceil(investmentAmount / 100) : ''}
                        onChange={(e) => setInvestmentAmount((parseInt(e.target.value) || 0) * 100)}
                        placeholder={`Min. ${formatCurrency(pitch.minimumInvestment)}`}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum: {formatCurrency(pitch.minimumInvestment)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (amountInput >= pitch.minimumInvestment) setInvestmentStep('review');
                    }}
                    disabled={amountInput < pitch.minimumInvestment}
                    className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Review Investment
                  </button>
                </div>
              )}

              {investmentStep === 'review' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Investment Amount</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(amountInput)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Equity Stake</span>
                      <span className="font-semibold text-gray-900">{equityPortion.toFixed(3)}%</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="text-gray-900 font-medium">Est. Return (2×)</span>
                      <span className="font-bold text-green-600">+{(equityPortion * 2).toFixed(2)}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setInvestmentStep('confirm')}
                    className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Continue to Payment
                  </button>
                  <button
                    onClick={() => setInvestmentStep('amount')}
                    className="w-full bg-gray-100 text-gray-900 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition"
                  >
                    Back
                  </button>
                </div>
              )}

              {investmentStep === 'confirm' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700">
                      💳 This is a demo — no real charge will be made. Your investment will be
                      recorded in Firestore.
                    </p>
                  </div>
                  <button
                    onClick={handleConfirmInvestment}
                    disabled={investmentLoading}
                    className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {investmentLoading ? 'Processing...' : `Confirm ${formatCurrency(amountInput)} Investment`}
                  </button>
                  <button
                    onClick={() => setInvestmentStep('review')}
                    disabled={investmentLoading}
                    className="w-full bg-gray-100 text-gray-900 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition"
                  >
                    Back
                  </button>
                </div>
              )}

              {investmentStep === 'success' && (
                <div className="text-center space-y-4">
                  <div className="text-5xl">🎉</div>
                  <h3 className="text-xl font-bold text-gray-900">Investment Recorded!</h3>
                  <p className="text-gray-600 text-sm">
                    Your {formatCurrency(amountInput)} investment in{' '}
                    <strong>{pitch.title}</strong> has been confirmed and saved.
                  </p>
                  <button
                    onClick={() => {
                      setShowInvestmentForm(false);
                      setInvestmentStep('amount');
                      setInvestmentAmount(0);
                    }}
                    className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Done
                  </button>
                  <Link
                    href="/investor/dashboard"
                    className="block w-full bg-gray-100 text-gray-900 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition text-center"
                  >
                    View Portfolio
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
