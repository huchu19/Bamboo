/**
 * Payment types for Bamboo investing platform
 */

export type PaymentType = 'listing_fee' | 'verified_badge' | 'investment';
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  userId: string;
  pitchId?: string; // for listing/badge fees
  investmentId?: string; // for investment payments

  type: PaymentType;
  amount: number; // in cents
  currency: string; // 'usd'

  status: PaymentStatus;

  // Stripe references (stubbed for now)
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;

  metadata: Record<string, string>;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface CreatePaymentInput {
  userId: string;
  type: PaymentType;
  amount: number;
  currency?: string;
  pitchId?: string;
  investmentId?: string;
  metadata?: Record<string, string>;
}
