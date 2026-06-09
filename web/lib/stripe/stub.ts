/**
 * Stripe payment stub - ready to be wired with real Stripe SDK
 * This interface defines the contract for payment processing
 *
 * TODO(stripe): Replace stub calls with real Stripe Elements + webhook handlers
 *   when pricing is finalised. Current MVP keeps all pricing surfaces pointed at
 *   /contact instead. See MILESTONES.md Phase 8.
 */

const stubLog = process.env.NODE_ENV !== 'production'
  ? (...args: unknown[]) => console.log(...args)
  : () => {};

export interface PaymentIntent {
  clientSecret: string;
  status: 'requires_payment_method' | 'succeeded' | 'processing' | 'requires_action';
}

export interface PaymentResult {
  success: boolean;
  error?: string;
  transactionId?: string;
}

/**
 * Stripe stub implementation
 * In production, replace these implementations with real Stripe API calls
 */
export const stripeStub = {
  /**
   * Create a payment intent
   * Stub: returns mock client secret
   * Real: calls Stripe API to create PaymentIntent
   */
  createPaymentIntent: async (
    amount: number,
    currency: string,
    metadata: Record<string, string> = {}
  ): Promise<PaymentIntent> => {
    // STUB: Mock implementation
    stubLog('🔄 [STUB] Creating payment intent', { amount, currency, metadata });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      clientSecret: `pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'requires_payment_method',
    };
  },

  /**
   * Confirm payment with client secret
   * Stub: returns mock success after delay
   * Real: calls Stripe SDK to confirm payment
   */
  confirmPayment: async (clientSecret: string, _paymentMethod: any): Promise<PaymentResult> => {
    // STUB: Mock implementation
    stubLog('💳 [STUB] Confirming payment', { clientSecret });

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Stub always succeeds (in real implementation, failures can occur)
    return {
      success: true,
      transactionId: `txn_${Date.now()}`,
    };
  },

  /**
   * Handle payment confirmation
   * Stub: displays toast and returns success
   * Real: would handle Stripe redirect or 3D Secure challenges
   */
  handlePaymentConfirmation: async (
    amount: number,
    type: 'listing_fee' | 'verified_badge' | 'investment'
  ): Promise<PaymentResult> => {
    // STUB: Always succeeds
    stubLog(`💰 [STUB] Processing ${type} payment: ${amount} cents`);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      success: true,
      transactionId: `${type}_${Date.now()}`,
    };
  },

  /**
   * Refund a payment
   * Stub: returns mock success
   * Real: calls Stripe refund API
   */
  refundPayment: async (transactionId: string): Promise<PaymentResult> => {
    stubLog('↩️ [STUB] Refunding payment', { transactionId });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
    };
  },
};

/**
 * UI component stub for displaying Stripe payment form
 * This will be replaced with actual Stripe Elements implementation
 */
export const PaymentFormStubProps = {
  amount: 0,
  currency: 'usd',
  onSuccess: () => {},
  onError: () => {},
};

export type PaymentFormStubConfig = typeof PaymentFormStubProps;
