/**
 * LoadingSpinner Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner, FullPageLoader, InlineLoader } from './loading-spinner';

describe('LoadingSpinner', () => {
  it('should render without text', () => {
    render(<LoadingSpinner />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with text', () => {
    render(<LoadingSpinner text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('should apply correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    let spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-4', 'w-4');

    rerender(<LoadingSpinner size="lg" />);
    spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('should apply custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });
});

describe('FullPageLoader', () => {
  it('should render with default text', () => {
    render(<FullPageLoader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render with custom text', () => {
    render(<FullPageLoader text="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('should have full screen height', () => {
    const { container } = render(<FullPageLoader />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('h-screen');
  });
});

describe('InlineLoader', () => {
  it('should render without text', () => {
    const { container } = render(<InlineLoader />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with text', () => {
    render(<InlineLoader text="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
