/**
 * Credit Cards Service Module
 * 
 * API service for credit card CRUD operations.
 * Provides methods to create, read, update, and delete credit cards.
 * 
 * @module services/cards
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
   * 
   * @param activeOnly - If true, only returns active cards (default: true)
   * @returns Promise resolving to a list of credit cards
   * 
   * @example
   * ```typescript
   * // Get all active cards
   * const activeCards = await cardsService.getCards();
   * 
   * // Get all cards including inactive
   * const allCards = await cardsService.getCards(false);
   * ```
   */
  async getCards(activeOnly: boolean = true): Promise<CreditCardList> {
    const params = activeOnly ? '?active_only=true' : '';
    return get<CreditCardList>(`/cards${params}`);
  },

  /**
   * Get a specific credit card by ID
   * 
   * @param cardId - Unique identifier of the credit card
   * @returns Promise resolving to the credit card details
   * 
   * @example
   * ```typescript
   * const card = await cardsService.getCard(123);
   * ```
   */
  async getCard(cardId: number): Promise<CreditCard> {
    return get<CreditCard>(`/cards/${cardId}`);
  },

  /**
   * Create a new credit card
   * 
   * @param data - Credit card details to create
   * @returns Promise resolving to the created credit card
   * 
   * @example
   * ```typescript
   * const newCard = await cardsService.createCard({
   *   name: 'Chase Sapphire Reserve',
   *   card_type: 'Travel Rewards',
   *   issuer: 'Chase',
   *   credit_limit: 10000,
   *   annual_fee: 550
   * });
   * ```
   */
  async createCard(data: CreditCardCreate): Promise<CreditCard> {
    return post<CreditCard>('/cards', data);
  },

  /**
   * Update an existing credit card
   * 
   * @param cardId - Unique identifier of the credit card
   * @param data - Partial credit card data to update
   * @returns Promise resolving to the updated credit card
   * 
   * @example
   * ```typescript
   * const updated = await cardsService.updateCard(123, {
   *   current_balance: 1500,
   *   current_points: 25000
   * });
   * ```
   */
  async updateCard(cardId: number, data: CreditCardUpdate): Promise<CreditCard> {
    return put<CreditCard>(`/cards/${cardId}`, data);
  },

  /**
   * Delete (deactivate) a credit card
   * 
   * Note: This typically deactivates the card rather than permanently deleting it
   * 
   * @param cardId - Unique identifier of the credit card
   * @returns Promise resolving when deletion is complete
   * 
   * @example
   * ```typescript
   * await cardsService.deleteCard(123);
   * ```
   */
  async deleteCard(cardId: number): Promise<void> {
    return del<void>(`/cards/${cardId}`);
  },
};
