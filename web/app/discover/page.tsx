'use client';

import { useState, useEffect, useMemo } from 'react';
import PitchCard from '@/components/pitch/PitchCard';
import type { Pitch, PitchCategory } from '@/types';

const PITCH_CATEGORIES: PitchCategory[] = [
  'technology', 'health', 'fintech', 'sustainability', 'food-beverage',
  'education', 'real-estate', 'entertainment', 'consumer-goods', 'b2b-saas',
];

const categoryEmoji: Record<PitchCategory, string> = {
  technology: '💻', health: '🏥', fintech: '💳', sustainability: '🌱',
  'food-beverage': '🍽️', education: '📚', 'real-estate': '🏠',
  entertainment: '🎬', 'consumer-goods': '🛍️', 'b2b-saas': '⚙️',
};

export default function DiscoverPage() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PitchCategory | 'all'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'trending' | 'funding'>('recent');

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    import('@/lib/firebase/firestore').then(({ onPitchesChange }) => {
      unsubscribe = onPitchesChange((data) => {
        setPitches(data);
        setLoading(false);
      });
    });

    return () => unsubscribe?.();
  }, []);

  const filteredPitches = useMemo(() => {
    let filtered = pitches;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.inventorName.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (verifiedOnly) {
      filtered = filtered.filter((p) => p.isVerified);
    }

    if (sortBy === 'trending') {
      return [...filtered].sort((a, b) => b.viewCount - a.viewCount);
    } else if (sortBy === 'funding') {
      return [...filtered].sort((a, b) => b.amountRaised - a.amountRaised);
    } else {
      return [...filtered].sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
    }
  }, [pitches, searchQuery, selectedCategory, verifiedOnly, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading pitches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Discover Pitches</h1>
        <p className="text-xl text-gray-600">Find innovative ideas to invest in</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search pitches, founders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as PitchCategory | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              <option value="all">All Categories</option>
              {PITCH_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryEmoji[cat]} {cat.replace(/-/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              <option value="recent">Most Recent</option>
              <option value="trending">Trending</option>
              <option value="funding">Highest Funded</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-gray-700">✓ Verified Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Pitch Grid */}
      {pitches.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🌱</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No pitches yet</h3>
          <p className="text-gray-600">Be the first to list a pitch and attract investors.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPitches.length > 0 ? (
              filteredPitches.map((pitch) => <PitchCard key={pitch.id} pitch={pitch} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No pitches found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center text-gray-500 text-sm">
            Showing {filteredPitches.length} of {pitches.length} pitches
          </div>
        </>
      )}
    </div>
  );
}
