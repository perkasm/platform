/**
 * Validation Schemas
 * 
 * Zod schemas for validating user inputs and forms.
 */

import { z } from 'zod';

/**
 * Chat message validation schema
 */
export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message is too long (max 2000 characters)'),
  conversationId: z.string().optional(),
  includeContext: z.boolean().optional().default(true),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

/**
 * Credit card creation validation schema
 */
export const creditCardCreateSchema = z.object({
  name: z.string()
    .min(1, 'Card name is required')
    .max(100, 'Card name is too long'),
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
 */
export const creditCardUpdateSchema = z.object({
  name: z.string()
    .min(1, 'Card name is required')
    .max(100, 'Card name is too long')
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
 */
export const spendingAmountSchema = z.number()
  .positive('Amount must be positive')
  .max(1000000, 'Amount is unreasonably high');

/**
 * Email validation schema
 */
export const emailSchema = z.string()
  .email('Invalid email address')
  .min(1, 'Email is required');

/**
 * Password validation schema
 */
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Registration form validation schema
 */
export const registrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  fullName: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name is too long'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

/**
 * Search query validation
 */
export const searchQuerySchema = z.string()
  .min(1, 'Search query cannot be empty')
  .max(200, 'Search query is too long');

/**
 * Points redemption validation
 */
export const pointsRedemptionSchema = z.object({
  cardId: z.number().int().positive('Invalid card ID'),
  points: z.number().int().positive('Points must be positive'),
  redemptionType: z.enum(['travel', 'cashback', 'statement_credit', 'transfer']),
  description: z.string().max(500, 'Description is too long').optional(),
});

export type PointsRedemptionInput = z.infer<typeof pointsRedemptionSchema>;
