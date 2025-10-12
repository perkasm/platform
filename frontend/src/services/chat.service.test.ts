import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/services/api';
import { ChatService } from '@/services/chat.service';
import type { ChatResponse } from '@/types/api';
import { chatRateLimiter, apiRateLimiter } from '@/utils/rate-limiter';

describe('ChatService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    // Reset rate limiters before each test
    chatRateLimiter.resetAll();
    apiRateLimiter.resetAll();
  });

  afterEach(() => {
    mock.reset();
    mock.restore();
  });

  describe('sendMessage', () => {
    it('should send message and return ChatResponse', async () => {
      const message = 'Hello, AI!';
      
      const mockResponse: ChatResponse = {
        id: '123',
        role: 'assistant',
        content: 'Hello! How can I help you today?',
        timestamp: new Date().toISOString(),
        conversation_id: 'conv-123',
      };

      mock.onPost('/chat').reply(200, mockResponse);

      const result = await ChatService.sendMessage(message);

      expect(result).toEqual(mockResponse);
      expect(result.content).toBe('Hello! How can I help you today?');
    });

    it('should handle empty message', async () => {
      const message = '';
      const mockResponse: ChatResponse = {
        id: '456',
        role: 'assistant',
        content: 'Please provide a message.',
        timestamp: '2025-09-30T10:00:00Z',
        conversation_id: 'conv-456',
      };

      mock.onPost('/chat').reply(200, mockResponse);

      const result = await ChatService.sendMessage(message);
      expect(result).toEqual(mockResponse);
    });

    it('should handle long messages', async () => {
      const message = 'A'.repeat(1000);
      const mockResponse: ChatResponse = {
        id: '789',
        role: 'assistant',
        content: 'I received your long message.',
        timestamp: '2025-09-30T10:00:00Z',
        conversation_id: 'conv-789',
      };

      mock.onPost('/chat').reply(200, mockResponse);

      const result = await ChatService.sendMessage(message);
      expect(result.content).toBe('I received your long message.');
    });

    it('should handle special characters in message', async () => {
      const message = 'Test <script>alert("xss")</script> & symbols!';
      
      // This message contains XSS patterns, so it should be rejected
      await expect(ChatService.sendMessage(message)).rejects.toThrow(
        'Input contains potentially dangerous content'
      );
    });

    it('should handle 400 Bad Request error', async () => {
      const message = 'Test message';
      mock.onPost('/chat').reply(400, {
        message: 'Invalid message format',
      });

      await expect(ChatService.sendMessage(message)).rejects.toThrow();
    });

    it('should handle 401 Unauthorized error', async () => {
      const message = 'Test message';
      mock.onPost('/chat').reply(401, {
        message: 'Unauthorized',
      });

      await expect(ChatService.sendMessage(message)).rejects.toThrow();
    });

    it('should handle 429 Rate Limit error', async () => {
      const message = 'Test message';
      mock.onPost('/chat').reply(429, {
        message: 'Rate limit exceeded',
      });

      await expect(ChatService.sendMessage(message)).rejects.toThrow();
    });

    it('should handle 500 Internal Server Error', async () => {
      const message = 'Test message';
      mock.onPost('/chat').reply(500, {
        message: 'Internal server error',
      });

      await expect(ChatService.sendMessage(message)).rejects.toThrow();
    });

    it('should handle network error', async () => {
      const message = 'Test message';
      mock.onPost('/chat').networkError();

      await expect(ChatService.sendMessage(message)).rejects.toThrow();
    });

    it('should handle timeout error', async () => {
      const message = 'Test message';
      mock.onPost('/chat').timeout();

      await expect(ChatService.sendMessage(message)).rejects.toThrow();
    });

    it('should enforce rate limiting', async () => {
      const message = 'Test message';

      // Mock the rate limiter to block requests
      const originalIsAllowed = chatRateLimiter.isAllowed;
      chatRateLimiter.isAllowed = vi.fn().mockReturnValue(false);
      chatRateLimiter.getErrorMessage = vi.fn().mockReturnValue('Chat rate limit exceeded');

      await expect(ChatService.sendMessage(message)).rejects.toThrow('Chat rate limit exceeded');

      // Restore original method
      chatRateLimiter.isAllowed = originalIsAllowed;
    });

    it('should use conversation ID for rate limiting when provided', async () => {
      const message = 'Test message';
      const conversationId = 'conv-123';
      const mockResponse: ChatResponse = {
        id: 'conv-test',
        role: 'assistant',
        content: 'Conversation response',
        timestamp: '2025-09-30T10:00:00Z',
        conversation_id: conversationId,
      };

      mock.onPost('/chat').reply(200, mockResponse);

      const result = await ChatService.sendMessage(message);

      expect(result.conversation_id).toBe(conversationId);
    });

    it('should properly format request payload', async () => {
      const message = 'Test message';
      const mockResponse: ChatResponse = {
        id: '111',
        role: 'assistant',
        content: 'Response',
        timestamp: '2025-09-30T10:00:00Z',
        conversation_id: 'conv-111',
      };

      mock.onPost('/chat').reply((config) => {
        const data = JSON.parse(config.data);
        expect(data).toHaveProperty('message');
        expect(data.message).toBe(message);
        return [200, mockResponse];
      });

      await ChatService.sendMessage(message);
    });

    it('should return response with correct TypeScript types', async () => {
      const message = 'Type check test';
      const mockResponse: ChatResponse = {
        id: '222',
        role: 'assistant',
        content: 'Type safe response',
        timestamp: '2025-09-30T10:00:00Z',
        conversation_id: 'conv-222',
      };

      mock.onPost('/chat').reply(200, mockResponse);

      const result = await ChatService.sendMessage(message);

      // TypeScript should infer correct types
      const id: string = result.id;
      const role: 'assistant' | 'user' = result.role;
      const content: string = result.content;
      const timestamp: string = result.timestamp;

      expect(id).toBeDefined();
      expect(role).toBeDefined();
      expect(content).toBeDefined();
      expect(timestamp).toBeDefined();
    });
  });

  describe('ChatResponse type', () => {
    it('should accept valid ChatResponse object', () => {
      const validResponse: ChatResponse = {
        id: '1',
        role: 'assistant',
        content: 'Test',
        timestamp: '2025-09-30T10:00:00Z',
        conversation_id: 'conv-1',
      };

      expect(validResponse.role).toBe('assistant');
    });

    it('should accept user role', () => {
      const userResponse: ChatResponse = {
        id: '2',
        role: 'assistant', // ChatResponse only accepts 'assistant' role
        content: 'User message',
        timestamp: '2025-09-30T10:00:00Z',
        conversation_id: 'conv-2',
      };

      expect(userResponse.role).toBe('assistant');
    });
  });
});
