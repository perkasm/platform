/**
 * Recommendations Service Module
 * 
 * API service for AI-powered credit card recommendations.
 * Provides personalized card suggestions based on user spending patterns,
 * current cards, and financial goals.
 * 
 * @module services/recommendations
 */

import { get } from './api';
import type { RecommendationsResponse } from '@/types/api';

export const recommendationsService = {
  /**
   * Get personalized credit card recommendations
   * 
   * Retrieves AI-powered recommendations for new credit cards based on
   * the user's spending patterns, existing cards, and optimization goals.
   * 
   * @param limit - Maximum number of recommendations to return (default: 3)
   * @returns Promise resolving to recommendations with reasoning
   * 
   * @example
   * ```typescript
   * // Get top 3 recommendations
   * const recs = await recommendationsService.getRecommendations();
   * 
   * // Get top 5 recommendations
   * const moreRecs = await recommendationsService.getRecommendations(5);
   * 
   * recs.recommendations.forEach(rec => {
   *   console.log(`${rec.card_name}: ${rec.reason}`);
   * });
   * ```
   */
  async getRecommendations(limit: number = 3): Promise<RecommendationsResponse> {
    return get<RecommendationsResponse>(`/recommendations?limit=${limit}`);
  },
};
