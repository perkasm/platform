/**
 * React Query Hook for Chat
 * 
 * Custom hook for AI chat functionality.
 */

import { useMutation } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import type { ChatResponse } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to send chat messages
 */
export function useSendMessage() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      message,
      conversationId,
      includeContext,
    }: {
      message: string;
      conversationId?: string;
      includeContext?: boolean;
    }) => chatService.sendMessage(message, conversationId, includeContext),
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    },
  });
}
