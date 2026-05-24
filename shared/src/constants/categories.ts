/**
 * Pitch categories for Bamboo
 */

import type { PitchCategory } from '../types/pitch';

export const PITCH_CATEGORIES: { value: PitchCategory; label: string; emoji: string }[] = [
  { value: 'technology', label: 'Technology', emoji: '💻' },
  { value: 'health', label: 'Health & Wellness', emoji: '🏥' },
  { value: 'fintech', label: 'Fintech', emoji: '💳' },
  { value: 'sustainability', label: 'Sustainability', emoji: '🌱' },
  { value: 'food-beverage', label: 'Food & Beverage', emoji: '🍽️' },
  { value: 'education', label: 'Education', emoji: '📚' },
  { value: 'real-estate', label: 'Real Estate', emoji: '🏠' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { value: 'consumer-goods', label: 'Consumer Goods', emoji: '🛍️' },
  { value: 'b2b-saas', label: 'B2B SaaS', emoji: '⚙️' },
];

export const CATEGORY_MAP = new Map(PITCH_CATEGORIES.map((cat) => [cat.value, cat]));

export const getCategoryLabel = (category: PitchCategory): string => {
  return CATEGORY_MAP.get(category)?.label || category;
};

export const getCategoryEmoji = (category: PitchCategory): string => {
  return CATEGORY_MAP.get(category)?.emoji || '🚀';
};
