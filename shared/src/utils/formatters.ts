/**
 * Utility formatters for Bamboo
 */

/**
 * Format cents to USD currency string
 * @example formatCurrency(4900) => "$49.00"
 */
export const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(cents / 100);
};

/**
 * Format date to readable string
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format percentage with 1 decimal place
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Format large numbers with K/M suffixes
 * @example formatCompactNumber(1500) => "1.5K"
 */
export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Calculate funding progress percentage
 */
export const calculateFundingProgress = (raised: number, goal: number): number => {
  if (goal === 0) return 0;
  return Math.min((raised / goal) * 100, 100);
};

/**
 * Calculate equity portion from amount and goal
 */
export const calculateEquityPortion = (investmentAmount: number, fundingGoal: number, equityOffered: number): number => {
  if (fundingGoal === 0) return 0;
  return (investmentAmount / fundingGoal) * equityOffered;
};
