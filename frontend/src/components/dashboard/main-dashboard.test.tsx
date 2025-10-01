import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainDashboard } from './main-dashboard';

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div data-testid="card" className={className} {...props}>{children}</div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div data-testid="card-content" className={className} {...props}>{children}</div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div data-testid="card-header" className={className} {...props}>{children}</div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <h3 data-testid="card-title" className={className} {...props}>{children}</h3>
  ),
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, className, ...props }: any) => (
    <div data-testid="alert" className={className} {...props}>{children}</div>
  ),
  AlertDescription: ({ children, ...props }: any) => (
    <div data-testid="alert-description" {...props}>{children}</div>
  ),
}));

// Mock child components
vi.mock('./roi-metrics', () => ({
  ROIMetrics: () => <div data-testid="roi-metrics">ROI Metrics Component</div>,
}));

vi.mock('./compact-goals', () => ({
  CompactGoals: () => <div data-testid="compact-goals">Compact Goals Component</div>,
}));

// Mock hero image
vi.mock('@/assets/hero-dashboard.jpg', () => ({
  default: '/mock-hero-dashboard.jpg',
}));

describe('MainDashboard Component', () => {
  describe('Layout and Structure', () => {
    it('should render without errors', () => {
      render(<MainDashboard />);
      expect(screen.getByTestId('roi-metrics')).toBeInTheDocument();
    });

    it('should render ROI Metrics component', () => {
      render(<MainDashboard />);
      expect(screen.getByTestId('roi-metrics')).toBeInTheDocument();
    });

    it('should render Compact Goals component', () => {
      render(<MainDashboard />);
      expect(screen.getByTestId('compact-goals')).toBeInTheDocument();
    });

    it('should have proper grid layout for top section', () => {
      const { container } = render(<MainDashboard />);
      const topGrid = container.querySelector('.grid.lg\\:grid-cols-3');
      expect(topGrid).toBeInTheDocument();
    });
  });

  describe('Proactive Alerts Section', () => {
    it('should render Proactive Alerts card', () => {
      render(<MainDashboard />);
      expect(screen.getByText('Proactive Alerts')).toBeInTheDocument();
    });

    it('should display Chase Ink spending limit alert', () => {
      render(<MainDashboard />);
      expect(screen.getAllByText(/Chase Ink/)[0]).toBeInTheDocument();
      expect(screen.getByText(/approaching the \$150k quarterly limit/)).toBeInTheDocument();
    });

    it('should display point expiration alert', () => {
      render(<MainDashboard />);
      expect(screen.getByText(/Point Expiration/)).toBeInTheDocument();
      expect(screen.getByText(/15,000 Delta SkyMiles expire in 45 days/)).toBeInTheDocument();
    });

    it('should display quarterly bonus activation reminder', () => {
      render(<MainDashboard />);
      expect(screen.getByText(/Quarterly Bonus/)).toBeInTheDocument();
      expect(screen.getByText(/activate your Q2 bonus categories/)).toBeInTheDocument();
    });

    it('should render all three alerts', () => {
      render(<MainDashboard />);
      const alerts = screen.getAllByTestId('alert');
      expect(alerts.length).toBeGreaterThanOrEqual(3);
    });

    it('should apply different styling to alert types', () => {
      render(<MainDashboard />);
      const alerts = screen.getAllByTestId('alert');
      
      // Check for different border classes indicating different alert types
      const alertClasses = alerts.map(alert => alert.className);
      expect(alertClasses.some(className => className.includes('border-premium'))).toBe(true);
      expect(alertClasses.some(className => className.includes('border-destructive'))).toBe(true);
      expect(alertClasses.some(className => className.includes('border-success'))).toBe(true);
    });
  });

  describe('Benefit Utilization Calendar', () => {
    it('should render calendar card', () => {
      render(<MainDashboard />);
      expect(screen.getByText("This Month's Actions")).toBeInTheDocument();
    });

    it('should display Q2 category activation task', () => {
      render(<MainDashboard />);
      expect(screen.getByText('Activate Q2 Categories')).toBeInTheDocument();
      expect(screen.getByText('Chase Freedom Flex')).toBeInTheDocument();
      expect(screen.getByText('Due: Apr 15')).toBeInTheDocument();
    });

    it('should display travel credit reminder', () => {
      render(<MainDashboard />);
      expect(screen.getByText('Use Travel Credit')).toBeInTheDocument();
      expect(screen.getByText('Chase Sapphire Reserve')).toBeInTheDocument();
      expect(screen.getByText('$300 available')).toBeInTheDocument();
    });

    it('should display optimal burn window notification', () => {
      render(<MainDashboard />);
      expect(screen.getByText('Optimal Burn Window')).toBeInTheDocument();
      expect(screen.getByText('Japan flights')).toBeInTheDocument();
      expect(screen.getByText('Book by May 1')).toBeInTheDocument();
    });

    it('should render all three calendar items', () => {
      render(<MainDashboard />);
      expect(screen.getByText('Activate Q2 Categories')).toBeInTheDocument();
      expect(screen.getByText('Use Travel Credit')).toBeInTheDocument();
      expect(screen.getByText('Optimal Burn Window')).toBeInTheDocument();
    });
  });

  describe('Recent Transactions', () => {
    it('should render Recent Transactions card', () => {
      render(<MainDashboard />);
      expect(screen.getByText('Recent Transactions & Optimization')).toBeInTheDocument();
    });

    it('should display Costco transaction', () => {
      render(<MainDashboard />);
      expect(screen.getByText('Costco Wholesale')).toBeInTheDocument();
      expect(screen.getByText('$387.65')).toBeInTheDocument();
      expect(screen.getByText('1,163 points')).toBeInTheDocument();
    });

    it('should display Shell Gas Station transaction', () => {
      render(<MainDashboard />);
      expect(screen.getByText('Shell Gas Station')).toBeInTheDocument();
      expect(screen.getByText('$45.20')).toBeInTheDocument();
      expect(screen.getByText('90 points')).toBeInTheDocument();
    });

    it('should display Amazon transaction', () => {
      render(<MainDashboard />);
      expect(screen.getByText('Amazon.com')).toBeInTheDocument();
      expect(screen.getByText('$156.99')).toBeInTheDocument();
      expect(screen.getByText('785 points')).toBeInTheDocument();
    });

    it('should show optimization feedback for Costco', () => {
      render(<MainDashboard />);
      expect(screen.getByText(/Optimal choice - 3x on office supplies/)).toBeInTheDocument();
    });

    it('should show optimization warning for Shell', () => {
      render(<MainDashboard />);
      expect(screen.getByText(/Could have earned 2x more with Chase Freedom/)).toBeInTheDocument();
    });

    it('should show optimization success for Amazon', () => {
      render(<MainDashboard />);
      expect(screen.getByText(/Perfect choice - 5x on Amazon purchases/)).toBeInTheDocument();
    });

    it('should display card used for each transaction', () => {
      render(<MainDashboard />);
      expect(screen.getByText('Chase Ink Business Preferred')).toBeInTheDocument();
      expect(screen.getByText('Chase Sapphire Preferred')).toBeInTheDocument();
      expect(screen.getByText('Amazon Prime Visa')).toBeInTheDocument();
    });
  });

  describe('Grid Layout', () => {
    it('should have responsive grid layout for alerts and calendar', () => {
      const { container } = render(<MainDashboard />);
      const grids = container.querySelectorAll('.grid');
      
      // Check that at least one grid has responsive classes
      const hasResponsiveGrid = Array.from(grids).some(grid => 
        grid.classList.contains('lg:grid-cols-2')
      );
      expect(hasResponsiveGrid).toBe(true);
    });

    it('should render ROI Metrics in 2/3 width column', () => {
      const { container } = render(<MainDashboard />);
      const roiSection = container.querySelector('.lg\\:col-span-2');
      expect(roiSection).toBeInTheDocument();
    });

    it('should render Compact Goals in 1/3 width column', () => {
      const { container } = render(<MainDashboard />);
      const goalsSection = container.querySelector('.lg\\:col-span-1');
      expect(goalsSection).toBeInTheDocument();
    });
  });

  describe('Styling and Visual Indicators', () => {
    it('should apply animation class to container', () => {
      const { container } = render(<MainDashboard />);
      const mainContainer = container.firstElementChild;
      expect(mainContainer).toHaveClass('animate-slide-up');
    });

    it('should apply shadow classes to cards', () => {
      render(<MainDashboard />);
      const cards = screen.getAllByTestId('card');
      
      const hasShadowCard = cards.some(card => 
        card.classList.contains('shadow-card')
      );
      expect(hasShadowCard).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<MainDashboard />);
      
      const titles = screen.getAllByTestId('card-title');
      expect(titles.length).toBeGreaterThan(0);
    });

    it('should provide descriptive text for all sections', () => {
      render(<MainDashboard />);
      
      expect(screen.getByText('Proactive Alerts')).toBeInTheDocument();
      expect(screen.getByText("This Month's Actions")).toBeInTheDocument();
      expect(screen.getByText('Recent Transactions & Optimization')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should format monetary values with dollar signs', () => {
      render(<MainDashboard />);
      
      const dollarValues = screen.getAllByText(/\$/);
      expect(dollarValues.length).toBeGreaterThan(0);
    });

    it('should display point values with commas', () => {
      render(<MainDashboard />);
      
      expect(screen.getByText('1,163 points')).toBeInTheDocument();
    });

    it('should show dates in readable format', () => {
      render(<MainDashboard />);
      
      expect(screen.getByText('Due: Apr 15')).toBeInTheDocument();
      expect(screen.getByText('Book by May 1')).toBeInTheDocument();
      expect(screen.getByText('Expires Dec 31')).toBeInTheDocument();
    });
  });

  describe('Alert Types and Priorities', () => {
    it('should display premium/warning alert styling', () => {
      render(<MainDashboard />);
      const alerts = screen.getAllByTestId('alert');
      const premiumAlert = alerts.find(alert => 
        alert.className.includes('border-premium')
      );
      expect(premiumAlert).toBeInTheDocument();
    });

    it('should display destructive/error alert styling', () => {
      render(<MainDashboard />);
      const alerts = screen.getAllByTestId('alert');
      const destructiveAlert = alerts.find(alert => 
        alert.className.includes('border-destructive')
      );
      expect(destructiveAlert).toBeInTheDocument();
    });

    it('should display success/positive alert styling', () => {
      render(<MainDashboard />);
      const alerts = screen.getAllByTestId('alert');
      const successAlert = alerts.find(alert => 
        alert.className.includes('border-success')
      );
      expect(successAlert).toBeInTheDocument();
    });
  });

  describe('Transaction Optimization Types', () => {
    it('should render success optimization type with correct styling', () => {
      const { container } = render(<MainDashboard />);
      const optimizationTexts = container.querySelectorAll('.text-success');
      expect(optimizationTexts.length).toBeGreaterThan(0);
    });

    it('should render warning optimization type with correct styling', () => {
      const { container } = render(<MainDashboard />);
      const optimizationTexts = container.querySelectorAll('.text-premium');
      expect(optimizationTexts.length).toBeGreaterThan(0);
    });
  });

  describe('Component Integration', () => {
    it('should render all main sections together', () => {
      render(<MainDashboard />);
      
      // Check all major sections are present
      expect(screen.getByTestId('roi-metrics')).toBeInTheDocument();
      expect(screen.getByTestId('compact-goals')).toBeInTheDocument();
      expect(screen.getByText('Proactive Alerts')).toBeInTheDocument();
      expect(screen.getByText("This Month's Actions")).toBeInTheDocument();
      expect(screen.getByText('Recent Transactions & Optimization')).toBeInTheDocument();
    });
  });
});
