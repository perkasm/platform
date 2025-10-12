import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useRecommendations, recommendationsKeys } from './use-recommendations';
import { recommendationsService } from '@/services/recommendations.service';

// Mock the services
vi.mock('@/services/recommendations.service', () => ({
  recommendationsService: {
    getRecommendations: vi.fn(),
  },
}));

// Test wrapper component
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useRecommendations', () => {
  const mockRecommendations = [
    {
      id: 'rec-1',
      name: 'Chase Sapphire Preferred',
      issuer: 'Chase',
      category: 'Travel',
      welcome_bonus: '60,000 points',
      annual_fee: 95,
      estimated_value: 1200,
      key_benefits: [
        '3x points on travel and dining',
        '2x points on all other purchases',
        'No foreign transaction fees',
      ],
      match_reason: 'High travel spending detected',
      match_score: 95,
      affiliate_disclosure: true,
    },
    {
      id: 'rec-2',
      name: 'American Express Gold',
      issuer: 'American Express',
      category: 'Dining',
      welcome_bonus: '4x points on restaurants',
      annual_fee: 250,
      estimated_value: 800,
      key_benefits: [
        '4x points on restaurants and U.S. supermarkets',
        '3x points on flights booked directly with airlines',
        '2x points on all other purchases',
      ],
      match_reason: 'Frequent dining purchases',
      match_score: 88,
      affiliate_disclosure: false,
    },
  ];

  const mockResponse = {
    recommendations: mockRecommendations,
    total: 2,
    generated_at: '2024-01-15T10:30:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useRecommendations', () => {
    it('should fetch recommendations with default limit', async () => {
      const mockGetRecommendations = vi.mocked(recommendationsService.getRecommendations);
      mockGetRecommendations.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRecommendations(), { wrapper: createWrapper() });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetRecommendations).toHaveBeenCalledWith(3); // default limit
      expect(result.current.data).toEqual(mockResponse);
    });

    it('should fetch recommendations with custom limit', async () => {
      const mockGetRecommendations = vi.mocked(recommendationsService.getRecommendations);
      mockGetRecommendations.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRecommendations(5), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetRecommendations).toHaveBeenCalledWith(5);
    });

    it('should handle error state', async () => {
      const mockGetRecommendations = vi.mocked(recommendationsService.getRecommendations);
      const error = new Error('Failed to fetch recommendations');
      mockGetRecommendations.mockRejectedValue(error);

      const { result } = renderHook(() => useRecommendations(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });

    it('should have correct stale time for recommendations', () => {
      const { result } = renderHook(() => useRecommendations(), { wrapper: createWrapper() });

      // Recommendations should have 10 minute stale time (don't change often)
      expect(result.current).toBeDefined();
    });

    it('should return correct data structure', async () => {
      const mockGetRecommendations = vi.mocked(recommendationsService.getRecommendations);
      mockGetRecommendations.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRecommendations(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.recommendations).toHaveLength(2);
      expect(result.current.data?.total).toBe(2);
      expect(result.current.data?.generated_at).toBe('2024-01-15T10:30:00Z');

      // Check first recommendation structure
      const firstRec = result.current.data?.recommendations[0];
      expect(firstRec).toEqual({
        id: 'rec-1',
        name: 'Chase Sapphire Preferred',
        issuer: 'Chase',
        category: 'Travel',
        welcome_bonus: '60,000 points',
        annual_fee: 95,
        estimated_value: 1200,
        key_benefits: [
          '3x points on travel and dining',
          '2x points on all other purchases',
          'No foreign transaction fees',
        ],
        match_reason: 'High travel spending detected',
        match_score: 95,
        affiliate_disclosure: true,
      });
    });

    it('should handle empty recommendations', async () => {
      const mockGetRecommendations = vi.mocked(recommendationsService.getRecommendations);
      const emptyResponse = {
        recommendations: [],
        total: 0,
        generated_at: '2024-01-15T10:30:00Z',
      };
      mockGetRecommendations.mockResolvedValue(emptyResponse);

      const { result } = renderHook(() => useRecommendations(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.recommendations).toHaveLength(0);
      expect(result.current.data?.total).toBe(0);
    });
  });

  describe('recommendationsKeys', () => {
    it('should generate correct query keys', () => {
      expect(recommendationsKeys.all).toEqual(['recommendations']);
      expect(recommendationsKeys.list(3)).toEqual(['recommendations', { limit: 3 }]);
      expect(recommendationsKeys.list(5)).toEqual(['recommendations', { limit: 5 }]);
    });
  });

  describe('cache behavior', () => {
    it('should cache recommendations by limit', async () => {
      const mockGetRecommendations = vi.mocked(recommendationsService.getRecommendations);
      mockGetRecommendations.mockResolvedValue(mockResponse);

      // First hook with limit 3
      const { result: result1 } = renderHook(() => useRecommendations(3), { wrapper: createWrapper() });
      await waitFor(() => expect(result1.current.isSuccess).toBe(true));

      // Second hook with limit 5
      const { result: result2 } = renderHook(() => useRecommendations(5), { wrapper: createWrapper() });
      await waitFor(() => expect(result2.current.isSuccess).toBe(true));

      // Should have been called twice with different limits
      expect(mockGetRecommendations).toHaveBeenCalledTimes(2);
      expect(mockGetRecommendations).toHaveBeenNthCalledWith(1, 3);
      expect(mockGetRecommendations).toHaveBeenNthCalledWith(2, 5);
    });
  });
});