import type { Meta, StoryObj } from '@storybook/react-vite';
import { ErrorAlert } from '@/components/ui/error-alert';

/**
 * The ErrorAlert component displays error messages with optional retry functionality.
 */
const meta = {
  title: 'UI/ErrorAlert',
  component: ErrorAlert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A component for displaying error messages with an optional retry action. Provides consistent error UI across the application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'The error message to display',
    },
    title: {
      control: 'text',
      description: 'Optional title for the error',
    },
    onRetry: {
      action: 'retry clicked',
      description: 'Callback when retry button is clicked',
    },
  },
} satisfies Meta<typeof ErrorAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    message: 'Failed to load data. Please try again.',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection.',
  },
};

export const WithRetry: Story = {
  args: {
    title: 'Failed to Load',
    message: 'Failed to load credit cards. Would you like to try again?',
    onRetry: () => alert('Retrying...'),
  },
};

export const LongMessage: Story = {
  args: {
    title: 'Authentication Error',
    message: 'Your session has expired. Please log in again to continue using the application. If this problem persists, please contact support.',
    onRetry: () => alert('Redirecting to login...'),
  },
};

export const NetworkError: Story = {
  args: {
    title: 'Network Error',
    message: 'Unable to reach the server. Please check your internet connection and try again.',
    onRetry: () => alert('Retrying...'),
  },
};

export const ValidationError: Story = {
  args: {
    title: 'Validation Failed',
    message: 'Please check your input and try again. Card name is required and must be less than 100 characters.',
  },
};
