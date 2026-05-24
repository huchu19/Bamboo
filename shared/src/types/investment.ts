/**
 * Investment types for Bamboo investing platform
 */

export type InvestmentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface Investment {
  id: string;
  investorId: string;
  pitchId: string;
  inventorId: string; // denormalized

  // Amount
  amount: number; // in cents
  equityPortion?: number; // calculated equity %

  // Status
  status: InvestmentStatus;

  // Payment reference
  stripePaymentIntentId?: string;
  paymentMethod?: string;

  // Metadata
  notes?: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  completedAt?: number; // timestamp
}

export interface CreateInvestmentInput {
  investorId: string;
  pitchId: string;
  amount: number; // in cents
  notes?: string;
}
