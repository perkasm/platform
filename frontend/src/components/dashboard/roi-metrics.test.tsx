import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ROIMetrics } from './roi-metrics';

describe('ROIMetrics', () => {
  it('should render the primary ROI card', () => {
    render(<ROIMetrics />);

    expect(screen.getByText('Annual ROI')).toBeInTheDocument();
    // Use getAllByText and check the first one (Annual ROI card)
    const amounts = screen.getAllByText('$4,847');
    expect(amounts).toHaveLength(2); // One in Annual ROI, one in Year Progress
    expect(screen.getByText('+18.2% vs last year')).toBeInTheDocument();
    expect(screen.getByText('Annual fees paid: $895')).toBeInTheDocument();
    expect(screen.getByText('Value gained: $5,742')).toBeInTheDocument();
  });

  it('should render monthly stats card', () => {
    render(<ROIMetrics />);

    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('$412')).toBeInTheDocument();
    expect(screen.getByText('+$67 vs last month')).toBeInTheDocument();
    expect(screen.getByText('Points earned:')).toBeInTheDocument();
    expect(screen.getByText('23,450')).toBeInTheDocument();
    expect(screen.getByText('Value rate:')).toBeInTheDocument();
    expect(screen.getByText('1.76¢/pt')).toBeInTheDocument();
  });

  it('should render year progress card', () => {
    render(<ROIMetrics />);

    expect(screen.getByText('Year Progress')).toBeInTheDocument();
    // Check for the specific content in the Year Progress card
    expect(screen.getByText('87% of $5,500 goal')).toBeInTheDocument();
    expect(screen.getByText('Total points:')).toBeInTheDocument();
    expect(screen.getByText('287,340')).toBeInTheDocument();
    expect(screen.getByText('Avg value rate:')).toBeInTheDocument();
    expect(screen.getByText('1.69¢/pt')).toBeInTheDocument();
  });

  it('should render quick stats section', () => {
    render(<ROIMetrics />);

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Active Cards')).toBeInTheDocument();
    expect(screen.getByText('94%')).toBeInTheDocument();
    expect(screen.getByText('Utilization')).toBeInTheDocument();
    expect(screen.getByText('A+')).toBeInTheDocument();
    expect(screen.getByText('Opt Score')).toBeInTheDocument();
  });

  it('should have proper card structure and styling', () => {
    render(<ROIMetrics />);

    // Check for gradient success card
    const gradientCard = document.querySelector('.bg-gradient-success');
    expect(gradientCard).toBeInTheDocument();

    // Check for regular shadow cards
    const shadowCards = document.querySelectorAll('.shadow-card');
    expect(shadowCards.length).toBeGreaterThan(3); // Primary + monthly + yearly + quick stats
  });

  it('should render all required icons', () => {
    render(<ROIMetrics />);

    // Check that icons are present by looking for SVG elements
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBe(3); // TrendingUp, Calendar, Target
  });

  it('should have proper grid layout for monthly/yearly stats', () => {
    render(<ROIMetrics />);

    // Check for responsive grid classes
    const gridContainer = document.querySelector('.grid-cols-1');
    expect(gridContainer).toBeInTheDocument();
  });

  it('should have proper grid layout for quick stats', () => {
    render(<ROIMetrics />);

    // Check for 3-column grid
    const quickStatsGrid = document.querySelector('.grid-cols-3');
    expect(quickStatsGrid).toBeInTheDocument();
  });

  it('should display success styling for positive changes', () => {
    render(<ROIMetrics />);

    const successTexts = screen.getAllByText(/\+18\.2%|\+67|\+87%/);
    expect(successTexts.length).toBeGreaterThan(0);
  });

  it('should display premium styling for premium metrics', () => {
    render(<ROIMetrics />);

    // Check for premium text color classes
    const premiumElements = document.querySelectorAll('.text-premium');
    expect(premiumElements.length).toBeGreaterThan(0);
  });

  it('should display primary styling for primary metrics', () => {
    render(<ROIMetrics />);

    // Check for primary text color classes
    const primaryElements = document.querySelectorAll('.text-primary');
    expect(primaryElements.length).toBeGreaterThan(0);
  });

  it('should have proper spacing and layout classes', () => {
    render(<ROIMetrics />);

    // Check for space-y classes
    const spacedContainer = document.querySelector('.space-y-4');
    expect(spacedContainer).toBeInTheDocument();
  });
});