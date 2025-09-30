/**
 * Recommendations Service
 * 
 * API service for credit card recommendations.
 */

import { get } from './api';
import type { RecommendationsResponse } from '@/types/api';

export const recommendationsService = {
  /**
   * Get personalized card recommendations
   */
  async getRecommendations(limit: number = 3): Promise<RecommendationsResponse> {
    return get<RecommendationsResponse>(`/recommendations?limit=${limit}`);
  },
};
