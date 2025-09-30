/**
 * Dashboard Service Module
 * 
 * API service for dashboard operations including metrics, alerts,
 * and recommended actions for credit card rewards optimization.
 * 
 * @module services/dashboard
 */

import { get } from './api';
import type { DashboardResponse, DashboardMetrics, Alert } from '@/types/api';

export const dashboardService = {
  /**
   * Get complete dashboard data including metrics, alerts, and recommended actions
   * 
   * This is the primary dashboard endpoint that returns all necessary data
   * for rendering the main dashboard view.
   * 
   * @returns Promise resolving to complete dashboard data
   * 
   * @example
   * ```typescript
   * const dashboard = await dashboardService.getDashboard();
   * console.log(dashboard.metrics.total_points);
   * console.log(dashboard.alerts.length);
   * ```
   */
  async getDashboard(): Promise<DashboardResponse> {
    return get<DashboardResponse>('/dashboard');
  },

  /**
   * Get only dashboard metrics (points, rewards value, etc.)
   * 
   * Use this endpoint when you only need metrics data without alerts
   * or recommended actions.
   * 
   * @returns Promise resolving to dashboard metrics
   * 
   * @example
   * ```typescript
   * const metrics = await dashboardService.getMetrics();
   * console.log(`Total Points: ${metrics.total_points}`);
   * ```
   */
  async getMetrics(): Promise<DashboardMetrics> {
    return get<DashboardMetrics>('/dashboard/metrics');
  },

  /**
   * Get only active alerts and notifications
   * 
   * Use this endpoint to fetch alerts independently, useful for
   * notification badges or alert-specific UI components.
   * 
   * @returns Promise resolving to array of alerts
   * 
   * @example
   * ```typescript
   * const alerts = await dashboardService.getAlerts();
   * const urgentAlerts = alerts.filter(a => a.severity === 'high');
   * ```
   */
  async getAlerts(): Promise<Alert[]> {
    return get<Alert[]>('/dashboard/alerts');
  },
};
