/**
 * Pitch types for Bamboo investing platform
 */

export type PitchStatus = 'draft' | 'pending_payment' | 'pending_review' | 'live' | 'funded' | 'closed' | 'rejected';

export type PitchCategory =
  | 'technology'
  | 'health'
  | 'fintech'
  | 'sustainability'
  | 'food-beverage'
  | 'education'
  | 'real-estate'
  | 'entertainment'
  | 'consumer-goods'
  | 'b2b-saas';

export interface PitchDocument {
  name: string;
  url: string; // Firebase Storage URL
  type: string; // MIME type
  uploadedAt: number; // timestamp
}

export interface Pitch {
  id: string;
  inventorId: string;
  inventorName: string;
  inventorPhotoURL?: string;

  // Content
  title: string;
  tagline: string; // 1-sentence hook
  description: string;
  category: PitchCategory;
  tags: string[];

  // Media
  videoURL?: string; // Firebase Storage URL
  videoThumbnailURL?: string;
  documents: PitchDocument[]; // Business plan, financials, deck, etc.

  // Funding
  fundingGoal: number; // in cents
  amountRaised: number; // in cents
  minimumInvestment: number; // in cents
  equityOffered: number; // percentage, e.g. 10.5
  fundingDeadline?: number; // timestamp

  // Status
  status: PitchStatus;
  isVerified: boolean;
  verifiedAt?: number; // timestamp

  // Analytics (denormalized counters)
  viewCount: number;
  watchlistCount: number;
  investorCount: number;

  // Payment tracking
  listingFeePaid: boolean;
  listingFeePaymentId?: string;
  verifiedBadgePaid: boolean;
  verifiedBadgePaymentId?: string;

  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  publishedAt?: number; // timestamp
}

export interface CreatePitchInput {
  title: string;
  tagline: string;
  description: string;
  category: PitchCategory;
  tags: string[];
  fundingGoal: number;
  minimumInvestment: number;
  equityOffered: number;
  fundingDeadline?: number;
}

export interface UpdatePitchInput {
  title?: string;
  tagline?: string;
  description?: string;
  category?: PitchCategory;
  tags?: string[];
  fundingGoal?: number;
  minimumInvestment?: number;
  equityOffered?: number;
  fundingDeadline?: number;
}
