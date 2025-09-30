/**
 * Credit Cards Service
 * 
 * API service for credit card operations.
 */

import { get, post, put, del } from './api';
import type {
  CreditCard,
  CreditCardCreate,
  CreditCardUpdate,
  CreditCardList,
} from '@/types/api';

export const cardsService = {
  /**
   * Get all credit cards for the current user
   */
  async getCards(activeOnly: boolean = true): Promise<CreditCardList> {
    const params = activeOnly ? '?active_only=true' : '';
    return get<CreditCardList>(`/cards${params}`);
  },

  /**
   * Get a specific credit card by ID
   */
  async getCard(cardId: number): Promise<CreditCard> {
    return get<CreditCard>(`/cards/${cardId}`);
  },

  /**
   * Create a new credit card
   */
  async createCard(data: CreditCardCreate): Promise<CreditCard> {
    return post<CreditCard>('/cards', data);
  },

  /**
   * Update an existing credit card
   */
  async updateCard(cardId: number, data: CreditCardUpdate): Promise<CreditCard> {
    return put<CreditCard>(`/cards/${cardId}`, data);
  },

  /**
   * Delete (deactivate) a credit card
   */
  async deleteCard(cardId: number): Promise<void> {
    return del<void>(`/cards/${cardId}`);
  },
};
