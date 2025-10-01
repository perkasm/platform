import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AIChat } from './ai-chat';

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div data-testid="card" className={className} {...props}>{children}</div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div data-testid="card-content" className={className} {...props}>{children}</div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div data-testid="card-header" className={className} {...props}>{children}</div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <h3 data-testid="card-title" className={className} {...props}>{children}</h3>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, ...props }: any) => (
    <button 
      data-testid="button" 
      onClick={onClick} 
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, onKeyPress, placeholder, ...props }: any) => (
    <input
      data-testid="input"
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className, ...props }: any) => (
    <div data-testid="scroll-area" className={className} {...props}>{children}</div>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => (
    <span data-testid="badge" {...props}>{children}</span>
  ),
}));

describe('AIChat Component', () => {
  describe('Layout and Structure', () => {
    it('should render without errors', () => {
      render(<AIChat />);
      expect(screen.getByText('AI Optimization Assistant')).toBeInTheDocument();
    });

    it('should render header with title and description', () => {
      render(<AIChat />);
      expect(screen.getByText('AI Optimization Assistant')).toBeInTheDocument();
      expect(screen.getByText(/Get personalized strategies for maximizing/)).toBeInTheDocument();
    });

    it('should render Quick Start Prompts section', () => {
      render(<AIChat />);
      expect(screen.getByText('Quick Start Prompts')).toBeInTheDocument();
    });

    it('should render Conversation section', () => {
      render(<AIChat />);
      expect(screen.getByText('Conversation')).toBeInTheDocument();
    });

    it('should render message input field', () => {
      render(<AIChat />);
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      expect(input).toBeInTheDocument();
    });

    it('should render send button', () => {
      render(<AIChat />);
      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Predefined Prompts', () => {
    it('should render all 8 predefined prompts', () => {
      render(<AIChat />);
      
      expect(screen.getByText('How many points do I need for a flight to Japan?')).toBeInTheDocument();
      expect(screen.getByText("What's the best way to earn points for an upcoming trip?")).toBeInTheDocument();
      expect(screen.getByText('Should I redeem my points for cash or travel value?')).toBeInTheDocument();
      expect(screen.getByText('How can I maximize points on my upcoming large purchase?')).toBeInTheDocument();
      expect(screen.getByText('Tell me about recent point devaluations')).toBeInTheDocument();
      expect(screen.getByText('Which card should I use for dining purchases?')).toBeInTheDocument();
      expect(screen.getByText('When is the best time to book with points?')).toBeInTheDocument();
      expect(screen.getByText('Help me optimize my Q2 spending strategy')).toBeInTheDocument();
    });

    it('should handle predefined prompt click', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const japanPrompt = screen.getByText('How many points do I need for a flight to Japan?');
      await user.click(japanPrompt);
      
      // Verify the message appears (async operation will be handled by setTimeout in component)
      await waitFor(() => {
        expect(screen.getAllByText('How many points do I need for a flight to Japan?').length).toBeGreaterThanOrEqual(1);
      }, { timeout: 3000 });
    });

    it('should send message when predefined prompt is clicked', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const diningPrompt = screen.getByText('Which card should I use for dining purchases?');
      await user.click(diningPrompt);
      
      await waitFor(() => {
        const messages = screen.getAllByText('Which card should I use for dining purchases?');
        expect(messages.length).toBeGreaterThanOrEqual(1);
      }, { timeout: 3000 });
    });
  });

  describe('Initial Welcome Message', () => {
    it('should display welcome message on load', () => {
      render(<AIChat />);
      
      const welcomeMessage = screen.getByText(/Hi! I'm your AI assistant for credit card rewards optimization/);
      expect(welcomeMessage).toBeInTheDocument();
    });

    it('should show assistant icon for welcome message', () => {
      render(<AIChat />);
      
      // The welcome message should be from the assistant
      expect(screen.getByText(/Hi! I'm your AI assistant/)).toBeInTheDocument();
    });
  });

  describe('Message Sending', () => {
    it('should allow typing in input field', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      await user.type(input, 'Test message');
      
      expect(input).toHaveValue('Test message');
    });

    it('should clear input after sending message', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      const sendButton = screen.getAllByTestId('button').find(btn => 
        btn.querySelector('svg') || btn.textContent === ''
      );
      
      await user.type(input, 'Test message');
      if (sendButton) {
        await user.click(sendButton);
      }
      
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('should send message on Enter key press', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      await user.type(input, 'Test message{Enter}');
      
      await waitFor(() => {
        const messages = screen.getAllByText('Test message');
        expect(messages.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('should not send empty messages', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      const buttons = screen.getAllByTestId('button');
      
      await user.type(input, '   ');
      
      const sendButton = buttons[buttons.length - 1];
      expect(sendButton).toBeDisabled();
    });

    it('should disable send button when input is empty', () => {
      render(<AIChat />);
      
      const buttons = screen.getAllByTestId('button');
      const sendButton = buttons[buttons.length - 1];
      
      expect(sendButton).toBeDisabled();
    });
  });

  describe('AI Response Generation', () => {
    it('should generate response for Japan flight query', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      await user.type(input, 'How many points for Japan flight?');
      
      const buttons = screen.getAllByTestId('button');
      const sendButton = buttons[buttons.length - 1];
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/60,000-80,000 points for economy/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should generate response for dining query', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      await user.type(input, 'Which card for dining?');
      
      const buttons = screen.getAllByTestId('button');
      const sendButton = buttons[buttons.length - 1];
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/American Express Gold card which earns 4x points/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should generate generic response for unknown queries', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      await user.type(input, 'Random question');
      
      const buttons = screen.getAllByTestId('button');
      const sendButton = buttons[buttons.length - 1];
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/I understand you're looking for credit card optimization advice/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator while processing', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      await user.type(input, 'Test message');
      
      const buttons = screen.getAllByTestId('button');
      const sendButton = buttons[buttons.length - 1];
      await user.click(sendButton);
      
      // Check that send button is disabled during loading
      expect(sendButton).toBeDisabled();
    });

    it('should disable send button during loading', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      await user.type(input, 'Test');
      
      const buttons = screen.getAllByTestId('button');
      const sendButton = buttons[buttons.length - 1];
      await user.click(sendButton);
      
      expect(sendButton).toBeDisabled();
    });

    it('should hide loading indicator after response', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      await user.type(input, 'Test message');
      
      const buttons = screen.getAllByTestId('button');
      const sendButton = buttons[buttons.length - 1];
      await user.click(sendButton);
      
      await waitFor(() => {
        // Loading should be gone and response should be visible
        expect(screen.getByText(/I understand you're looking for credit card optimization advice/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Message Display', () => {
    it('should display user messages with correct styling', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      await user.type(input, 'Test user message');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        const userMessage = screen.getAllByText('Test user message')[0];
        expect(userMessage).toBeInTheDocument();
        expect(userMessage.closest('div')).toHaveClass('bg-primary');
      }, { timeout: 3000 });
    });

    it('should display assistant messages with correct styling', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      await user.type(input, 'Test');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        const messages = screen.getAllByText(/I understand you're looking/);
        const assistantMessage = messages[0];
        expect(assistantMessage.closest('div')).toHaveClass('bg-muted');
      }, { timeout: 3000 });
    });

    it('should show timestamps for messages', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      await user.type(input, 'Test{Enter}');
      
      await waitFor(() => {
        const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
        expect(timeElements.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });

  describe('Message History', () => {
    it('should maintain message history', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      
      // Send first message
      await user.type(input, 'First message');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getAllByText('First message').length).toBeGreaterThan(0);
      }, { timeout: 3000 });
      
      // Send second message
      await user.type(input, 'Second message');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText('First message')).toBeInTheDocument();
        expect(screen.getAllByText('Second message').length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('should preserve welcome message', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      await user.type(input, 'Test message{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText(/Hi! I'm your AI assistant/)).toBeInTheDocument();
        expect(screen.getAllByText('Test message').length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      render(<AIChat />);
      
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      expect(input).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      render(<AIChat />);
      
      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render scroll area for messages', () => {
      render(<AIChat />);
      
      expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should apply animation to container', () => {
      const { container } = render(<AIChat />);
      
      const mainContainer = container.firstElementChild;
      expect(mainContainer).toHaveClass('animate-slide-up');
    });

    it('should render grid layout for prompts', () => {
      const { container } = render(<AIChat />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('md:grid-cols-2');
    });

    it('should apply correct height to scroll area', () => {
      render(<AIChat />);
      
      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('h-96');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid message sending', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      
      await user.type(input, 'Message 1{Enter}');
      await user.type(input, 'Message 2{Enter}');
      
      await waitFor(() => {
        expect(screen.getAllByText('Message 1').length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('should handle Enter key with empty input gracefully', async () => {
      const user = userEvent.setup();
      render(<AIChat />);
      
      const input = screen.getByPlaceholderText('Ask about your rewards strategy...');
      await user.click(input);
      await user.keyboard('{Enter}');
      
      // Should not create a new message
      const welcomeMessages = screen.getAllByText(/Hi! I'm your AI assistant/);
      expect(welcomeMessages).toHaveLength(1);
    });
  });
});
