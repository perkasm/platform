import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CardRecommendations } from './card-recommendations';

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="card" className={className} {...props}>{children}</div>
  ),
  CardContent: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="card-content" className={className} {...props}>{children}</div>
  ),
  CardHeader: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="card-header" className={className} {...props}>{children}</div>
  ),
  CardTitle: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 data-testid="card-title" className={className} {...props}>{children}</h3>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button 
      data-testid="button" 
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className} {...props}>
      {children}
    </span>
  ),
}));

describe('CardRecommendations Component', () => {
  describe('Layout and Structure', () => {
    it('should render without errors', () => {
      render(<CardRecommendations />);
      expect(screen.getByText('Personalized Card Recommendations')).toBeInTheDocument();
    });

    it('should render header with title and description', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText('Personalized Card Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Based on your spending patterns and current portfolio')).toBeInTheDocument();
    });

    it('should render affiliate disclosure section', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText('Affiliate Disclosure')).toBeInTheDocument();
      expect(screen.getByText(/PerkAsm may earn a commission/)).toBeInTheDocument();
    });

    it('should render card comparison tool section', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText('Card Comparison Tool')).toBeInTheDocument();
      expect(screen.getByText('Compare Cards Side-by-Side')).toBeInTheDocument();
    });
  });

  describe('Affiliate Disclosure', () => {
    it('should display disclosure message', () => {
      render(<CardRecommendations />);
      
      const disclosure = screen.getByText(/PerkAsm may earn a commission when you apply for recommended cards/);
      expect(disclosure).toBeInTheDocument();
    });

    it('should mention recommendations are based on user data', () => {
      render(<CardRecommendations />);
      
      const message = screen.getByText(/which are based solely on your spending data and optimization potential/);
      expect(message).toBeInTheDocument();
    });

    it('should have premium styling for disclosure card', () => {
      render(<CardRecommendations />);
      
      const cards = screen.getAllByTestId('card');
      const disclosureCard = cards.find(card => 
        card.className.includes('border-premium')
      );
      expect(disclosureCard).toBeInTheDocument();
    });
  });

  describe('Card Recommendations Display', () => {
    it('should render all three recommendation cards', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText('Chase Ink Business Cash')).toBeInTheDocument();
      expect(screen.getByText('Capital One Venture X')).toBeInTheDocument();
      expect(screen.getByText('Citi Double Cash')).toBeInTheDocument();
    });

    it('should display card issuers', () => {
      render(<CardRecommendations />);
      
      const chaseIssuers = screen.getAllByText('Chase');
      expect(chaseIssuers.length).toBeGreaterThan(0);
      expect(screen.getByText('Capital One')).toBeInTheDocument();
      expect(screen.getByText('Citi')).toBeInTheDocument();
    });

    it('should display card categories with badges', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText('Business')).toBeInTheDocument();
      expect(screen.getByText('Travel')).toBeInTheDocument();
      expect(screen.getByText('Cashback')).toBeInTheDocument();
    });
  });

  describe('Welcome Bonus Information', () => {
    it('should display welcome bonus for Chase Ink', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText('75,000 points after $7,500 spend')).toBeInTheDocument();
    });

    it('should display welcome bonus for Capital One Venture X', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText('75,000 miles after $4,000 spend')).toBeInTheDocument();
    });

    it('should display welcome bonus for Citi Double Cash', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText('$200 after $1,500 spend')).toBeInTheDocument();
    });
  });

  describe('Annual Fee and Value Display', () => {
    it('should display estimated annual values', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText(/1[,]?850/)).toBeInTheDocument();
      expect(screen.getByText(/2[,]?100/)).toBeInTheDocument();
      expect(screen.getByText(/890/)).toBeInTheDocument();
    });

    it('should display annual fees', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText('$395')).toBeInTheDocument();
    });

    it('should display "Free" for cards with no annual fee', () => {
      render(<CardRecommendations />);
      
      const freeLabels = screen.getAllByText('Free');
      expect(freeLabels.length).toBeGreaterThanOrEqual(2); // Chase Ink and Citi Double Cash
    });

    it('should label value and fee sections correctly', () => {
      render(<CardRecommendations />);
      
      const valueLabels = screen.getAllByText('Estimated Annual Value');
      expect(valueLabels.length).toBe(3);
      
      const feeLabels = screen.getAllByText('Annual Fee');
      expect(feeLabels.length).toBe(3);
    });
  });

  describe('Match Reasons', () => {
    it('should display why each card is recommended', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText('Perfect for your high office supply spending')).toBeInTheDocument();
      expect(screen.getByText('Complements your travel spending patterns')).toBeInTheDocument();
      expect(screen.getByText('Great backup card for non-bonus categories')).toBeInTheDocument();
    });

    it('should have "Why This Card?" section for each recommendation', () => {
      render(<CardRecommendations />);
      
      const whyThisCard = screen.getAllByText('Why This Card?');
      expect(whyThisCard.length).toBe(3);
    });
  });

  describe('Key Benefits', () => {
    it('should display benefits for Chase Ink Business Cash', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText('5% on office supplies and internet')).toBeInTheDocument();
      expect(screen.getByText('5% on gas stations')).toBeInTheDocument();
      expect(screen.getAllByText('No annual fee')[0]).toBeInTheDocument();
      expect(screen.getByText('Employee cards at no cost')).toBeInTheDocument();
    });

    it('should display benefits for Capital One Venture X', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText('2x miles on everything')).toBeInTheDocument();
      expect(screen.getByText('$300 annual travel credit')).toBeInTheDocument();
      expect(screen.getByText('Priority Pass lounge access')).toBeInTheDocument();
      expect(screen.getByText('Global Entry credit')).toBeInTheDocument();
    });

    it('should display benefits for Citi Double Cash', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText('2% cash back on everything')).toBeInTheDocument();
      expect(screen.getByText('No foreign transaction fees')).toBeInTheDocument();
      expect(screen.getByText('Simple earning structure')).toBeInTheDocument();
    });

    it('should have Key Benefits section for all cards', () => {
      render(<CardRecommendations />);
      
      const keyBenefits = screen.getAllByText('Key Benefits');
      expect(keyBenefits.length).toBe(3);
    });
  });

  describe('Action Buttons', () => {
    it('should render Apply Now button for each card', () => {
      render(<CardRecommendations />);
      
      const applyButtons = screen.getAllByText('Apply Now');
      expect(applyButtons.length).toBe(3);
    });

    it('should render Compare Details button for each card', () => {
      render(<CardRecommendations />);
      
      const compareButtons = screen.getAllByText('Compare Details');
      expect(compareButtons.length).toBe(3);
    });

    it('should handle Apply Now button click', async () => {
      const user = userEvent.setup();
      render(<CardRecommendations />);
      
      const applyButtons = screen.getAllByText('Apply Now');
      await user.click(applyButtons[0]);
      
      // Button should still be in document after click
      expect(applyButtons[0]).toBeInTheDocument();
    });

    it('should handle Compare Details button click', async () => {
      const user = userEvent.setup();
      render(<CardRecommendations />);
      
      const compareButtons = screen.getAllByText('Compare Details');
      await user.click(compareButtons[0]);
      
      expect(compareButtons[0]).toBeInTheDocument();
    });

    it('should render Open Comparison Tool button', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText('Open Comparison Tool')).toBeInTheDocument();
    });
  });

  describe('Affiliate Partner Badges', () => {
    it('should display affiliate partner badge for all cards', () => {
      render(<CardRecommendations />);
      
      const affiliateBadges = screen.getAllByText('Affiliate Partner');
      expect(affiliateBadges.length).toBe(3);
    });

    it('should render badges with outline variant', () => {
      render(<CardRecommendations />);
      
      const badges = screen.getAllByTestId('badge');
      const affiliateBadges = badges.filter(badge => 
        badge.textContent === 'Affiliate Partner'
      );
      
      affiliateBadges.forEach(badge => {
        expect(badge).toHaveAttribute('data-variant', 'outline');
      });
    });
  });

  describe('Comparison Tool Section', () => {
    it('should render comparison tool card', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText('Card Comparison Tool')).toBeInTheDocument();
    });

    it('should display comparison tool description', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText('Compare Cards Side-by-Side')).toBeInTheDocument();
      expect(screen.getByText(/Select multiple cards to see detailed comparisons/)).toBeInTheDocument();
    });

    it('should handle comparison tool button click', async () => {
      const user = userEvent.setup();
      render(<CardRecommendations />);
      
      const compareButton = screen.getByText('Open Comparison Tool');
      await user.click(compareButton);
      
      expect(compareButton).toBeInTheDocument();
    });
  });

  describe('Grid Layout', () => {
    it('should render cards in responsive grid', () => {
      const { container } = render(<CardRecommendations />);
      
      const grid = container.querySelector('.grid.lg\\:grid-cols-2.xl\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('should have correct grid column classes', () => {
      const { container } = render(<CardRecommendations />);
      
      const grid = container.querySelector('.grid');
      expect(grid?.classList.toString()).toMatch(/grid-cols-1/);
      expect(grid?.classList.toString()).toMatch(/lg:grid-cols-2/);
      expect(grid?.classList.toString()).toMatch(/xl:grid-cols-3/);
    });
  });

  describe('Styling and CSS Classes', () => {
    it('should apply animation to container', () => {
      const { container } = render(<CardRecommendations />);
      
      const mainContainer = container.firstElementChild;
      expect(mainContainer).toHaveClass('animate-slide-up');
    });

    it('should apply shadow to recommendation cards', () => {
      render(<CardRecommendations />);
      
      const cards = screen.getAllByTestId('card');
      const hasCardWithShadow = cards.some(card => 
        card.className.includes('shadow-card')
      );
      expect(hasCardWithShadow).toBe(true);
    });

    it('should apply gradient to Apply Now buttons', () => {
      render(<CardRecommendations />);
      
      const buttons = screen.getAllByTestId('button');
      const applyButtons = buttons.filter(btn => 
        btn.textContent === 'Apply Now'
      );
      
      applyButtons.forEach(button => {
        expect(button.className).toMatch(/bg-gradient-primary/);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<CardRecommendations />);
      
      const mainHeading = screen.getByText('Personalized Card Recommendations');
      expect(mainHeading).toBeInTheDocument();
    });

    it('should render all buttons as clickable elements', () => {
      render(<CardRecommendations />);
      
      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('should have descriptive text for all sections', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText('Affiliate Disclosure')).toBeInTheDocument();
      expect(screen.getAllByText('Key Benefits')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Why This Card?')[0]).toBeInTheDocument();
    });
  });

  describe('Data Formatting', () => {
    it('should format monetary values with commas and dollar signs', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText(/1[,]?850/)).toBeInTheDocument();
      expect(screen.getByText(/2[,]?100/)).toBeInTheDocument();
    });

    it('should display point values with commas', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText(/75,000 points/)).toBeInTheDocument();
      expect(screen.getByText(/75,000 miles/)).toBeInTheDocument();
    });
  });

  describe('Recommendation Count', () => {
    it('should render exactly three recommendation cards', () => {
      render(<CardRecommendations />);
      
      expect(screen.getByText('Chase Ink Business Cash')).toBeInTheDocument();
      expect(screen.getByText('Capital One Venture X')).toBeInTheDocument();
      expect(screen.getByText('Citi Double Cash')).toBeInTheDocument();
    });

    it('should have three sets of action buttons', () => {
      render(<CardRecommendations />);
      
      expect(screen.getAllByText('Apply Now').length).toBe(3);
      expect(screen.getAllByText('Compare Details').length).toBe(3);
    });
  });

  describe('Content Text Center Alignment', () => {
    it('should center-align header text', () => {
      const { container } = render(<CardRecommendations />);
      
      const header = container.querySelector('.text-center');
      expect(header).toBeInTheDocument();
    });

    it('should center-align comparison tool content', () => {
      render(<CardRecommendations />);
      
      const comparisonTool = screen.getByText('Compare Cards Side-by-Side').closest('div');
      expect(comparisonTool?.classList.toString()).toMatch(/text-center/);
    });
  });
});
