/**
 * Fee constants — mirrors shared/src/constants/payments.ts.
 *
 * Duplicated here because Turbopack cannot bundle value exports from outside
 * the web/ root (type re-exports in web/types.ts are fine since they erase at
 * compile time). Keep the two files in sync if pricing changes.
 */

export const LISTING_FEE_CENTS = 4900; // $49
export const VERIFIED_BADGE_FEE_CENTS = 9900; // $99
export const MIN_INVESTMENT_CENTS = 10000; // $100

export const CURRENCY = 'usd';
