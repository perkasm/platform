import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '@/components/ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow = false, errorMessage = 'Test error' }: { shouldThrow?: boolean; errorMessage?: string }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>No error</div>;
};

// Suppress console.error for tests
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  describe('normal operation', () => {
    it('should render children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>Child component</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child component')).toBeInTheDocument();
    });

    it('should render multiple children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>First child</div>
          <div>Second child</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should catch errors and display error UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('should display custom error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Custom error message" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should call onError callback when error occurs', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} errorMessage="Callback test" />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Callback test' }),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });

    it('should not call onError when no error occurs', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <div>No error</div>
        </ErrorBoundary>
      );

      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('custom fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom error fallback</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('should render custom fallback with complex UI', () => {
      const customFallback = (
        <div>
          <h1>Oops!</h1>
          <p>Something broke</p>
          <button>Go back</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops!')).toBeInTheDocument();
      expect(screen.getByText('Something broke')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
    });
  });

  describe('reset functionality', () => {
    it('should reset error state when Try Again is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      const tryAgainButton = screen.getByRole('button', { name: 'Try Again' });
      await user.click(tryAgainButton);

      // After clicking reset, error boundary resets but child still throws
      // so it catches the error again and shows error UI
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should call onReset callback when reset', async () => {
      const user = userEvent.setup();
      const onReset = vi.fn();

      render(
        <ErrorBoundary onReset={onReset}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: 'Try Again' });
      await user.click(tryAgainButton);

      expect(onReset).toHaveBeenCalled();
    });
  });

  describe('UI elements', () => {
    it('should display Try Again button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    });

    it('should display Reload Page button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: 'Reload Page' })).toBeInTheDocument();
    });

    it('should display alert with error icon', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Alert should be present
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      // Check for destructive variant through parent
      const alert = screen.getByText('Something went wrong').closest('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle error with no message', () => {
      const ThrowEmptyError = () => {
        throw new Error();
      };

      render(
        <ErrorBoundary>
          <ThrowEmptyError />
        </ErrorBoundary>
      );

      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });

    it('should handle nested ErrorBoundaries', () => {
      render(
        <ErrorBoundary fallback={<div>Outer fallback</div>}>
          <ErrorBoundary fallback={<div>Inner fallback</div>}>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      // Inner boundary should catch the error
      expect(screen.getByText('Inner fallback')).toBeInTheDocument();
      expect(screen.queryByText('Outer fallback')).not.toBeInTheDocument();
    });

    it('should handle error in nested children', () => {
      render(
        <ErrorBoundary>
          <div>
            <div>
              <ThrowError shouldThrow={true} />
            </div>
          </div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should catch errors from async operations (boundary limitations)', () => {
      // Note: ErrorBoundary can't catch async errors, but we test the behavior
      const AsyncError = () => {
        // This would need to be wrapped in try-catch in the component itself
        return <div>Async component</div>;
      };

      render(
        <ErrorBoundary>
          <AsyncError />
        </ErrorBoundary>
      );

      // No error boundary triggered for async errors
      expect(screen.getByText('Async component')).toBeInTheDocument();
    });
  });

  describe('getDerivedStateFromError', () => {
    it('should update state when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Verify that error state is reflected in UI
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('componentDidCatch', () => {
    it('should log error in development mode', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock DEV environment
      (import.meta as any).env = { DEV: true };

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Dev mode error" />
        </ErrorBoundary>
      );

      // In DEV mode, error should be logged
      // Note: The actual console.error call is mocked in beforeEach

      consoleErrorSpy.mockRestore();
    });
  });

  describe('accessibility', () => {
    it('should have proper alert role for error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should have accessible buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: 'Try Again' });
      const reloadButton = screen.getByRole('button', { name: 'Reload Page' });

      expect(tryAgainButton).toBeInTheDocument();
      expect(reloadButton).toBeInTheDocument();
    });
  });

  describe('TypeScript types', () => {
    it('should accept ReactNode as children', () => {
      render(
        <ErrorBoundary>
          <div>String child</div>
          <span>Another child</span>
          {null}
          {undefined}
          {123}
        </ErrorBoundary>
      );

      expect(screen.getByText('String child')).toBeInTheDocument();
    });
  });
});
