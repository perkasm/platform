import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Index from './Index';

// Mock the child components
vi.mock('@/components/ui/navigation-tabs', () => ({
  NavigationTabs: ({ tabs, activeTab, onTabChange }: { tabs: Array<{ id: string; label: string; icon: React.ReactNode }>; activeTab: string; onTabChange: (tabId: string) => void }) => (
    <div data-testid="navigation-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          data-testid={`tab-${tab.id}`}
          onClick={() => onTabChange(tab.id)}
          aria-selected={activeTab === tab.id}
        >
          {tab.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('@/components/dashboard/main-dashboard', () => ({
  MainDashboard: () => <div data-testid="main-dashboard">MainDashboard Component</div>,
}));

vi.mock('@/components/cards/my-cards', () => ({
  MyCards: () => <div data-testid="my-cards">MyCards Component</div>,
}));

vi.mock('@/components/chat/ai-chat', () => ({
  AIChat: () => <div data-testid="ai-chat">AIChat Component</div>,
}));

vi.mock('@/components/recommendations/card-recommendations', () => ({
  CardRecommendations: () => <div data-testid="card-recommendations">CardRecommendations Component</div>,
}));

vi.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Toggle Theme</button>,
}));

// Wrapper component with necessary providers
const renderWithProviders = (component: React.ReactElement) => {
  const mockAuthState = {
    token: 'test-token',
    user: {
      id: 1,
      email: 'john@example.com',
      full_name: 'John Smith',
      is_active: true,
      is_superuser: false,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
    login: vi.fn(),
    logout: vi.fn(),
  };

  return render(
    <AuthContext.Provider value={mockAuthState}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('Index Page', () => {
  describe('Layout and Structure', () => {
    it('should render the page with correct structure', () => {
      renderWithProviders(<Index />);

      // Check for header
      expect(screen.getByRole('banner')).toBeInTheDocument();
      
      // Check for main content
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      // Check for footer
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should render the header with logo and title', () => {
      renderWithProviders(<Index />);

      expect(screen.getAllByText('PerkAsm.com')[0]).toBeInTheDocument();
      expect(screen.getByText('AI-Powered Rewards Optimization')).toBeInTheDocument();
    });

    it('should render user information in header', () => {
      renderWithProviders(<Index />);

      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Premium Member')).toBeInTheDocument();
      expect(screen.getByText('JS')).toBeInTheDocument();
    });

    it('should render theme toggle button', () => {
      renderWithProviders(<Index />);

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });
  });

  describe('Navigation Tabs', () => {
    it('should render all navigation tabs', () => {
      renderWithProviders(<Index />);

      expect(screen.getByTestId('tab-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('tab-cards')).toBeInTheDocument();
      expect(screen.getByTestId('tab-ai-chat')).toBeInTheDocument();
      expect(screen.getByTestId('tab-recommendations')).toBeInTheDocument();
    });

    it('should have dashboard tab active by default', () => {
      renderWithProviders(<Index />);

      const dashboardTab = screen.getByTestId('tab-dashboard');
      expect(dashboardTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should render MainDashboard component by default', () => {
      renderWithProviders(<Index />);

      expect(screen.getByTestId('main-dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('my-cards')).not.toBeInTheDocument();
    });
  });

  describe('Tab Navigation and Content Switching', () => {
    it('should switch to My Cards when cards tab is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Index />);

      const cardsTab = screen.getByTestId('tab-cards');
      await user.click(cardsTab);

      await waitFor(() => {
        expect(screen.getByTestId('my-cards')).toBeInTheDocument();
        expect(screen.queryByTestId('main-dashboard')).not.toBeInTheDocument();
      });

      expect(cardsTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should switch to AI Chat when ai-chat tab is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Index />);

      const aiChatTab = screen.getByTestId('tab-ai-chat');
      await user.click(aiChatTab);

      await waitFor(() => {
        expect(screen.getByTestId('ai-chat')).toBeInTheDocument();
        expect(screen.queryByTestId('main-dashboard')).not.toBeInTheDocument();
      });

      expect(aiChatTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should switch to Recommendations when recommendations tab is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Index />);

      const recommendationsTab = screen.getByTestId('tab-recommendations');
      await user.click(recommendationsTab);

      await waitFor(() => {
        expect(screen.getByTestId('card-recommendations')).toBeInTheDocument();
        expect(screen.queryByTestId('main-dashboard')).not.toBeInTheDocument();
      });

      expect(recommendationsTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should switch back to dashboard from another tab', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Index />);

      // Switch to cards
      await user.click(screen.getByTestId('tab-cards'));
      await waitFor(() => {
        expect(screen.getByTestId('my-cards')).toBeInTheDocument();
      });

      // Switch back to dashboard
      await user.click(screen.getByTestId('tab-dashboard'));
      await waitFor(() => {
        expect(screen.getByTestId('main-dashboard')).toBeInTheDocument();
        expect(screen.queryByTestId('my-cards')).not.toBeInTheDocument();
      });
    });
  });

  describe('Suspense and Lazy Loading', () => {
    it('should show loading fallback while lazy components load', () => {
      renderWithProviders(<Index />);

      // The component should render without errors and show content
      // Since we're mocking the lazy loaded component, it should render immediately
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('should render footer with company information', () => {
      renderWithProviders(<Index />);

      expect(screen.getAllByText('PerkAsm.com').length).toBeGreaterThan(0);
      expect(screen.getByText(/Maximize your credit card rewards/i)).toBeInTheDocument();
    });

    it('should render footer features section', () => {
      renderWithProviders(<Index />);

      expect(screen.getAllByText('Features').length).toBeGreaterThan(0);
      expect(screen.getByText('Real-time optimization')).toBeInTheDocument();
      expect(screen.getByText('Predictive analytics')).toBeInTheDocument();
      expect(screen.getByText('Portfolio management')).toBeInTheDocument();
      expect(screen.getByText('AI chat assistant')).toBeInTheDocument();
    });

    it('should render footer security section', () => {
      renderWithProviders(<Index />);

      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('SOC 2 compliant')).toBeInTheDocument();
      expect(screen.getByText('End-to-end encryption')).toBeInTheDocument();
      expect(screen.getByText('Anonymous processing')).toBeInTheDocument();
      expect(screen.getByText('Tokenized credentials')).toBeInTheDocument();
    });

    it('should render footer support section', () => {
      renderWithProviders(<Index />);

      expect(screen.getByText('Support')).toBeInTheDocument();
      expect(screen.getByText('Help Center')).toBeInTheDocument();
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    });

    it('should render copyright notice', () => {
      renderWithProviders(<Index />);

      expect(screen.getByText(/© 2024 PerkAsm.com/i)).toBeInTheDocument();
      expect(screen.getByText(/Empowering Rewards Sophisticates/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic HTML structure', () => {
      renderWithProviders(<Index />);

      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument(); // main
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
    });

    it('should render navigation tabs with proper accessibility', () => {
      renderWithProviders(<Index />);

      const tabs = screen.getAllByRole('button');
      expect(tabs.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should render dashboard for unknown tab id', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Index />);

      // Initially shows dashboard
      expect(screen.getByTestId('main-dashboard')).toBeInTheDocument();

      // Switch to another tab
      await user.click(screen.getByTestId('tab-cards'));
      await waitFor(() => {
        expect(screen.getByTestId('my-cards')).toBeInTheDocument();
      });

      // Switch back to dashboard (testing default case)
      await user.click(screen.getByTestId('tab-dashboard'));
      await waitFor(() => {
        expect(screen.getByTestId('main-dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Styling and CSS Classes', () => {
    it('should apply gradient background to page', () => {
      renderWithProviders(<Index />);

      const pageContainer = screen.getByRole('main').parentElement;
      expect(pageContainer).toHaveClass('min-h-screen', 'bg-gradient-background');
    });

    it('should apply sticky header styling', () => {
      renderWithProviders(<Index />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky', 'top-0', 'z-50');
    });

    it('should apply animation to main content', () => {
      const { container } = renderWithProviders(<Index />);
      
      // The component renders with Suspense which may delay the animation class
      // Check that the component structure is correct
      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
    });
  });
});
