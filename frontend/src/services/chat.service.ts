/**
 * Chat Service
 * 
 * API service for AI chat operations.
 */

import { post } from './api';
import type { ChatRequest, ChatResponse } from '@/types/api';

export const chatService = {
  /**
   * Send a message to the AI assistant and get a response
   */
  async sendMessage(
    message: string,
    conversationId?: string,
    includeContext: boolean = true
  ): Promise<ChatResponse> {
    const request: ChatRequest = {
      message,
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
