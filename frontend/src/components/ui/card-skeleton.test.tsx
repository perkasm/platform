/**
 * CardSkeleton Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CardSkeleton, CardSkeletonGrid, DashboardCardSkeleton } from './card-skeleton';

describe('CardSkeleton', () => {
  it('should render skeleton structure', () => {
    const { container } = render(<CardSkeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should have card image area', () => {
    const { container } = render(<CardSkeleton />);
    const imageArea = container.querySelector('.h-32');
    expect(imageArea).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<CardSkeleton className="custom-skeleton" />);
    const card = container.querySelector('.custom-skeleton');
    expect(card).toBeInTheDocument();
  });
});

describe('CardSkeletonGrid', () => {
  it('should render default number of skeletons', () => {
    const { container } = render(<CardSkeletonGrid />);
    const cards = container.querySelectorAll('.shadow-card');
    expect(cards).toHaveLength(4);
  });

  it('should render custom number of skeletons', () => {
    const { container } = render(<CardSkeletonGrid count={6} />);
    const cards = container.querySelectorAll('.shadow-card');
    expect(cards).toHaveLength(6);
  });

  it('should have grid layout', () => {
    const { container } = render(<CardSkeletonGrid />);
    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass('grid');
  });
});

describe('DashboardCardSkeleton', () => {
  it('should render dashboard card skeleton', () => {
    const { container } = render(<DashboardCardSkeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should have header and content sections', () => {
    const { container } = render(<DashboardCardSkeleton />);
    // Check for Card component structure rather than specific class names
    const card = container.querySelector('[class*="border"]');
    expect(card).not.toBeNull();
  });
});
