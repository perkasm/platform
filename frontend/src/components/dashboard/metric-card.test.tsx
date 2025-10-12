import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from './metric-card';
import { TrendingUp } from 'lucide-react';

describe('MetricCard', () => {
  it('should render with required props', () => {
    render(<MetricCard title="Test Metric" value="$1,234" />);

    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('$1,234')).toBeInTheDocument();
  });

  it('should render with icon', () => {
    const icon = <TrendingUp data-testid="trending-icon" />;
    render(<MetricCard title="Revenue" value="$5,000" icon={icon} />);

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
    expect(screen.getByTestId('trending-icon')).toBeInTheDocument();
  });

  it('should render with positive change', () => {
    render(
      <MetricCard
        title="Growth"
        value="15%"
        change="+5.2% from last month"
        changeType="positive"
      />
    );

    expect(screen.getByText('Growth')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText('+5.2% from last month')).toBeInTheDocument();
    expect(screen.getByText('+5.2% from last month')).toHaveClass('text-success');
  });

  it('should render with negative change', () => {
    render(
      <MetricCard
        title="Decline"
        value="8%"
        change="-2.1% from last month"
        changeType="negative"
      />
    );

    expect(screen.getByText('Decline')).toBeInTheDocument();
    expect(screen.getByText('8%')).toBeInTheDocument();
    expect(screen.getByText('-2.1% from last month')).toBeInTheDocument();
    expect(screen.getByText('-2.1% from last month')).toHaveClass('text-destructive');
  });

  it('should render with neutral change', () => {
    render(
      <MetricCard
        title="Stable"
        value="100%"
        change="No change"
        changeType="neutral"
      />
    );

    expect(screen.getByText('Stable')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('No change')).toBeInTheDocument();
    expect(screen.getByText('No change')).toHaveClass('text-muted-foreground');
  });

  it('should render with custom className', () => {
    render(
      <MetricCard
        title="Custom"
        value="42"
        className="custom-class"
      />
    );

    const card = screen.getByText('Custom').closest('.shadow-card');
    expect(card).toHaveClass('custom-class');
  });

  it('should have default neutral change type when not specified', () => {
    render(
      <MetricCard
        title="Default"
        value="50%"
        change="Some change"
      />
    );

    expect(screen.getByText('Some change')).toHaveClass('text-muted-foreground');
  });

  it('should not render change section when change prop is not provided', () => {
    render(<MetricCard title="No Change" value="100%" />);

    expect(screen.getByText('No Change')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.queryByText(/from last month/)).not.toBeInTheDocument();
  });
});