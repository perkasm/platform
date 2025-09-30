/**
 * Chat Service Module
 * 
 * API service for AI chat operations with security controls including
 * rate limiting, input validation, and XSS protection.
 * 
 * @module services/chat
 */

import { post } from './api';
import type { ChatRequest, ChatResponse } from '@/types/api';
import { chatRateLimiter } from '@/utils/rate-limiter';
import { validateAndSanitize } from '@/utils/xss-protection';
import { VALIDATION_LIMITS } from '@/constants';

export const chatService = {
  /**
   * Send a message to the AI assistant and get a response
   * 
   * This method includes:
   * - Rate limiting to prevent abuse
   * - Input validation and sanitization
   * - XSS protection
   * 
   * @param message - The user's message to send
   * @param conversationId - Optional conversation ID for context
   * @param includeContext - Whether to include conversation history
   * @returns Promise resolving to AI chat response
   * @throws {Error} If rate limit is exceeded or validation fails
   * 
   * @example
   * ```typescript
   * const response = await chatService.sendMessage(
   *   'What are the best rewards cards?',
   *   'conv-123',
   *   true
   * );
   * ```
   */
  async sendMessage(
    message: string,
    conversationId?: string,
    includeContext: boolean = true
  ): Promise<ChatResponse> {
    // Rate limiting check
    const userId = conversationId || 'anonymous';
    if (!chatRateLimiter.isAllowed(userId)) {
      throw new Error(chatRateLimiter.getErrorMessage());
    }

    // Validate and sanitize input
    const validation = validateAndSanitize(message, {
      maxLength: VALIDATION_LIMITS.CHAT_MESSAGE_MAX_LENGTH,
      allowHtml: false,
      checkXssPatterns: true,
    });

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Use sanitized message
    const request: ChatRequest = {
      message: validation.sanitized,
      conversation_id: conversationId,
      include_context: includeContext,
    };
    
    return post<ChatResponse>('/chat', request);
  },
};

// Export legacy ChatService for backward compatibility
export const ChatService = {
  sendMessage: async (message: string): Promise<ChatResponse> => {
    return chatService.sendMessage(message);
  },
};
