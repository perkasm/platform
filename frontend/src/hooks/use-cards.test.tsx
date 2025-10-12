import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCards, useCard, useCreateCard, useUpdateCard, useDeleteCard, cardsKeys } from './use-cards';
import { cardsService } from '@/services/cards.service';
import type { CreditCardCreate, CreditCardUpdate } from '@/types/api';

// Mock the services
vi.mock('@/services/cards.service', () => ({
  cardsService: {
    getCards: vi.fn(),
    getCard: vi.fn(),
    createCard: vi.fn(),
    updateCard: vi.fn(),
    deleteCard: vi.fn(),
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

describe('useCards', () => {
  const mockCards = [
    {
      id: 1,
      user_id: 1,
      name: 'Chase Sapphire Preferred',
      card_type: 'Travel',
      issuer: 'Chase',
      network: 'Visa',
      credit_limit: 10000,
      available_credit: 8000,
      current_balance: 2000,
      current_points: 50000,
      points_currency: 'Ultimate Rewards',
      utilization_rate: 20,
      utilization_score: 85,
      last_four: '1234',
      expiration_date: '2026-12-31',
      annual_fee: 95,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  const mockCardList = { cards: mockCards, total: 1 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCards', () => {
    it('should fetch cards with activeOnly=true by default', async () => {
      const mockGetCards = vi.mocked(cardsService.getCards);
      mockGetCards.mockResolvedValue(mockCardList);

      const { result } = renderHook(() => useCards(), { wrapper: createWrapper() });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetCards).toHaveBeenCalledWith(true);
      expect(result.current.data).toEqual(mockCardList);
    });

    it('should fetch cards with activeOnly=false when specified', async () => {
      const mockGetCards = vi.mocked(cardsService.getCards);
      mockGetCards.mockResolvedValue(mockCardList);

      const { result } = renderHook(() => useCards(false), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetCards).toHaveBeenCalledWith(false);
    });

    it('should handle error state', async () => {
      const mockGetCards = vi.mocked(cardsService.getCards);
      const error = new Error('Failed to fetch cards');
      mockGetCards.mockRejectedValue(error);

      const { result } = renderHook(() => useCards(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useCard', () => {
    it('should fetch a single card by id', async () => {
      const mockGetCard = vi.mocked(cardsService.getCard);
      mockGetCard.mockResolvedValue(mockCards[0]);

      const { result } = renderHook(() => useCard(1), { wrapper: createWrapper() });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetCard).toHaveBeenCalledWith(1);
      expect(result.current.data).toEqual(mockCards[0]);
    });

    it('should not fetch when cardId is falsy', () => {
      const mockGetCard = vi.mocked(cardsService.getCard);

      const { result } = renderHook(() => useCard(0), { wrapper: createWrapper() });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(mockGetCard).not.toHaveBeenCalled();
    });

    it('should handle error state', async () => {
      const mockGetCard = vi.mocked(cardsService.getCard);
      const error = new Error('Card not found');
      mockGetCard.mockRejectedValue(error);

      const { result } = renderHook(() => useCard(1), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useCreateCard', () => {
    it('should create a card successfully', async () => {
      const mockCreateCard = vi.mocked(cardsService.createCard);
      const newCard = { ...mockCards[0], id: 2, name: 'New Card' };
      mockCreateCard.mockResolvedValue(newCard);

      const { result } = renderHook(() => useCreateCard(), { wrapper: createWrapper() });

      const cardData: CreditCardCreate = {
        name: 'New Card',
        card_type: 'Cashback',
        issuer: 'Bank',
        credit_limit: 5000,
      };

      result.current.mutate(cardData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockCreateCard).toHaveBeenCalledWith(cardData);
      expect(result.current.data).toEqual(newCard);
    });

    it('should handle create error', async () => {
      const mockCreateCard = vi.mocked(cardsService.createCard);
      const error = new Error('Failed to create card');
      mockCreateCard.mockRejectedValue(error);

      const { result } = renderHook(() => useCreateCard(), { wrapper: createWrapper() });

      const cardData: CreditCardCreate = {
        name: 'New Card',
        card_type: 'Cashback',
        issuer: 'Bank',
        credit_limit: 5000,
      };

      result.current.mutate(cardData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useUpdateCard', () => {
    it('should update a card successfully', async () => {
      const mockUpdateCard = vi.mocked(cardsService.updateCard);
      const updatedCard = { ...mockCards[0], name: 'Updated Card Name' };
      mockUpdateCard.mockResolvedValue(updatedCard);

      const { result } = renderHook(() => useUpdateCard(), { wrapper: createWrapper() });

      const updateData: CreditCardUpdate = {
        name: 'Updated Card Name',
      };

      result.current.mutate({ cardId: 1, data: updateData });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockUpdateCard).toHaveBeenCalledWith(1, updateData);
      expect(result.current.data).toEqual(updatedCard);
    });

    it('should handle update error', async () => {
      const mockUpdateCard = vi.mocked(cardsService.updateCard);
      const error = new Error('Failed to update card');
      mockUpdateCard.mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateCard(), { wrapper: createWrapper() });

      const updateData: CreditCardUpdate = {
        name: 'Updated Card Name',
      };

      result.current.mutate({ cardId: 1, data: updateData });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useDeleteCard', () => {
    it('should delete a card successfully', async () => {
      const mockDeleteCard = vi.mocked(cardsService.deleteCard);
      mockDeleteCard.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteCard(), { wrapper: createWrapper() });

      result.current.mutate(1);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockDeleteCard).toHaveBeenCalledWith(1);
    });

    it('should handle delete error', async () => {
      const mockDeleteCard = vi.mocked(cardsService.deleteCard);
      const error = new Error('Failed to delete card');
      mockDeleteCard.mockRejectedValue(error);

      const { result } = renderHook(() => useDeleteCard(), { wrapper: createWrapper() });

      result.current.mutate(1);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('cardsKeys', () => {
    it('should generate correct query keys', () => {
      expect(cardsKeys.all).toEqual(['cards']);
      expect(cardsKeys.lists()).toEqual(['cards', 'list']);
      expect(cardsKeys.list(true)).toEqual(['cards', 'list', { activeOnly: true }]);
      expect(cardsKeys.details()).toEqual(['cards', 'detail']);
      expect(cardsKeys.detail(1)).toEqual(['cards', 'detail', 1]);
    });
  });
});