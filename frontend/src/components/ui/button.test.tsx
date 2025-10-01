import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from './button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render button with children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should render button without children', () => {
      render(<Button aria-label="Empty button" />);
      expect(screen.getByRole('button', { name: 'Empty button' })).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<Button variant="default">Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('should render destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground');
    });

    it('should render outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'border-input', 'bg-background');
    });

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('should render link variant', () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-primary', 'underline-offset-4');
    });
  });

  describe('Sizes', () => {
    it('should render default size', () => {
      render(<Button size="default">Default Size</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'px-4', 'py-2');
    });

    it('should render small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9', 'px-3');
    });

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11', 'px-8');
    });

    it('should render icon size', () => {
      render(<Button size="icon" aria-label="Icon button">⚙</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'w-10');
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('should not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      const button = screen.getByRole('button');
      
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should apply disabled pointer events', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:pointer-events-none');
    });
  });

  describe('Click Handlers', () => {
    it('should call onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should pass event to onClick handler', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      
      await user.click(button);
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should handle multiple clicks', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Keyboard Button</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });

    it('should have focus-visible ring styles', () => {
      render(<Button>Focus Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-ring');
    });

    it('should support aria-label', () => {
      render(<Button aria-label="Custom label">Button</Button>);
      expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Button aria-describedby="desc">Button</Button>
          <div id="desc">Description</div>
        </>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'desc');
    });

    it('should have proper role', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('HTML Attributes', () => {
    it('should support type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should support name attribute', () => {
      render(<Button name="myButton">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('name', 'myButton');
    });

    it('should support value attribute', () => {
      render(<Button value="buttonValue">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('value', 'buttonValue');
    });

    it('should support form attribute', () => {
      render(<Button form="myForm">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('form', 'myForm');
    });

    it('should support data attributes', () => {
      render(<Button data-testid="custom-button" data-value="test">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
      expect(button).toHaveAttribute('data-value', 'test');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to button element', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Button</Button>);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
    });

    it('should allow ref to access button methods', () => {
      const ref = { current: null as HTMLButtonElement | null };
      render(<Button ref={ref}>Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.click).toBeDefined();
    });
  });

  describe('Variant Combinations', () => {
    it('should combine variant and size', () => {
      render(<Button variant="destructive" size="lg">Large Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive');
      expect(button).toHaveClass('h-11');
    });

    it('should combine variant, size, and className', () => {
      render(
        <Button variant="outline" size="sm" className="custom">
          Small Outline
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'h-9', 'custom');
    });
  });

  describe('Content Rendering', () => {
    it('should render text content', () => {
      render(<Button>Text Button</Button>);
      expect(screen.getByText('Text Button')).toBeInTheDocument();
    });

    it('should render with icon and text', () => {
      render(
        <Button>
          <svg data-testid="icon" />
          Icon Button
        </Button>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Icon Button')).toBeInTheDocument();
    });

    it('should render icon only', () => {
      render(
        <Button size="icon" aria-label="Settings">
          <svg data-testid="icon" />
        </Button>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    });
  });

  describe('Base Styles', () => {
    it('should have inline-flex display', () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex');
    });

    it('should have items-center and justify-center', () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('items-center', 'justify-center');
    });

    it('should have rounded corners', () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-md');
    });

    it('should have transition styles', () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-colors');
    });

    it('should have font styles', () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-sm', 'font-medium');
    });
  });

  describe('AsChild Prop', () => {
    it('should render as child when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should apply button styles to child element when asChild', () => {
      render(
        <Button asChild variant="destructive">
          <a href="/test">Link Button</a>
        </Button>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveClass('bg-destructive');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty onClick gracefully', () => {
      render(<Button>No Handler</Button>);
      const button = screen.getByRole('button');
      expect(() => button.click()).not.toThrow();
    });

    it('should handle undefined variant', () => {
      render(<Button variant={undefined}>Button</Button>);
      const button = screen.getByRole('button');
      // Should use default variant
      expect(button).toHaveClass('bg-primary');
    });

    it('should handle undefined size', () => {
      render(<Button size={undefined}>Button</Button>);
      const button = screen.getByRole('button');
      // Should use default size
      expect(button).toHaveClass('h-10');
    });

    it('should render with only className', () => {
      render(<Button className="only-custom">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('only-custom');
    });
  });
});
