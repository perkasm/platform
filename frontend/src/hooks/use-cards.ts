/**
 * React Query Hooks for Credit Cards
 * 
 * Custom hooks for fetching and mutating credit card data.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsService } from '@/services/cards.service';
import type {
  CreditCard,
  CreditCardCreate,
  CreditCardUpdate,
  CreditCardList,
} from '@/types/api';
import { useToast } from '@/hooks/use-toast';

// Query keys
export const cardsKeys = {
  all: ['cards'] as const,
  lists: () => [...cardsKeys.all, 'list'] as const,
  list: (activeOnly: boolean) => [...cardsKeys.lists(), { activeOnly }] as const,
  details: () => [...cardsKeys.all, 'detail'] as const,
  detail: (id: number) => [...cardsKeys.details(), id] as const,
};

/**
 * Hook to fetch all cards
 */
export function useCards(activeOnly: boolean = true) {
  return useQuery({
    queryKey: cardsKeys.list(activeOnly),
    queryFn: () => cardsService.getCards(activeOnly),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single card
 */
export function useCard(cardId: number) {
  return useQuery({
    queryKey: cardsKeys.detail(cardId),
    queryFn: () => cardsService.getCard(cardId),
    enabled: !!cardId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create a new card
 */
export function useCreateCard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreditCardCreate) => cardsService.createCard(data),
    onSuccess: (newCard) => {
      // Invalidate and refetch cards list
      queryClient.invalidateQueries({ queryKey: cardsKeys.lists() });
      
      // Optimistically add the new card to the cache
      queryClient.setQueryData<CreditCardList>(
        cardsKeys.list(true),
        (old) => {
          if (!old) return { cards: [newCard], total: 1 };
          return {
            cards: [...old.cards, newCard],
            total: old.total + 1,
          };
        }
      );

      toast({
        title: 'Card added',
        description: `${newCard.name} has been added to your portfolio.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add card',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update a card
 */
export function useUpdateCard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ cardId, data }: { cardId: number; data: CreditCardUpdate }) =>
      cardsService.updateCard(cardId, data),
    onSuccess: (updatedCard) => {
      // Update the specific card in cache
      queryClient.setQueryData<CreditCard>(
        cardsKeys.detail(updatedCard.id),
        updatedCard
      );

      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: cardsKeys.lists() });

      toast({
        title: 'Card updated',
        description: `${updatedCard.name} has been updated.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update card',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to delete a card
 */
export function useDeleteCard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (cardId: number) => cardsService.deleteCard(cardId),
    onSuccess: (_, cardId) => {
      // Remove card from cache
      queryClient.removeQueries({ queryKey: cardsKeys.detail(cardId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: cardsKeys.lists() });

      toast({
        title: 'Card removed',
        description: 'The card has been removed from your portfolio.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove card',
        variant: 'destructive',
      });
    },
  });
}
