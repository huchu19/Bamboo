/**
 * User types for Bamboo investing platform
 */

export type UserRole = 'inventor' | 'investor';

export interface InventorProfile {
  companyName?: string;
  website?: string;
  linkedIn?: string;
  bio: string;
  isVerified: boolean;
  verifiedAt?: number; // timestamp
  totalPitches: number;
  totalFundsRaised: number; // in cents
}

export interface InvestorProfile {
  accreditedStatus: 'pending' | 'verified' | 'unverified';
  investmentTotal: number; // in cents
  portfolioCount: number;
  preferredCategories: string[];
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp

  /** True once the user has dismissed the first-login onboarding modal. */
  hasOnboarded?: boolean;

  // Role-specific profiles
  inventorProfile?: InventorProfile;
  investorProfile?: InvestorProfile;
}
