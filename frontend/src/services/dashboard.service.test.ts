/**
 * Dashboard Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardService } from './dashboard.service';
import * as api from './api';
import type { DashboardResponse, DashboardMetrics, Alert } from '@/types/api';

vi.mock('./api');

describe('dashboardService', () => {
  const mockMetrics: DashboardMetrics = {
    total_points: 290160,
    total_available_credit: 125300,
    average_utilization: 18.5,
    cards_count: 4,
    monthly_spending: 5234.50,
    monthly_points_earned: 15704,
    estimated_annual_value: 2826.72,
  };

  const mockAlerts: Alert[] = [
    {
      id: 'alert_1',
      type: 'warning',
      title: 'High Utilization',
      message: 'Your Chase Sapphire Reserve is at 75% utilization',
      card_id: 1,
      created_at: '2024-01-15T10:00:00Z',
    },
  ];

  const mockDashboard: DashboardResponse = {
    metrics: mockMetrics,
    alerts: mockAlerts,
    upcoming_actions: [
      {
        title: 'Complete Welcome Bonus',
        description: 'Chase Ink Business Preferred',
        amount: '$800 remaining',
        deadline: 'Due in 45 days',
        card_id: 2,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('should fetch complete dashboard data', async () => {
      vi.mocked(api.get).mockResolvedValue(mockDashboard);

      const result = await dashboardService.getDashboard();

      expect(api.get).toHaveBeenCalledWith('/dashboard');
      expect(result).toEqual(mockDashboard);
      expect(result.metrics).toEqual(mockMetrics);
      expect(result.alerts).toEqual(mockAlerts);
      expect(result.upcoming_actions).toHaveLength(1);
    });
  });

  describe('getMetrics', () => {
    it('should fetch only dashboard metrics', async () => {
      vi.mocked(api.get).mockResolvedValue(mockMetrics);

      const result = await dashboardService.getMetrics();

      expect(api.get).toHaveBeenCalledWith('/dashboard/metrics');
      expect(result).toEqual(mockMetrics);
    });

    it('should return correct metric values', async () => {
      vi.mocked(api.get).mockResolvedValue(mockMetrics);

      const result = await dashboardService.getMetrics();

      expect(result.total_points).toBe(290160);
      expect(result.cards_count).toBe(4);
      expect(result.average_utilization).toBe(18.5);
      expect(result.estimated_annual_value).toBe(2826.72);
    });
  });

  describe('getAlerts', () => {
    it('should fetch only alerts', async () => {
      vi.mocked(api.get).mockResolvedValue(mockAlerts);

      const result = await dashboardService.getAlerts();

      expect(api.get).toHaveBeenCalledWith('/dashboard/alerts');
      expect(result).toEqual(mockAlerts);
    });

    it('should handle empty alerts array', async () => {
      vi.mocked(api.get).mockResolvedValue([]);

      const result = await dashboardService.getAlerts();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return alerts with correct types', async () => {
      vi.mocked(api.get).mockResolvedValue(mockAlerts);

      const result = await dashboardService.getAlerts();

      expect(result[0].type).toBe('warning');
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('message');
    });
  });
});
