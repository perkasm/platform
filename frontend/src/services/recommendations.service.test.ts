/**
 * Recommendations Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recommendationsService } from './recommendations.service';
import * as api from './api';
import type { RecommendationsResponse, CardRecommendation } from '@/types/api';

vi.mock('./api');

describe('recommendationsService', () => {
  const mockRecommendations: CardRecommendation[] = [
    {
      id: 'chase_ink_cash',
      name: 'Chase Ink Business Cash',
      issuer: 'Chase',
      category: 'Business',
      welcome_bonus: '75,000 points after $7,500 spend',
      annual_fee: 0,
      estimated_value: 1850,
      key_benefits: [
        '5% on office supplies and internet',
        '5% on gas stations',
        'No annual fee',
      ],
      match_reason: 'Perfect for your high office supply spending',
      match_score: 92.5,
      affiliate_disclosure: true,
    },
    {
      id: 'capital_one_venture_x',
      name: 'Capital One Venture X',
      issuer: 'Capital One',
      category: 'Travel',
      welcome_bonus: '75,000 miles after $4,000 spend',
      annual_fee: 395,
      estimated_value: 2100,
      key_benefits: [
        '2x miles on everything',
        '$300 annual travel credit',
        'Priority Pass lounge access',
      ],
      match_reason: 'Complements your travel spending patterns',
      match_score: 88.0,
      affiliate_disclosure: true,
    },
  ];

  const mockResponse: RecommendationsResponse = {
    recommendations: mockRecommendations,
    total: 2,
    generated_at: '2024-01-15T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRecommendations', () => {
    it('should fetch recommendations with default limit', async () => {
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await recommendationsService.getRecommendations();

      expect(api.get).toHaveBeenCalledWith('/recommendations?limit=3');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch recommendations with custom limit', async () => {
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await recommendationsService.getRecommendations(5);

      expect(api.get).toHaveBeenCalledWith('/recommendations?limit=5');
      expect(result).toEqual(mockResponse);
    });

    it('should return recommendations with correct structure', async () => {
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await recommendationsService.getRecommendations();

      expect(result.recommendations).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result).toHaveProperty('generated_at');
    });

    it('should return recommendations sorted by match score', async () => {
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await recommendationsService.getRecommendations();

      expect(result.recommendations[0].match_score).toBeGreaterThan(
        result.recommendations[1].match_score
      );
    });

    it('should include all required fields in recommendations', async () => {
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await recommendationsService.getRecommendations();
      const rec = result.recommendations[0];

      expect(rec).toHaveProperty('id');
      expect(rec).toHaveProperty('name');
      expect(rec).toHaveProperty('issuer');
      expect(rec).toHaveProperty('category');
      expect(rec).toHaveProperty('welcome_bonus');
      expect(rec).toHaveProperty('annual_fee');
      expect(rec).toHaveProperty('estimated_value');
      expect(rec).toHaveProperty('key_benefits');
      expect(rec).toHaveProperty('match_reason');
      expect(rec).toHaveProperty('match_score');
      expect(rec).toHaveProperty('affiliate_disclosure');
    });

    it('should handle empty recommendations', async () => {
      const emptyResponse: RecommendationsResponse = {
        recommendations: [],
        total: 0,
        generated_at: '2024-01-15T10:00:00Z',
      };

      vi.mocked(api.get).mockResolvedValue(emptyResponse);

      const result = await recommendationsService.getRecommendations();

      expect(result.recommendations).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
});
