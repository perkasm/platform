/**
 * React Query Hooks for Recommendations
 * 
 * Custom hooks for fetching card recommendations.
 */

import { useQuery } from '@tanstack/react-query';
import { recommendationsService } from '@/services/recommendations.service';

// Query keys
export const recommendationsKeys = {
  all: ['recommendations'] as const,
  list: (limit: number) => [...recommendationsKeys.all, { limit }] as const,
};

/**
 * Hook to fetch card recommendations
 */
export function useRecommendations(limit: number = 3) {
  return useQuery({
    queryKey: recommendationsKeys.list(limit),
    queryFn: () => recommendationsService.getRecommendations(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes - recommendations don't change often
  });
}
