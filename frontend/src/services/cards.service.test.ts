/**
 * Cards Service Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cardsService } from './cards.service';
import * as api from './api';
import type { CreditCard, CreditCardCreate, CreditCardUpdate } from '@/types/api';

// Mock the api module
vi.mock('./api');

describe('cardsService', () => {
  const mockCard: CreditCard = {
    id: 1,
    user_id: 1,
    name: 'Chase Sapphire Reserve',
    card_type: 'Travel',
    issuer: 'Chase',
    network: 'Visa',
    credit_limit: 25000,
    available_credit: 18500,
    current_balance: 6500,
    current_points: 87650,
    points_currency: 'Chase UR',
    utilization_rate: 26,
    utilization_score: 90,
    last_four: '1234',
    expiration_date: '12/25',
    annual_fee: 550,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCards', () => {
    it('should fetch all active cards by default', async () => {
      const mockResponse = {
        cards: [mockCard],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await cardsService.getCards();

      expect(api.get).toHaveBeenCalledWith('/cards?active_only=true');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch all cards including inactive when specified', async () => {
      const mockResponse = {
        cards: [mockCard],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await cardsService.getCards(false);

      expect(api.get).toHaveBeenCalledWith('/cards');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCard', () => {
    it('should fetch a specific card by ID', async () => {
      vi.mocked(api.get).mockResolvedValue(mockCard);

      const result = await cardsService.getCard(1);

      expect(api.get).toHaveBeenCalledWith('/cards/1');
      expect(result).toEqual(mockCard);
    });
  });

  describe('createCard', () => {
    it('should create a new card', async () => {
      const newCardData: CreditCardCreate = {
        name: 'Amex Platinum',
        card_type: 'Travel',
        issuer: 'American Express',
        credit_limit: 30000,
        annual_fee: 695,
      };

      vi.mocked(api.post).mockResolvedValue(mockCard);

      const result = await cardsService.createCard(newCardData);

      expect(api.post).toHaveBeenCalledWith('/cards', newCardData);
      expect(result).toEqual(mockCard);
    });
  });

  describe('updateCard', () => {
    it('should update an existing card', async () => {
      const updateData: CreditCardUpdate = {
        current_points: 90000,
        available_credit: 20000,
      };

      const updatedCard = { ...mockCard, ...updateData };
      vi.mocked(api.put).mockResolvedValue(updatedCard);

      const result = await cardsService.updateCard(1, updateData);

      expect(api.put).toHaveBeenCalledWith('/cards/1', updateData);
      expect(result).toEqual(updatedCard);
    });
  });

  describe('deleteCard', () => {
    it('should delete a card', async () => {
      vi.mocked(api.del).mockResolvedValue(undefined);

      await cardsService.deleteCard(1);

      expect(api.del).toHaveBeenCalledWith('/cards/1');
    });
  });
});
