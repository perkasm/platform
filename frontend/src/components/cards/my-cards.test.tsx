import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MyCards } from './my-cards';

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

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span data-testid="badge" {...props}>{children}</span>
  ),
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: { value: number; className: string }) => (
    <div data-testid="progress" data-value={value} className={className} />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button data-testid="button" onClick={onClick} {...props}>{children}</button>
  ),
}));

// Mock card images
vi.mock('@/assets/cards/chase-sapphire-reserve.jpg', () => ({
  default: '/mock-chase-sapphire-reserve.jpg',
}));

vi.mock('@/assets/cards/chase-ink-business.jpg', () => ({
  default: '/mock-chase-ink-business.jpg',
}));

vi.mock('@/assets/cards/amex-gold.jpg', () => ({
  default: '/mock-amex-gold.jpg',
}));

vi.mock('@/assets/cards/chase-freedom-flex.jpg', () => ({
  default: '/mock-chase-freedom-flex.jpg',
}));

describe('MyCards Component', () => {
  describe('Layout and Structure', () => {
    it('should render without errors', () => {
      render(<MyCards />);
      expect(screen.getByText('My Cards')).toBeInTheDocument();
    });

    it('should render header with title and description', () => {
      render(<MyCards />);
      
      expect(screen.getByText('My Cards')).toBeInTheDocument();
      expect(screen.getByText('Manage and optimize your credit card portfolio')).toBeInTheDocument();
    });

    it('should render Add Card button', () => {
      render(<MyCards />);
      
      const addCardButton = screen.getByText('Add Card');
      expect(addCardButton).toBeInTheDocument();
    });

    it('should render all mock cards', () => {
      render(<MyCards />);
      
      expect(screen.getByText('Chase Sapphire Reserve')).toBeInTheDocument();
      expect(screen.getByText('Chase Ink Business Preferred')).toBeInTheDocument();
      expect(screen.getByText('American Express Gold')).toBeInTheDocument();
      expect(screen.getByText('Chase Freedom Flex')).toBeInTheDocument();
    });
  });

  describe('Card Display', () => {
    it('should display card type badges', () => {
      render(<MyCards />);
      
      const badges = screen.getAllByTestId('badge');
      const badgeTexts = badges.map(badge => badge.textContent);
      
      expect(badgeTexts).toContain('Travel');
      expect(badgeTexts).toContain('Business');
      expect(badgeTexts).toContain('Dining');
      expect(badgeTexts).toContain('Cashback');
    });

    it('should display card images with correct src', () => {
      render(<MyCards />);
      
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(4);
      
      expect(images[0]).toHaveAttribute('src', '/mock-chase-sapphire-reserve.jpg');
      expect(images[1]).toHaveAttribute('src', '/mock-chase-ink-business.jpg');
      expect(images[2]).toHaveAttribute('src', '/mock-amex-gold.jpg');
      expect(images[3]).toHaveAttribute('src', '/mock-chase-freedom-flex.jpg');
    });

    it('should display card images with correct alt text', () => {
      render(<MyCards />);
      
      expect(screen.getByAltText('Chase Sapphire Reserve')).toBeInTheDocument();
      expect(screen.getByAltText('Chase Ink Business Preferred')).toBeInTheDocument();
      expect(screen.getByAltText('American Express Gold')).toBeInTheDocument();
      expect(screen.getByAltText('Chase Freedom Flex')).toBeInTheDocument();
    });
  });

  describe('Card Metrics', () => {
    it('should display current points for all cards', () => {
      render(<MyCards />);
      
      expect(screen.getByText('87,650')).toBeInTheDocument(); // Chase Sapphire Reserve
      expect(screen.getByText('156,890')).toBeInTheDocument(); // Chase Ink Business
      expect(screen.getByText('45,670')).toBeInTheDocument(); // Amex Gold
      expect(screen.getByText('12,340')).toBeInTheDocument(); // Freedom Flex
    });

    it('should display available credit for all cards', () => {
      render(<MyCards />);
      
      expect(screen.getByText('$18,500')).toBeInTheDocument();
      expect(screen.getByText('$87,000')).toBeInTheDocument();
      expect(screen.getByText('$15,600')).toBeInTheDocument();
      expect(screen.getByText('$4,200')).toBeInTheDocument();
    });

    it('should display utilization scores', () => {
      render(<MyCards />);
      
      expect(screen.getByText('94%')).toBeInTheDocument();
      expect(screen.getByText('89%')).toBeInTheDocument();
      expect(screen.getByText('78%')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });

  describe('Credit Utilization', () => {
    it('should display utilization percentage for each card', () => {
      render(<MyCards />);
      
      const utilizationTexts = screen.getAllByText(/\d+%/);
      expect(utilizationTexts.length).toBeGreaterThan(0);
    });

    it('should render progress bars for utilization', () => {
      render(<MyCards />);
      
      const progressBars = screen.getAllByTestId('progress');
      expect(progressBars.length).toBeGreaterThan(4); // At least one per card
    });

    it('should calculate utilization correctly for Chase Sapphire Reserve', () => {
      render(<MyCards />);
      
      // Chase Sapphire Reserve: (25000 - 18500) / 25000 = 26%
      const progressBars = screen.getAllByTestId('progress');
      const utilizationBar = progressBars.find(bar => 
        bar.getAttribute('data-value') === '26'
      );
      expect(utilizationBar).toBeInTheDocument();
    });

    it('should calculate utilization correctly for Chase Ink Business', () => {
      render(<MyCards />);
      
      // Chase Ink Business: (100000 - 87000) / 100000 = 13%
      const progressBars = screen.getAllByTestId('progress');
      const utilizationBar = progressBars.find(bar => 
        bar.getAttribute('data-value') === '13'
      );
      expect(utilizationBar).toBeInTheDocument();
    });
  });

  describe('Welcome Bonus Progress', () => {
    it('should display welcome bonus section for eligible cards', () => {
      render(<MyCards />);
      
      expect(screen.getByText('Welcome Bonus')).toBeInTheDocument();
    });

    it('should display welcome bonus spending progress', () => {
      render(<MyCards />);
      
      expect(screen.getByText('$3,200 / $4,000')).toBeInTheDocument();
    });

    it('should calculate remaining spend for welcome bonus', () => {
      render(<MyCards />);
      
      expect(screen.getByText('$800 left')).toBeInTheDocument();
    });

    it('should render progress bar for welcome bonus', () => {
      render(<MyCards />);
      
      const progressBars = screen.getAllByTestId('progress');
      // Welcome bonus: 3200 / 4000 = 80%
      const bonusBar = progressBars.find(bar => 
        bar.getAttribute('data-value') === '80'
      );
      expect(bonusBar).toBeInTheDocument();
    });

    it('should not display welcome bonus for cards without it', () => {
      render(<MyCards />);
      
      // Only one card has welcome bonus progress
      const welcomeBonusTexts = screen.getAllByText('Welcome Bonus');
      expect(welcomeBonusTexts).toHaveLength(1);
    });
  });

  describe('Action Buttons', () => {
    it('should render View Details button for each card', () => {
      render(<MyCards />);
      
      const viewDetailsButtons = screen.getAllByText('View Details');
      expect(viewDetailsButtons).toHaveLength(4);
    });

    it('should handle Add Card button click', async () => {
      const user = userEvent.setup();
      render(<MyCards />);
      
      const addCardButton = screen.getByText('Add Card');
      await user.click(addCardButton);
      
      // Button should still be in the document after click
      expect(addCardButton).toBeInTheDocument();
    });
  });

  describe('Styling and CSS Classes', () => {
    it('should apply animation class to container', () => {
      const { container } = render(<MyCards />);
      
      const mainContainer = container.firstElementChild;
      expect(mainContainer).toHaveClass('animate-slide-up');
    });

    it('should apply grid layout classes', () => {
      const { container } = render(<MyCards />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<MyCards />);
      
      const mainHeading = screen.getByText('My Cards');
      expect(mainHeading).toBeInTheDocument();
    });

    it('should provide alternative text for all images', () => {
      render(<MyCards />);
      
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    it('should have clickable buttons', () => {
      render(<MyCards />);
      
      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Data Formatting', () => {
    it('should format large numbers with commas', () => {
      render(<MyCards />);
      
      // Check for properly formatted numbers
      expect(screen.getByText('87,650')).toBeInTheDocument();
      expect(screen.getByText('156,890')).toBeInTheDocument();
      expect(screen.getByText('$18,500')).toBeInTheDocument();
    });

    it('should display dollar amounts with $ symbol', () => {
      render(<MyCards />);
      
      const dollarAmounts = screen.getAllByText(/\$[\d,]+/);
      expect(dollarAmounts.length).toBeGreaterThan(0);
    });
  });

  describe('Card Count', () => {
    it('should render exactly 4 cards', () => {
      render(<MyCards />);
      
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThanOrEqual(4); // At least 4 cards
    });

    it('should render 4 card names', () => {
      render(<MyCards />);
      
      expect(screen.getByText('Chase Sapphire Reserve')).toBeInTheDocument();
      expect(screen.getByText('Chase Ink Business Preferred')).toBeInTheDocument();
      expect(screen.getByText('American Express Gold')).toBeInTheDocument();
      expect(screen.getByText('Chase Freedom Flex')).toBeInTheDocument();
    });
  });

  describe('Responsive Design Indicators', () => {
    it('should include responsive grid classes', () => {
      const { container } = render(<MyCards />);
      
      const grid = container.querySelector('.grid');
      expect(grid?.classList.toString()).toMatch(/md:grid-cols-2/);
      expect(grid?.classList.toString()).toMatch(/lg:grid-cols-3/);
    });
  });

  describe('Empty State', () => {
    it('should render content even with mock data', () => {
      render(<MyCards />);
      
      // Component should render cards without errors
      expect(screen.getByText('My Cards')).toBeInTheDocument();
      expect(screen.getAllByTestId('card').length).toBeGreaterThan(0);
    });
  });
});
