import type { Meta, StoryObj } from '@storybook/react';
import { CardSkeleton } from '@/components/ui/card-skeleton';

/**
 * The CardSkeleton component displays placeholder content while data is loading.
 */
const meta = {
  title: 'UI/CardSkeleton',
  component: CardSkeleton,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A skeleton placeholder component that mimics the layout of a card while content is loading. Improves perceived performance.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => <CardSkeleton />,
};

export const Multiple: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  ),
};

export const Grid: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  ),
};

export const InContainer: Story = {
  render: () => (
    <div className="container max-w-6xl">
      <h2 className="mb-4 text-2xl font-bold">Loading Cards...</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  ),
};
