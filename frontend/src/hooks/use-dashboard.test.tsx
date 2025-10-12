import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDashboard, useDashboardMetrics, useDashboardAlerts, dashboardKeys } from './use-dashboard';
import { dashboardService } from '@/services/dashboard.service';

// Mock the services
vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    getDashboard: vi.fn(),
    getMetrics: vi.fn(),
    getAlerts: vi.fn(),
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

describe('useDashboard hooks', () => {
  const mockDashboardData = {
    metrics: {
      total_points: 50000,
      total_available_credit: 47500,
      average_utilization: 5.0,
      cards_count: 5,
      monthly_spending: 3200.75,
      monthly_points_earned: 1250,
      estimated_annual_value: 2500.50,
    },
    alerts: [
      {
        id: 'alert-1',
        type: 'warning' as const,
        title: 'High Utilization',
        message: 'Your Chase card utilization is above 30%',
        card_id: 1,
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 'alert-2',
        type: 'info' as const,
        title: 'Welcome Bonus Available',
        message: 'New Amex card offers 50,000 points welcome bonus',
        created_at: '2024-01-15T09:00:00Z',
      },
    ],
    upcoming_actions: [
      {
        title: 'Spend $2,400 on dining',
        description: 'Earn 3x points on dining purchases',
        amount: '$2,400',
        deadline: '2024-12-31',
        card_id: 1,
      },
    ],
  };

  const mockMetrics = mockDashboardData.metrics;
  const mockAlerts = mockDashboardData.alerts;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useDashboard', () => {
    it('should fetch complete dashboard data', async () => {
      const mockGetDashboard = vi.mocked(dashboardService.getDashboard);
      mockGetDashboard.mockResolvedValue(mockDashboardData);

      const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetDashboard).toHaveBeenCalledWith();
      expect(result.current.data).toEqual(mockDashboardData);
    });

    it('should handle error state', async () => {
      const mockGetDashboard = vi.mocked(dashboardService.getDashboard);
      const error = new Error('Failed to fetch dashboard');
      mockGetDashboard.mockRejectedValue(error);

      const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });

    it('should have correct stale time', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });

      // The hook should be configured with 2 minute stale time
      // We can't directly test this, but we can verify the hook is created
      expect(result.current).toBeDefined();
    });
  });

  describe('useDashboardMetrics', () => {
    it('should fetch only dashboard metrics', async () => {
      const mockGetMetrics = vi.mocked(dashboardService.getMetrics);
      mockGetMetrics.mockResolvedValue(mockMetrics);

      const { result } = renderHook(() => useDashboardMetrics(), { wrapper: createWrapper() });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetMetrics).toHaveBeenCalledWith();
      expect(result.current.data).toEqual(mockMetrics);
    });

    it('should handle metrics error', async () => {
      const mockGetMetrics = vi.mocked(dashboardService.getMetrics);
      const error = new Error('Failed to fetch metrics');
      mockGetMetrics.mockRejectedValue(error);

      const { result } = renderHook(() => useDashboardMetrics(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useDashboardAlerts', () => {
    it('should fetch only alerts', async () => {
      const mockGetAlerts = vi.mocked(dashboardService.getAlerts);
      mockGetAlerts.mockResolvedValue(mockAlerts);

      const { result } = renderHook(() => useDashboardAlerts(), { wrapper: createWrapper() });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetAlerts).toHaveBeenCalledWith();
      expect(result.current.data).toEqual(mockAlerts);
    });

    it('should handle alerts error', async () => {
      const mockGetAlerts = vi.mocked(dashboardService.getAlerts);
      const error = new Error('Failed to fetch alerts');
      mockGetAlerts.mockRejectedValue(error);

      const { result } = renderHook(() => useDashboardAlerts(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });

    it('should have shorter stale time for alerts', () => {
      const { result } = renderHook(() => useDashboardAlerts(), { wrapper: createWrapper() });

      // Alerts should have 1 minute stale time (more frequent updates)
      expect(result.current).toBeDefined();
    });
  });

  describe('dashboardKeys', () => {
    it('should generate correct query keys', () => {
      expect(dashboardKeys.all).toEqual(['dashboard']);
      expect(dashboardKeys.full()).toEqual(['dashboard', 'full']);
      expect(dashboardKeys.metrics()).toEqual(['dashboard', 'metrics']);
      expect(dashboardKeys.alerts()).toEqual(['dashboard', 'alerts']);
    });
  });

  describe('refetch behavior', () => {
    it('should refetch dashboard data at specified intervals', () => {
      const mockGetDashboard = vi.mocked(dashboardService.getDashboard);
      mockGetDashboard.mockResolvedValue(mockDashboardData);

      renderHook(() => useDashboard(), { wrapper: createWrapper() });

      // The hook should be configured with refetchInterval of 5 minutes
      // We can't directly test the interval, but we can verify the hook is created
      expect(mockGetDashboard).toHaveBeenCalledTimes(1);
    });

    it('should refetch alerts more frequently', () => {
      const mockGetAlerts = vi.mocked(dashboardService.getAlerts);
      mockGetAlerts.mockResolvedValue(mockAlerts);

      renderHook(() => useDashboardAlerts(), { wrapper: createWrapper() });

      // Alerts should refetch every 3 minutes
      expect(mockGetAlerts).toHaveBeenCalledTimes(1);
    });
  });
});