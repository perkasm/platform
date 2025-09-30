/**
 * Validation Schemas Module
 * 
 * This module provides Zod schemas for validating user inputs and forms
 * throughout the application. All validation logic is centralized here
 * to ensure consistency and maintainability.
 * 
 * @module lib/validations
 */

import { z } from 'zod';
import { VALIDATION_LIMITS } from '@/constants';

/**
 * Chat message validation schema
 * Validates chat message input with length constraints
 */
export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(VALIDATION_LIMITS.CHAT_MESSAGE_MAX_LENGTH, `Message is too long (max ${VALIDATION_LIMITS.CHAT_MESSAGE_MAX_LENGTH} characters)`),
  conversationId: z.string().optional(),
  includeContext: z.boolean().optional().default(true),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

/**
 * Credit card creation validation schema
 * Validates all required and optional fields for creating a new credit card
 */
export const creditCardCreateSchema = z.object({
  name: z.string()
    .min(1, 'Card name is required')
    .max(VALIDATION_LIMITS.CARD_NAME_MAX_LENGTH, 'Card name is too long'),
  card_type: z.string()
    .min(1, 'Card type is required'),
  issuer: z.string()
    .min(1, 'Issuer is required'),
  network: z.string().optional(),
  credit_limit: z.number()
    .positive('Credit limit must be positive'),
  annual_fee: z.number()
    .nonnegative('Annual fee cannot be negative')
    .default(0),
  last_four: z.string()
    .length(4, 'Last four digits must be exactly 4 characters')
    .regex(/^\d{4}$/, 'Last four must be digits')
    .optional(),
  expiration_date: z.string()
    .regex(/^\d{2}\/\d{2}$/, 'Expiration date must be in MM/YY format')
    .optional(),
  has_welcome_bonus: z.boolean().optional().default(false),
  welcome_bonus_required: z.number()
    .nonnegative('Welcome bonus requirement cannot be negative')
    .optional()
    .default(0),
  welcome_bonus_deadline: z.string().optional(),
});

export type CreditCardCreateInput = z.infer<typeof creditCardCreateSchema>;

/**
 * Credit card update validation schema
 * Validates partial updates to existing credit cards (all fields optional)
 */
export const creditCardUpdateSchema = z.object({
  name: z.string()
    .min(1, 'Card name is required')
    .max(VALIDATION_LIMITS.CARD_NAME_MAX_LENGTH, 'Card name is too long')
    .optional(),
  card_type: z.string().optional(),
  issuer: z.string().optional(),
  network: z.string().optional(),
  credit_limit: z.number()
    .positive('Credit limit must be positive')
    .optional(),
  available_credit: z.number()
    .nonnegative('Available credit cannot be negative')
    .optional(),
  current_balance: z.number()
    .nonnegative('Current balance cannot be negative')
    .optional(),
  current_points: z.number()
    .int('Points must be an integer')
    .nonnegative('Points cannot be negative')
    .optional(),
  annual_fee: z.number()
    .nonnegative('Annual fee cannot be negative')
    .optional(),
  is_active: z.boolean().optional(),
  welcome_bonus_spent: z.number()
    .nonnegative('Welcome bonus spent cannot be negative')
    .optional(),
});

export type CreditCardUpdateInput = z.infer<typeof creditCardUpdateSchema>;

/**
 * Spending amount validation
 * Validates monetary amounts with reasonable upper limit
 */
export const spendingAmountSchema = z.number()
  .positive('Amount must be positive')
  .max(1000000, 'Amount is unreasonably high');

/**
 * Email validation schema
 * Validates email address format
 */
export const emailSchema = z.string()
  .email('Invalid email address')
  .min(1, 'Email is required');

/**
 * Password validation schema
 * Enforces strong password requirements with complexity rules
 */
export const passwordSchema = z.string()
  .min(VALIDATION_LIMITS.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION_LIMITS.PASSWORD_MIN_LENGTH} characters`)
  .max(VALIDATION_LIMITS.PASSWORD_MAX_LENGTH, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Login form validation schema
 * Validates user login credentials
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Registration form validation schema
 * Validates user registration with password confirmation
 */
export const registrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  fullName: z.string()
    .min(1, 'Full name is required')
    .max(VALIDATION_LIMITS.FULL_NAME_MAX_LENGTH, 'Full name is too long'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

/**
 * Search query validation
 * Validates search input with length constraints
 */
export const searchQuerySchema = z.string()
  .min(1, 'Search query cannot be empty')
  .max(VALIDATION_LIMITS.SEARCH_QUERY_MAX_LENGTH, 'Search query is too long');

/**
 * Points redemption validation
 * Validates credit card points redemption requests
 */
export const pointsRedemptionSchema = z.object({
  cardId: z.number().int().positive('Invalid card ID'),
  points: z.number().int().positive('Points must be positive'),
  redemptionType: z.enum(['travel', 'cashback', 'statement_credit', 'transfer']),
  description: z.string().max(VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH, 'Description is too long').optional(),
});

export type PointsRedemptionInput = z.infer<typeof pointsRedemptionSchema>;
