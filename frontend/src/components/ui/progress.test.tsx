import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from './progress';

describe('Progress Component', () => {
  describe('Rendering', () => {
    it('should render progress bar', () => {
      const { container } = render(<Progress value={50} />);
      const progress = container.querySelector('[role="progressbar"]');
      expect(progress).toBeInTheDocument();
    });

    it('should render with specific value', () => {
      render(<Progress value={75} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });

    it('should render with zero value', () => {
      render(<Progress value={0} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });

    it('should render with 100 value', () => {
      render(<Progress value={100} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Progress value={50} className="custom-progress" data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('custom-progress');
    });
  });

  describe('Progress Values', () => {
    it('should handle 0% progress', () => {
      render(<Progress value={0} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });

    it('should handle 25% progress', () => {
      render(<Progress value={25} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });

    it('should handle 50% progress', () => {
      render(<Progress value={50} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });

    it('should handle 75% progress', () => {
      render(<Progress value={75} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });

    it('should handle 100% progress', () => {
      render(<Progress value={100} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });

    it('should handle decimal values', () => {
      render(<Progress value={33.33} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });

    it('should handle undefined value', () => {
      render(<Progress value={undefined} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });

    it('should handle null value', () => {
      // @ts-expect-error: Testing null value
      render(<Progress value={null} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });
  });

  describe('Indicator Transform', () => {
    it('should render indicator element', () => {
      const { container } = render(<Progress value={0} />);
      const indicator = container.querySelector('[data-state]');
      expect(indicator).toBeInTheDocument();
    });

    it('should have indicator for 50% progress', () => {
      const { container } = render(<Progress value={50} />);
      const indicator = container.querySelector('[data-state]');
      expect(indicator).toBeInTheDocument();
    });

    it('should have indicator for 100% progress', () => {
      const { container } = render(<Progress value={100} />);
      const indicator = container.querySelector('[data-state]');
      expect(indicator).toBeInTheDocument();
    });

    it('should render indicator for undefined value', () => {
      const { container } = render(<Progress value={undefined} />);
      const indicator = container.querySelector('[data-state]');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have progressbar role', () => {
      render(<Progress value={50} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should have aria-valuemin attribute', () => {
      render(<Progress value={50} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuemin');
    });

    it('should have aria-valuemax attribute', () => {
      render(<Progress value={50} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuemax');
    });

    it('should support aria-label', () => {
      render(<Progress value={50} aria-label="Upload progress" />);
      const progress = screen.getByRole('progressbar', { name: 'Upload progress' });
      expect(progress).toBeInTheDocument();
    });

    it('should support aria-labelledby', () => {
      render(
        <>
          <div id="progress-label">Loading files</div>
          <Progress value={50} aria-labelledby="progress-label" />
        </>
      );
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-labelledby', 'progress-label');
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Progress value={50} aria-describedby="progress-desc" />
          <div id="progress-desc">Currently uploading files</div>
        </>
      );
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-describedby', 'progress-desc');
    });

    it('should have data-state attribute', () => {
      const { container } = render(<Progress value={50} />);
      const indicator = container.querySelector('[data-state]');
      expect(indicator).toBeInTheDocument();
    });

    it('should render indicator for incomplete progress', () => {
      const { container } = render(<Progress value={50} />);
      const indicator = container.querySelector('[data-state]');
      expect(indicator).toBeInTheDocument();
    });

    it('should render indicator for 100% progress', () => {
      const { container } = render(<Progress value={100} />);
      const indicator = container.querySelector('[data-state]');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Base Styles', () => {
    it('should have relative positioning', () => {
      render(<Progress value={50} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('relative');
    });

    it('should have correct height', () => {
      render(<Progress value={50} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('h-4');
    });

    it('should have full width', () => {
      render(<Progress value={50} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('w-full');
    });

    it('should have overflow hidden', () => {
      render(<Progress value={50} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('overflow-hidden');
    });

    it('should have rounded corners', () => {
      render(<Progress value={50} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('rounded-full');
    });

    it('should have background color', () => {
      render(<Progress value={50} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('bg-secondary');
    });
  });

  describe('Indicator Styles', () => {
    it('should render indicator element', () => {
      const { container } = render(<Progress value={50} />);
      const indicator = container.querySelector('[data-state]');
      expect(indicator).toBeInTheDocument();
    });

    it('should have indicator with styles', () => {
      const { container } = render(<Progress value={50} />);
      const indicator = container.querySelector('[data-state]');
      expect(indicator).toHaveClass('w-full');
    });
  });

  describe('HTML Attributes', () => {
    it('should support id attribute', () => {
      render(<Progress value={50} id="my-progress" />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('id', 'my-progress');
    });

    it('should support data attributes', () => {
      render(<Progress value={50} data-testid="custom" data-value="test" />);
      const progress = screen.getByTestId('custom');
      expect(progress).toHaveAttribute('data-value', 'test');
    });

    it('should support title attribute', () => {
      render(<Progress value={50} title="Progress bar" />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('title', 'Progress bar');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to progress element', () => {
      const ref = vi.fn();
      render(<Progress value={50} ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
    });

    it('should allow ref to access progress element', () => {
      const ref = { current: null as HTMLDivElement | null };
      render(<Progress value={50} ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.getAttribute('role')).toBe('progressbar');
    });
  });

  describe('Style Customization', () => {
    it('should merge custom classes with base classes', () => {
      render(<Progress value={50} className="h-6" data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('h-6', 'w-full', 'rounded-full');
    });

    it('should allow background color customization', () => {
      render(<Progress value={50} className="bg-gray-200" data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('bg-gray-200');
    });

    it('should allow height customization', () => {
      render(<Progress value={50} className="h-2" data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('h-2');
    });
  });

  describe('Common Use Cases', () => {
    it('should render file upload progress', () => {
      render(<Progress value={45} aria-label="File upload" />);
      const progress = screen.getByRole('progressbar', { name: 'File upload' });
      expect(progress).toBeInTheDocument();
    });

    it('should render loading indicator', () => {
      render(<Progress value={33} aria-label="Loading" />);
      const progress = screen.getByRole('progressbar', { name: 'Loading' });
      expect(progress).toBeInTheDocument();
    });

    it('should render skill level indicator', () => {
      render(<Progress value={80} aria-label="React skills" />);
      const progress = screen.getByRole('progressbar', { name: 'React skills' });
      expect(progress).toBeInTheDocument();
    });

    it('should render goal completion', () => {
      render(<Progress value={90} aria-label="Goal completion" />);
      const progress = screen.getByRole('progressbar', { name: 'Goal completion' });
      expect(progress).toBeInTheDocument();
    });
  });

  describe('Dynamic Updates', () => {
    it('should update progress value', () => {
      const { rerender } = render(<Progress value={25} />);
      let progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();

      rerender(<Progress value={75} />);
      progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });

    it('should update from 0 to 100', () => {
      const { rerender } = render(<Progress value={0} />);
      let progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();

      rerender(<Progress value={100} />);
      progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });

    it('should handle decreasing progress', () => {
      const { rerender } = render(<Progress value={75} />);
      let progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();

      rerender(<Progress value={50} />);
      progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative values', () => {
      render(<Progress value={-10} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });

    it('should handle values over 100', () => {
      render(<Progress value={150} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });

    it('should handle null className', () => {
      // @ts-expect-error: Testing null className
      render(<Progress value={50} className={null} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should handle undefined className', () => {
      render(<Progress value={50} className={undefined} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should handle very small decimal values', () => {
      render(<Progress value={0.01} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });

    it('should handle very large decimal values', () => {
      render(<Progress value={99.99} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });
  });
});
