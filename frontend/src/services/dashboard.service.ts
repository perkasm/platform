/**
 * Dashboard Service
 * 
 * API service for dashboard operations.
 */

import { get } from './api';
import type { DashboardResponse, DashboardMetrics, Alert } from '@/types/api';

export const dashboardService = {
  /**
   * Get complete dashboard data (metrics + alerts + actions)
   */
  async getDashboard(): Promise<DashboardResponse> {
    return get<DashboardResponse>('/dashboard');
  },

  /**
   * Get only dashboard metrics
   */
  async getMetrics(): Promise<DashboardMetrics> {
    return get<DashboardMetrics>('/dashboard/metrics');
  },

  /**
   * Get only alerts
   */
  async getAlerts(): Promise<Alert[]> {
    return get<Alert[]>('/dashboard/alerts');
  },
};
