/**
 * React Query Hooks for Dashboard
 * 
 * Custom hooks for fetching dashboard data.
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  full: () => [...dashboardKeys.all, 'full'] as const,
  metrics: () => [...dashboardKeys.all, 'metrics'] as const,
  alerts: () => [...dashboardKeys.all, 'alerts'] as const,
};

/**
 * Hook to fetch complete dashboard data
 */
export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.full(),
    queryFn: () => dashboardService.getDashboard(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

/**
 * Hook to fetch only dashboard metrics
 */
export function useDashboardMetrics() {
  return useQuery({
    queryKey: dashboardKeys.metrics(),
    queryFn: () => dashboardService.getMetrics(),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch only alerts
 */
export function useDashboardAlerts() {
  return useQuery({
    queryKey: dashboardKeys.alerts(),
    queryFn: () => dashboardService.getAlerts(),
    staleTime: 1 * 60 * 1000, // 1 minute - alerts should be fresher
    refetchInterval: 3 * 60 * 1000, // Refetch every 3 minutes
  });
}
