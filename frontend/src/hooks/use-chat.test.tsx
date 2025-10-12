import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSendMessage } from './use-chat';
import { chatService } from '@/services/chat.service';
import type { ChatResponse } from '@/types/api';

// Mock the services
vi.mock('@/services/chat.service', () => ({
  chatService: {
    sendMessage: vi.fn(),
  },
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Test wrapper component
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useSendMessage', () => {
  const mockChatResponse: ChatResponse = {
    id: 'msg-123',
    conversation_id: 'conv-456',
    content: 'Hello! How can I help you optimize your credit card rewards?',
    role: 'assistant',
    timestamp: '2024-01-15T10:30:00Z',
    tokens_used: 150,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useSendMessage', () => {
    it('should send a message successfully', async () => {
      const mockSendMessage = vi.mocked(chatService.sendMessage);
      mockSendMessage.mockResolvedValue(mockChatResponse);

      const { result } = renderHook(() => useSendMessage(), { wrapper: createWrapper() });

      const messageData = {
        message: 'What are the best credit cards for travel?',
        conversationId: 'conv-456',
        includeContext: true,
      };

      result.current.mutate(messageData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockSendMessage).toHaveBeenCalledWith(
        'What are the best credit cards for travel?',
        'conv-456',
        true
      );
      expect(result.current.data).toEqual(mockChatResponse);
    });

    it('should send a message with minimal parameters', async () => {
      const mockSendMessage = vi.mocked(chatService.sendMessage);
      mockSendMessage.mockResolvedValue(mockChatResponse);

      const { result } = renderHook(() => useSendMessage(), { wrapper: createWrapper() });

      const messageData = {
        message: 'Hello',
      };

      result.current.mutate(messageData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockSendMessage).toHaveBeenCalledWith('Hello', undefined, undefined);
    });

    it('should handle send message error', async () => {
      const mockSendMessage = vi.mocked(chatService.sendMessage);
      const error = new Error('Failed to send message');
      mockSendMessage.mockRejectedValue(error);

      const { result } = renderHook(() => useSendMessage(), { wrapper: createWrapper() });

      const messageData = {
        message: 'Test message',
      };

      result.current.mutate(messageData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });

    it('should handle loading state correctly', async () => {
      const mockSendMessage = vi.mocked(chatService.sendMessage);
      // Delay the response to test loading state
      mockSendMessage.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockChatResponse), 100))
      );

      const { result } = renderHook(() => useSendMessage(), { wrapper: createWrapper() });

      const messageData = {
        message: 'Test message',
      };

      result.current.mutate(messageData);

      // Should be pending after mutation starts
      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      expect(result.current.isIdle).toBe(false);

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should allow multiple mutations', async () => {
      const mockSendMessage = vi.mocked(chatService.sendMessage);
      mockSendMessage.mockResolvedValue(mockChatResponse);

      const { result } = renderHook(() => useSendMessage(), { wrapper: createWrapper() });

      // First mutation
      result.current.mutate({ message: 'First message' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(mockChatResponse);
      });

      // Second mutation should work
      result.current.mutate({ message: 'Second message' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Should have been called twice
      expect(mockSendMessage).toHaveBeenCalledTimes(2);
      expect(mockSendMessage).toHaveBeenNthCalledWith(1, 'First message', undefined, undefined);
      expect(mockSendMessage).toHaveBeenNthCalledWith(2, 'Second message', undefined, undefined);
    });
  });
});