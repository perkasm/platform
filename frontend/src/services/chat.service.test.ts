import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/services/api';
import { ChatService, ChatResponse } from '@/services/chat.service';

describe('ChatService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
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
        content: 'Hello! How can I help you?',
        timestamp: '2025-09-30T10:00:00Z',
      };

      mock.onPost('/chat', { message }).reply(200, mockResponse);

      const result = await ChatService.sendMessage(message);

      expect(result).toEqual(mockResponse);
      expect(result.id).toBe('123');
      expect(result.role).toBe('assistant');
      expect(result.content).toBe('Hello! How can I help you?');
    });

    it('should handle empty message', async () => {
      const message = '';
      const mockResponse: ChatResponse = {
        id: '456',
        role: 'assistant',
        content: 'Please provide a message.',
        timestamp: '2025-09-30T10:00:00Z',
      };

      mock.onPost('/chat', { message }).reply(200, mockResponse);

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
      };

      mock.onPost('/chat', { message }).reply(200, mockResponse);

      const result = await ChatService.sendMessage(message);
      expect(result.content).toBe('I received your long message.');
    });

    it('should handle special characters in message', async () => {
      const message = 'Test <script>alert("xss")</script> & symbols!';
      const mockResponse: ChatResponse = {
        id: '999',
        role: 'assistant',
        content: 'Message received safely.',
        timestamp: '2025-09-30T10:00:00Z',
      };

      mock.onPost('/chat', { message }).reply(200, mockResponse);

      const result = await ChatService.sendMessage(message);
      expect(result).toEqual(mockResponse);
    });

    it('should handle 400 Bad Request error', async () => {
      const message = 'Test message';
      mock.onPost('/chat', { message }).reply(400, {
        message: 'Invalid message format',
      });

      await expect(ChatService.sendMessage(message)).rejects.toThrow();
    });

    it('should handle 401 Unauthorized error', async () => {
      const message = 'Test message';
      mock.onPost('/chat', { message }).reply(401, {
        message: 'Unauthorized',
      });

      await expect(ChatService.sendMessage(message)).rejects.toThrow();
    });

    it('should handle 429 Rate Limit error', async () => {
      const message = 'Test message';
      mock.onPost('/chat', { message }).reply(429, {
        message: 'Rate limit exceeded',
      });

      await expect(ChatService.sendMessage(message)).rejects.toThrow();
    });

    it('should handle 500 Internal Server Error', async () => {
      const message = 'Test message';
      mock.onPost('/chat', { message }).reply(500, {
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

    it('should properly format request payload', async () => {
      const message = 'Test message';
      const mockResponse: ChatResponse = {
        id: '111',
        role: 'assistant',
        content: 'Response',
        timestamp: '2025-09-30T10:00:00Z',
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
      };

      mock.onPost('/chat', { message }).reply(200, mockResponse);

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
      };

      expect(validResponse.role).toBe('assistant');
    });

    it('should accept user role', () => {
      const userResponse: ChatResponse = {
        id: '2',
        role: 'user',
        content: 'User message',
        timestamp: '2025-09-30T10:00:00Z',
      };

      expect(userResponse.role).toBe('user');
    });
  });
});
