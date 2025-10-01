import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('should render badge with children', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should render badge without children', () => {
      const { container } = render(<Badge />);
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should render badge with text content', () => {
      render(<Badge>Badge Text</Badge>);
      expect(screen.getByText('Badge Text')).toBeInTheDocument();
    });

    it('should render badge with number', () => {
      render(<Badge>42</Badge>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Badge className="custom-badge" data-testid="badge">Text</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('custom-badge');
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<Badge variant="default" data-testid="badge">Default</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('border-transparent', 'bg-primary', 'text-primary-foreground');
    });

    it('should render secondary variant', () => {
      render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('border-transparent', 'bg-secondary', 'text-secondary-foreground');
    });

    it('should render destructive variant', () => {
      render(<Badge variant="destructive" data-testid="badge">Error</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('border-transparent', 'bg-destructive', 'text-destructive-foreground');
    });

    it('should render outline variant', () => {
      render(<Badge variant="outline" data-testid="badge">Outline</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('text-foreground');
    });

    it('should use default variant when not specified', () => {
      render(<Badge data-testid="badge">Default</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-primary');
    });

    it('should handle undefined variant', () => {
      render(<Badge variant={undefined} data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-primary');
    });
  });

  describe('Base Styles', () => {
    it('should have inline-flex display', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('inline-flex');
    });

    it('should have items-center alignment', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('items-center');
    });

    it('should have rounded-full corners', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('rounded-full');
    });

    it('should have border', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('border');
    });

    it('should have padding', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('px-2.5', 'py-0.5');
    });

    it('should have text styles', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('text-xs', 'font-semibold');
    });

    it('should have transition styles', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('transition-colors');
    });

    it('should have focus styles', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-ring', 'focus:ring-offset-2');
    });
  });

  describe('Content Rendering', () => {
    it('should render with icon and text', () => {
      render(
        <Badge>
          <svg data-testid="icon" />
          Premium
        </Badge>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('should render with only icon', () => {
      render(
        <Badge>
          <svg data-testid="icon" aria-label="Star" />
        </Badge>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('should render with multiple children', () => {
      render(
        <Badge>
          <span>Count:</span>
          <span>5</span>
        </Badge>
      );
      expect(screen.getByText('Count:')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should handle long text', () => {
      const longText = 'This is a very long badge text';
      render(<Badge>{longText}</Badge>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      render(<Badge>!@#$%^&*()</Badge>);
      expect(screen.getByText('!@#$%^&*()')).toBeInTheDocument();
    });
  });

  describe('HTML Attributes', () => {
    it('should support id attribute', () => {
      render(<Badge id="my-badge">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveAttribute('id', 'my-badge');
    });

    it('should support data attributes', () => {
      render(<Badge data-testid="custom" data-value="test">Badge</Badge>);
      const badge = screen.getByTestId('custom');
      expect(badge).toHaveAttribute('data-value', 'test');
    });

    it('should support role attribute', () => {
      render(<Badge role="status">Online</Badge>);
      const badge = screen.getByText('Online');
      expect(badge).toHaveAttribute('role', 'status');
    });

    it('should support title attribute', () => {
      render(<Badge title="Badge tooltip">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveAttribute('title', 'Badge tooltip');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Badge aria-label="Status badge">New</Badge>);
      const badge = screen.getByText('New');
      expect(badge).toHaveAttribute('aria-label', 'Status badge');
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Badge aria-describedby="badge-desc">Badge</Badge>
          <div id="badge-desc">Badge description</div>
        </>
      );
      const badge = screen.getByText('Badge');
      expect(badge).toHaveAttribute('aria-describedby', 'badge-desc');
    });

    it('should support aria-live for dynamic updates', () => {
      render(<Badge aria-live="polite">5</Badge>);
      const badge = screen.getByText('5');
      expect(badge).toHaveAttribute('aria-live', 'polite');
    });

    it('should be keyboard focusable when needed', () => {
      render(<Badge tabIndex={0}>Focusable</Badge>);
      const badge = screen.getByText('Focusable');
      expect(badge).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Style Customization', () => {
    it('should merge custom classes with base classes', () => {
      render(<Badge className="bg-blue-500" data-testid="badge">Custom</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-blue-500', 'inline-flex', 'rounded-full');
    });

    it('should allow variant with custom className', () => {
      render(
        <Badge variant="destructive" className="uppercase" data-testid="badge">
          Error
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('uppercase', 'bg-destructive');
    });

    it('should handle multiple custom classes', () => {
      render(<Badge className="mt-2 ml-4 shadow-lg" data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('mt-2', 'ml-4', 'shadow-lg');
    });
  });

  describe('Multiple Badges', () => {
    it('should render multiple badges', () => {
      render(
        <>
          <Badge>Badge 1</Badge>
          <Badge>Badge 2</Badge>
          <Badge>Badge 3</Badge>
        </>
      );
      expect(screen.getByText('Badge 1')).toBeInTheDocument();
      expect(screen.getByText('Badge 2')).toBeInTheDocument();
      expect(screen.getByText('Badge 3')).toBeInTheDocument();
    });

    it('should render badges with different variants', () => {
      render(
        <>
          <Badge variant="default" data-testid="badge1">Default</Badge>
          <Badge variant="secondary" data-testid="badge2">Secondary</Badge>
          <Badge variant="destructive" data-testid="badge3">Error</Badge>
        </>
      );
      expect(screen.getByTestId('badge1')).toHaveClass('bg-primary');
      expect(screen.getByTestId('badge2')).toHaveClass('bg-secondary');
      expect(screen.getByTestId('badge3')).toHaveClass('bg-destructive');
    });
  });

  describe('Common Use Cases', () => {
    it('should render notification badge', () => {
      render(<Badge variant="destructive">3</Badge>);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render status badge', () => {
      render(<Badge variant="secondary">Active</Badge>);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render category badge', () => {
      render(<Badge variant="outline">Technology</Badge>);
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    it('should render premium badge', () => {
      render(<Badge variant="default">PRO</Badge>);
      expect(screen.getByText('PRO')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const { container } = render(<Badge />);
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should handle null className', () => {
      render(<Badge className={null as any}>Badge</Badge>);
      expect(screen.getByText('Badge')).toBeInTheDocument();
    });

    it('should handle undefined className', () => {
      render(<Badge className={undefined}>Badge</Badge>);
      expect(screen.getByText('Badge')).toBeInTheDocument();
    });

    it('should handle zero as content', () => {
      render(<Badge>0</Badge>);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle boolean false as content', () => {
      render(<Badge>{false}</Badge>);
      const { container } = render(<Badge>{false}</Badge>);
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should handle whitespace content', () => {
      const { container } = render(<Badge>   </Badge>);
      const badge = container.querySelector('div');
      expect(badge).toBeInTheDocument();
      expect(badge?.textContent).toBe('   ');
    });
  });
});
