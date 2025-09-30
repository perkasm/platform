import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

/**
 * The LoadingSpinner component displays an animated loading indicator.
 * Available in multiple sizes for different use cases.
 */
const meta = {
  title: 'UI/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An animated loading spinner component with multiple size variants. Use to indicate loading states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the spinner',
    },
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const InButton: Story = {
  render: () => (
    <button 
      disabled 
      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-50"
    >
      <LoadingSpinner size="sm" />
      Loading...
    </button>
  ),
};

export const Centered: Story = {
  render: () => (
    <div className="flex h-64 w-96 items-center justify-center rounded-lg border">
      <LoadingSpinner size="lg" />
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
    </div>
  ),
};
