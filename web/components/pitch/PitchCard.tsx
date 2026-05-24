'use client';

import Link from 'next/link';
import type { Pitch } from '@/types';
import { formatCurrency, formatCompactNumber, calculateFundingProgress } from '@/types';

interface PitchCardProps {
  pitch: Pitch;
}

export default function PitchCard({ pitch }: PitchCardProps) {
  const fundingProgress = calculateFundingProgress(pitch.amountRaised, pitch.fundingGoal);
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
    <Link href={`/discover/${pitch.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-green-500 hover:shadow-lg transition cursor-pointer h-full flex flex-col">
        {/* Thumbnail / Video placeholder */}
        <div className="relative w-full aspect-video bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
          {pitch.videoThumbnailURL ? (
            <img
              src={pitch.videoThumbnailURL}
              alt={pitch.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-4xl">🎥</div>
          )}

          {/* Verified badge overlay */}
          {pitch.isVerified && (
            <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              ✓ Verified
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Category */}
          <div className="mb-3">
            <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
              {categoryEmoji[pitch.category] || '🚀'} {pitch.category.replace('-', ' ')}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{pitch.title}</h3>

          {/* Tagline */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{pitch.tagline}</p>

          {/* Funding progress */}
          <div className="space-y-2 flex-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${fundingProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span className="font-semibold text-gray-900">
                {formatCurrency(pitch.amountRaised)}
              </span>
              <span>{Math.round(fundingProgress)}%</span>
            </div>
            <p className="text-xs text-gray-500">of {formatCurrency(pitch.fundingGoal)} goal</p>
          </div>

          {/* Footer stats */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-600">
            <span>{formatCompactNumber(pitch.viewCount)} views</span>
            <span>{formatCompactNumber(pitch.investorCount)} investors</span>
            <span>{pitch.equityOffered}% equity</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
