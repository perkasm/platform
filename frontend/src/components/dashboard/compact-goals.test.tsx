import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompactGoals } from './compact-goals';

describe('CompactGoals', () => {
  it('should render the goals tracker card', () => {
    render(<CompactGoals />);

    expect(screen.getByText('AI Goals Tracker')).toBeInTheDocument();
    expect(screen.getByText('Auto-tracking')).toBeInTheDocument();
  });

  it('should render trip goal section', () => {
    render(<CompactGoals />);

    expect(screen.getByText('Japan Trip 2025')).toBeInTheDocument();
    expect(screen.getByText('65% complete')).toBeInTheDocument();
    expect(screen.getByText('Dining spend: $1,560/$2,400 ✓')).toBeInTheDocument();
    expect(screen.getByText('Points: 55k/85k needed')).toBeInTheDocument();
  });

  it('should render Q2 targets section', () => {
    render(<CompactGoals />);

    expect(screen.getByText('Q2 Spending')).toBeInTheDocument();
    expect(screen.getByText('Chase Ink office supplies')).toBeInTheDocument();
    expect(screen.getByText('$32k/$50k')).toBeInTheDocument();
    expect(screen.getByText('Freedom 5x gas category')).toBeInTheDocument();
    expect(screen.getByText('$245/$1,500')).toBeInTheDocument();
    expect(screen.getByText('Amex 4x groceries')).toBeInTheDocument();
    expect(screen.getByText('On track ✓')).toBeInTheDocument();
  });

  it('should render monthly tasks section', () => {
    render(<CompactGoals />);

    expect(screen.getByText('Monthly Tasks')).toBeInTheDocument();
    expect(screen.getByText('Activate 3 Amex Offers')).toBeInTheDocument();
    expect(screen.getByText('Chase Dining 5x ✓')).toBeInTheDocument();
    expect(screen.getByText('Activate Q3 categories')).toBeInTheDocument();
  });

  it('should render urgent alerts section', () => {
    render(<CompactGoals />);

    expect(screen.getByText('Urgent')).toBeInTheDocument();
    expect(screen.getByText('Delta Miles expire')).toBeInTheDocument();
    expect(screen.getByText('45 days')).toBeInTheDocument();
    expect(screen.getByText('Q2 activation due')).toBeInTheDocument();
    expect(screen.getByText('15 days')).toBeInTheDocument();
  });

  it('should render all required icons', () => {
    render(<CompactGoals />);

    // Check that icons are present by looking for SVG elements (lucide icons render as SVG)
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(5); // Should have multiple icons
  });

  it('should have progress bar for trip goal', () => {
    render(<CompactGoals />);

    // The progress bar should exist (we can't easily test the value without more complex setup)
    const progressElements = document.querySelectorAll('[role="progressbar"]');
    expect(progressElements.length).toBeGreaterThan(0);
  });

  it('should have checkboxes for monthly tasks', () => {
    render(<CompactGoals />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(3); // Three tasks with checkboxes
  });

  it('should have one pre-checked checkbox for completed task', () => {
    render(<CompactGoals />);

    const checkboxes = screen.getAllByRole('checkbox');
    const checkedBoxes = checkboxes.filter(checkbox => checkbox.hasAttribute('checked') || checkbox.getAttribute('aria-checked') === 'true');
    expect(checkedBoxes.length).toBe(1); // Only "Chase Dining 5x" should be checked
  });

  it('should display success styling for completed items', () => {
    render(<CompactGoals />);

    const successTexts = screen.getAllByText(/✓/);
    expect(successTexts.length).toBeGreaterThan(0);
  });

  it('should have proper card structure', () => {
    render(<CompactGoals />);

    // Should be wrapped in a Card component
    const card = document.querySelector('.shadow-card');
    expect(card).toBeInTheDocument();
  });
});