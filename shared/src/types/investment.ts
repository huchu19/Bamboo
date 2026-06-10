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

  /**
   * When true, the investor opted to hide their identity from the founder and
   * any public-facing list. `investorId` still holds the real UID for the
   * investor's portfolio + audit/compliance. Visibility is enforced in the UI
   * + (eventually) Firestore security rules.
   */
  anonymous: boolean;

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
  /** Defaults to false when omitted. */
  anonymous?: boolean;
  notes?: string;
}
