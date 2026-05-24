'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Pitch } from '@/types';
import { formatCurrency, calculateFundingProgress } from '@/types';

// Sample pitch data (would come from Firestore in real app)
const SAMPLE_PITCHES: Record<string, Pitch> = {
  '1': {
    id: '1',
    inventorId: 'inv1',
    inventorName: 'Sarah Chen',
    title: 'EcoTrack - Carbon Footprint Analytics',
    tagline: 'AI-powered carbon tracking for businesses',
    description:
      'EcoTrack is an enterprise SaaS platform that helps companies measure, monitor, and reduce their carbon footprint in real-time. Our AI analyzes supply chain data, energy consumption, and manufacturing processes to provide actionable insights.\n\nKey Features:\n• Real-time carbon tracking\n• AI-powered reduction recommendations\n• Automated compliance reporting\n• Integration with existing systems\n\nMarket Opportunity:\nThe global carbon management software market is expected to reach $5.2B by 2030. With 200+ enterprise clients already and 120% YoY growth, we\'re positioned to capture significant market share.',
    category: 'sustainability',
    tags: ['AI', 'sustainability', 'B2B', 'SaaS'],
    videoURL: 'https://example.com/video1.mp4',
    documents: [
      {
        name: 'Business Plan',
        url: 'https://example.com/doc1.pdf',
        type: 'application/pdf',
        uploadedAt: Date.now() - 86400000,
      },
      {
        name: 'Financial Projections',
        url: 'https://example.com/doc2.pdf',
        type: 'application/pdf',
        uploadedAt: Date.now() - 86400000,
      },
    ],
    fundingGoal: 500000,
    amountRaised: 350000,
    minimumInvestment: 10000,
    equityOffered: 12,
    fundingDeadline: Date.now() + 86400000 * 30,
    status: 'live',
    isVerified: true,
    verifiedAt: Date.now(),
    viewCount: 1240,
    watchlistCount: 89,
    investorCount: 12,
    listingFeePaid: true,
    verifiedBadgePaid: true,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now(),
    publishedAt: Date.now() - 86400000 * 5,
  },
  '2': {
    id: '2',
    inventorId: 'inv2',
    inventorName: 'Marcus Johnson',
    title: 'FinFlow - Smart Budget Analytics',
    tagline: 'Personalized financial planning for millennials',
    description:
      'FinFlow helps millennials take control of their finances with AI-powered budgeting, investment recommendations, and personalized financial insights.',
    category: 'fintech',
    tags: ['fintech', 'AI', 'consumer'],
    videoURL: 'https://example.com/video2.mp4',
    documents: [],
    fundingGoal: 1000000,
    amountRaised: 620000,
    minimumInvestment: 10000,
    equityOffered: 8,
    status: 'live',
    isVerified: false,
    viewCount: 2100,
    watchlistCount: 156,
    investorCount: 28,
    listingFeePaid: true,
    verifiedBadgePaid: false,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
    publishedAt: Date.now() - 86400000 * 3,
  },
};

export default function PitchDetailPage({ params }: { params: { pitchId: string } }) {
  const pitch = SAMPLE_PITCHES[params.pitchId];
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [investmentStep, setInvestmentStep] = useState<'amount' | 'review' | 'confirm'>(
    'amount'
  );
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  if (!pitch) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/discover" className="text-green-600 hover:text-green-700 mb-4 inline-block">
            ← Back to Discover
          </Link>
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Pitch not found</p>
          </div>
        </div>
      </div>
    );
  }

  const fundingProgress = calculateFundingProgress(pitch.amountRaised, pitch.fundingGoal);
  const amountInput = investmentAmount || 0;
  const equityPortion = (amountInput / pitch.fundingGoal) * pitch.equityOffered;

  const categoryEmoji: Record<string, string> = {
    technology: '💻',
    health: '🏥',
    fintech: '💳',
    sustainability: '🌱',
    'food-beverage': '🍽️',
    education: '📚',
    'real-estate': '🏠',
    entertainment: '🎬',
    'consumer-goods': '🛍️',
    'b2b-saas': '⚙️',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/discover" className="text-green-600 hover:text-green-700 text-sm font-medium">
            ← Back to Discover
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Section */}
        <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl aspect-video flex items-center justify-center mb-8 border border-green-200">
          <div className="text-6xl">🎥</div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                  {categoryEmoji[pitch.category] || '🚀'} {pitch.category.replace('-', ' ')}
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
            <button
              onClick={() => setIsWatchlisted(!isWatchlisted)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isWatchlisted
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isWatchlisted ? '♥ Watchlisted' : '♡ Add to Watchlist'}
            </button>
          </div>

          {/* Founder info */}
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
                  style={{ width: `${fundingProgress}%` }}
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
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(pitch.minimumInvestment)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left column - Description & Documents */}
          <div className="col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Pitch</h2>
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                {pitch.description}
              </div>
            </div>

            {/* Documents */}
            {pitch.documents.length > 0 && (
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
                        <p className="text-sm text-gray-500">{doc.type}</p>
                      </div>
                      <span className="text-green-600">↓</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column - Investment CTA */}
          <div className="col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24 space-y-4">
              <button
                onClick={() => {
                  setShowInvestmentForm(true);
                  setInvestmentStep('amount');
                }}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Invest Now
              </button>

              <p className="text-xs text-gray-500 text-center">
                By investing, you accept our{' '}
                <span className="text-green-600 cursor-pointer hover:underline">terms</span>
              </p>

              {/* Stats */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="text-sm">
                  <p className="text-gray-600">Status</p>
                  <p className="font-semibold text-gray-900">Active</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600">Views</p>
                  <p className="font-semibold text-gray-900">{pitch.viewCount}</p>
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
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <button
                onClick={() => setShowInvestmentForm(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl absolute top-4 right-4"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Invest in {pitch.title}</h2>
            </div>

            {/* Content */}
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
                      Minimum investment: {formatCurrency(pitch.minimumInvestment)}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (amountInput >= pitch.minimumInvestment) {
                        setInvestmentStep('review');
                      }
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
                      <span className="text-gray-900 font-medium">Expected Return (est.)</span>
                      <span className="font-bold text-green-600">+{(equityPortion * 2).toFixed(1)}%</span>
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
                      💳 Payment processing (Stripe stub - demo mode)
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      alert(
                        `✓ Investment of ${formatCurrency(amountInput)} confirmed!\n\nYour investment has been recorded. In production, you would be charged via Stripe.`
                      );
                      setShowInvestmentForm(false);
                      setInvestmentAmount(0);
                    }}
                    className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Confirm Investment
                  </button>

                  <button
                    onClick={() => setInvestmentStep('review')}
                    className="w-full bg-gray-100 text-gray-900 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition"
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
