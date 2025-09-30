/**
 * Chat Service
 * 
 * API service for AI chat operations with security controls.
 */

import { post } from './api';
import type { ChatRequest, ChatResponse } from '@/types/api';
import { chatRateLimiter } from '@/utils/rate-limiter';
import { validateAndSanitize } from '@/utils/xss-protection';

export const chatService = {
  /**
   * Send a message to the AI assistant and get a response
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
      maxLength: 2000,
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
