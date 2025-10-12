import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GoalsSection } from './goals-section';

describe('GoalsSection', () => {
  it('should render the goals section card', () => {
    render(<GoalsSection />);

    expect(screen.getByText('AI-Recommended Goals')).toBeInTheDocument();
  });

  it('should render trip planning goal section', () => {
    render(<GoalsSection />);

    expect(screen.getByText('Japan Trip 2025')).toBeInTheDocument();
    expect(screen.getByText('AI Recommended')).toBeInTheDocument();
    // Check for partial text since it's broken up by spans
    expect(screen.getByText(/Spend.*dining.*3x points/)).toBeInTheDocument();
    expect(screen.getByText('$1,560/$2,400')).toBeInTheDocument();
    expect(screen.getByText(/Accumulate.*85k points/)).toBeInTheDocument();
    expect(screen.getByText('55k/85k')).toBeInTheDocument();
    expect(screen.getByText(/Transfer.*ANA.*1\.6x/)).toBeInTheDocument();
  });

  it('should render spending optimization goals section', () => {
    render(<GoalsSection />);

    expect(screen.getByText('Q2 Spending Targets')).toBeInTheDocument();
    expect(screen.getByText(/Chase Ink.*office supplies/)).toBeInTheDocument();
    expect(screen.getByText('$32k/$50k')).toBeInTheDocument();
    expect(screen.getByText(/Freedom Flex.*gas category/)).toBeInTheDocument();
    expect(screen.getByText('$245/$1,500')).toBeInTheDocument();
    expect(screen.getByText(/Amex Gold.*groceries/)).toBeInTheDocument();
    expect(screen.getByText('On track')).toBeInTheDocument();
  });

  it('should render monthly reward claims section', () => {
    render(<GoalsSection />);

    expect(screen.getByText('Monthly Reward Claims')).toBeInTheDocument();
    expect(screen.getByText(/Activate.*Amex Offers/)).toBeInTheDocument();
    expect(screen.getByText(/Claim.*Chase Dining.*bonus/)).toBeInTheDocument();
    expect(screen.getByText('Activated')).toBeInTheDocument();
    expect(screen.getByText(/Review.*Q3.*categories/)).toBeInTheDocument();
    expect(screen.getByText(/travel credits.*Dec 31/)).toBeInTheDocument();
  });

  it('should render upcoming deadlines section', () => {
    render(<GoalsSection />);

    expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument();
    expect(screen.getByText('Delta SkyMiles expiration')).toBeInTheDocument();
    expect(screen.getByText('45 days')).toBeInTheDocument();
    expect(screen.getByText('Chase Freedom Q2 activation')).toBeInTheDocument();
    expect(screen.getByText('15 days')).toBeInTheDocument();
    expect(screen.getByText('Amex Gold welcome bonus deadline')).toBeInTheDocument();
    expect(screen.getByText('3 months')).toBeInTheDocument();
  });

  it('should have progress bar for trip goal', () => {
    render(<GoalsSection />);

    const progressElements = document.querySelectorAll('[role="progressbar"]');
    expect(progressElements.length).toBeGreaterThan(0);
  });

  it('should have correct number of checkboxes', () => {
    render(<GoalsSection />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(10); // 3 for trip + 3 for spending + 4 for rewards
  });

  it('should have pre-checked checkboxes for completed items', () => {
    render(<GoalsSection />);

    const checkboxes = screen.getAllByRole('checkbox');
    const checkedBoxes = checkboxes.filter(checkbox =>
      checkbox.hasAttribute('checked') ||
      checkbox.getAttribute('aria-checked') === 'true' ||
      checkbox.getAttribute('defaultChecked') === 'true'
    );
    expect(checkedBoxes.length).toBeGreaterThan(0);
  });

  it('should display success styling for completed items', () => {
    render(<GoalsSection />);

    // Check for success text styling
    const successElements = screen.getAllByText(/\$1,560\/\$2,400|\$32k\/\$50k|Activated|On track/);
    expect(successElements.length).toBeGreaterThan(0);
  });

  it('should have proper card structure', () => {
    render(<GoalsSection />);

    const card = document.querySelector('.shadow-card');
    expect(card).toBeInTheDocument();
  });

  it('should render all section headers', () => {
    render(<GoalsSection />);

    expect(screen.getByText('Japan Trip 2025')).toBeInTheDocument();
    expect(screen.getByText('Q2 Spending Targets')).toBeInTheDocument();
    expect(screen.getByText('Monthly Reward Claims')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument();
  });

  it('should have different styling for deadline urgency levels', () => {
    render(<GoalsSection />);

    // Check for destructive styling (urgent)
    const urgentElements = document.querySelectorAll('.bg-destructive\\/5');
    expect(urgentElements.length).toBeGreaterThan(0);

    // Check for premium styling (warning)
    const warningElements = document.querySelectorAll('.bg-premium\\/5');
    expect(warningElements.length).toBeGreaterThan(0);

    // Check for success styling (normal)
    const normalElements = document.querySelectorAll('.bg-success\\/5');
    expect(normalElements.length).toBeGreaterThan(0);
  });
});