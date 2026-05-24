'use client';

import Link from 'next/link';

export default function InventorDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, Sarah! 👋</h1>
        <p className="text-gray-600 mt-2">Here's an overview of your pitches and investor interest</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Total Pitches</p>
          <p className="text-3xl font-bold text-gray-900">1</p>
          <p className="text-xs text-gray-500 mt-2">1 live</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Total Views</p>
          <p className="text-3xl font-bold text-gray-900">1.2K</p>
          <p className="text-xs text-gray-500 mt-2">+240 this week</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Total Interested</p>
          <p className="text-3xl font-bold text-gray-900">12</p>
          <p className="text-xs text-gray-500 mt-2">investors</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Funds Raised</p>
          <p className="text-3xl font-bold text-green-600">$350K</p>
          <p className="text-xs text-gray-500 mt-2">of $500K goal (70%)</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/pitch/new"
        className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
      >
        + Create New Pitch
      </Link>

      {/* Recent Pitches */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Your Pitches</h2>
        </div>

        <div className="divide-y divide-gray-200">
          <div className="p-6 hover:bg-gray-50 transition cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">EcoTrack - Carbon Footprint Analytics</h3>
                <p className="text-sm text-gray-600 mt-1">AI-powered carbon tracking for businesses</p>
              </div>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Live</span>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-600">Views</p>
                <p className="font-semibold text-gray-900">1.2K</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Watchlist</p>
                <p className="font-semibold text-gray-900">89</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Investors</p>
                <p className="font-semibold text-gray-900">12</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Funding</p>
                <p className="font-semibold text-green-600">70%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Badge Upsell */}
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

      {/* Recent Investors */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Recent Investors</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {[
            { amount: '$50,000', date: '2 days ago' },
            { amount: '$100,000', date: '1 week ago' },
            { amount: '$25,000', date: '2 weeks ago' },
          ].map((inv, idx) => (
            <div key={idx} className="p-6 flex justify-between items-center hover:bg-gray-50 transition">
              <div>
                <p className="font-semibold text-gray-900">Investor #{idx + 1}</p>
                <p className="text-sm text-gray-600">{inv.date}</p>
              </div>
              <p className="font-bold text-green-600">{inv.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
