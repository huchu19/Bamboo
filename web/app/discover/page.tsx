'use client';

import { useState, useEffect } from 'react';
import PitchCard from '@/components/pitch/PitchCard';
import type { Pitch, PitchCategory } from '@/types';

const PITCH_CATEGORIES: PitchCategory[] = [
  'technology',
  'health',
  'fintech',
  'sustainability',
  'food-beverage',
  'education',
  'real-estate',
  'entertainment',
  'consumer-goods',
  'b2b-saas',
];

const categoryEmoji: Record<PitchCategory, string> = {
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

export default function DiscoverPage() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [filteredPitches, setFilteredPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PitchCategory | 'all'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'trending' | 'funding'>('recent');

  // Load sample pitches on mount
  useEffect(() => {
    setLoading(true);

    // Generate sample pitches for demo
    const samplePitches: Pitch[] = [
      {
        id: '1',
        inventorId: 'inv1',
        inventorName: 'Sarah Chen',
        title: 'EcoTrack - Carbon Footprint Analytics',
        tagline: 'AI-powered carbon tracking for businesses',
        description: 'Real-time carbon footprint monitoring and reduction recommendations for enterprises',
        category: 'sustainability',
        tags: ['AI', 'sustainability', 'B2B'],
        videoURL: 'https://example.com/video1.mp4',
        documents: [],
        fundingGoal: 500000,
        amountRaised: 350000,
        minimumInvestment: 10000,
        equityOffered: 12,
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
      {
        id: '2',
        inventorId: 'inv2',
        inventorName: 'Marcus Johnson',
        title: 'FinFlow - Smart Budget Analytics',
        tagline: 'Personalized financial planning for millennials',
        description: 'AI-powered budgeting tool that learns your spending habits and provides actionable insights',
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
      {
        id: '3',
        inventorId: 'inv3',
        inventorName: 'Dr. Priya Patel',
        title: 'HealthSync - Telemedicine Platform',
        tagline: 'Connecting patients with specialists in rural areas',
        description: 'Low-latency telemedicine platform designed for resource-constrained healthcare settings',
        category: 'health',
        tags: ['healthtech', 'telemedicine', 'impact'],
        videoURL: 'https://example.com/video3.mp4',
        documents: [],
        fundingGoal: 750000,
        amountRaised: 400000,
        minimumInvestment: 10000,
        equityOffered: 15,
        status: 'live',
        isVerified: true,
        verifiedAt: Date.now(),
        viewCount: 890,
        watchlistCount: 67,
        investorCount: 18,
        listingFeePaid: true,
        verifiedBadgePaid: true,
        createdAt: Date.now() - 86400000 * 7,
        updatedAt: Date.now(),
        publishedAt: Date.now() - 86400000 * 7,
      },
      {
        id: '4',
        inventorId: 'inv4',
        inventorName: 'Alex Rodriguez',
        title: 'CodeShift - No-Code Web Development',
        tagline: 'Drag-and-drop website builder for businesses',
        description: 'Modern, AI-assisted web development platform that requires zero coding knowledge',
        category: 'technology',
        tags: ['SaaS', 'developer tools', 'B2B'],
        videoURL: 'https://example.com/video4.mp4',
        documents: [],
        fundingGoal: 2000000,
        amountRaised: 1200000,
        minimumInvestment: 10000,
        equityOffered: 10,
        status: 'live',
        isVerified: true,
        verifiedAt: Date.now(),
        viewCount: 3450,
        watchlistCount: 289,
        investorCount: 52,
        listingFeePaid: true,
        verifiedBadgePaid: true,
        createdAt: Date.now() - 86400000 * 14,
        updatedAt: Date.now(),
        publishedAt: Date.now() - 86400000 * 14,
      },
      {
        id: '5',
        inventorId: 'inv5',
        inventorName: 'Lisa Wong',
        title: 'GreenChef - Sustainable Food Delivery',
        tagline: 'Plant-based meal delivery with zero food waste',
        description: 'Subscription service delivering meals from farm-to-door while eliminating packaging waste',
        category: 'food-beverage',
        tags: ['sustainability', 'food', 'B2C'],
        videoURL: 'https://example.com/video5.mp4',
        documents: [],
        fundingGoal: 600000,
        amountRaised: 280000,
        minimumInvestment: 5000,
        equityOffered: 18,
        status: 'live',
        isVerified: false,
        viewCount: 1560,
        watchlistCount: 112,
        investorCount: 22,
        listingFeePaid: true,
        verifiedBadgePaid: false,
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now(),
        publishedAt: Date.now() - 86400000 * 2,
      },
    ];

    setPitches(samplePitches);
    setLoading(false);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = pitches;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.tagline.toLowerCase().includes(query) ||
          p.inventorName.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Verified filter
    if (verifiedOnly) {
      filtered = filtered.filter((p) => p.isVerified);
    }

    // Sort
    if (sortBy === 'trending') {
      filtered = [...filtered].sort((a, b) => b.viewCount - a.viewCount);
    } else if (sortBy === 'funding') {
      filtered = [...filtered].sort((a, b) => b.amountRaised - a.amountRaised);
    } else {
      filtered = [...filtered].sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
    }

    setFilteredPitches(filtered);
  }, [pitches, searchQuery, selectedCategory, verifiedOnly, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🎋</div>
          <p className="text-gray-600">Loading pitches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
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
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              <option value="all">All Categories</option>
              {PITCH_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryEmoji[cat]} {cat.replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
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

      {/* Results count */}
      <div className="mt-8 text-center text-gray-600">
        <p>
          Showing {filteredPitches.length} of {pitches.length} pitches
        </p>
      </div>
    </div>
  );
}
