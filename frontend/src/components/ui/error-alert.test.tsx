/**
 * ErrorAlert Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorAlert, ErrorPage, InlineError } from './error-alert';

describe('ErrorAlert', () => {
  it('should render with default title and message', () => {
    render(<ErrorAlert message="Something went wrong" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    render(<ErrorAlert title="Custom Error" message="Error details" />);
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });

  it('should extract message from Error object', () => {
    const error = new Error('Network error occurred');
    render(<ErrorAlert error={error} />);
    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorAlert message="Failed to load" onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorAlert message="Failed to load" onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorAlert message="Error occurred" />);
    const retryButton = screen.queryByText('Try Again');
    expect(retryButton).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ErrorAlert message="Error" className="custom-error" />
    );
    const alert = container.querySelector('.custom-error');
    expect(alert).toBeInTheDocument();
  });

  it('should show default message when no message or error is provided', () => {
    render(<ErrorAlert />);
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
  });
});

describe('ErrorPage', () => {
  it('should render full page error', () => {
    const { container } = render(<ErrorPage />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('h-screen');
  });

  it('should render with custom title and message', () => {
    render(
      <ErrorPage
        title="Page Not Found"
        message="The page you're looking for doesn't exist"
      />
    );
    
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText("The page you're looking for doesn't exist")).toBeInTheDocument();
  });

  it('should include retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorPage onRetry={onRetry} />);
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });
});

describe('InlineError', () => {
  it('should render inline error', () => {
    render(<InlineError message="Failed to load data" />);
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('should have centered layout', () => {
    const { container } = render(<InlineError message="Error" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('should call onRetry when provided', () => {
    const onRetry = vi.fn();
    render(<InlineError message="Error" onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalled();
  });
});
