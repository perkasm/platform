/**
 * Validation Schemas Tests
 */

import { describe, it, expect } from 'vitest';
import {
  chatMessageSchema,
  creditCardCreateSchema,
  creditCardUpdateSchema,
  emailSchema,
  passwordSchema,
  loginSchema,
  registrationSchema,
  pointsRedemptionSchema,
} from './validations';

describe('Validation Schemas', () => {
  describe('chatMessageSchema', () => {
    it('should validate a valid chat message', () => {
      const result = chatMessageSchema.safeParse({
        message: 'Hello, how can I optimize my rewards?',
      });

      expect(result.success).toBe(true);
    });

    it('should reject empty message', () => {
      const result = chatMessageSchema.safeParse({
        message: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Message cannot be empty');
      }
    });

    it('should reject message that is too long', () => {
      const longMessage = 'a'.repeat(2001);
      const result = chatMessageSchema.safeParse({
        message: longMessage,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('too long');
      }
    });

    it('should accept optional conversationId', () => {
      const result = chatMessageSchema.safeParse({
        message: 'Hello',
        conversationId: 'conv-123',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('creditCardCreateSchema', () => {
    it('should validate a valid credit card', () => {
      const result = creditCardCreateSchema.safeParse({
        name: 'Chase Sapphire Reserve',
        card_type: 'Travel',
        issuer: 'Chase',
        credit_limit: 25000,
      });

      expect(result.success).toBe(true);
    });

    it('should reject negative credit limit', () => {
      const result = creditCardCreateSchema.safeParse({
        name: 'Test Card',
        card_type: 'Travel',
        issuer: 'Test',
        credit_limit: -1000,
      });

      expect(result.success).toBe(false);
    });

    it('should validate last four digits', () => {
      const validResult = creditCardCreateSchema.safeParse({
        name: 'Test Card',
        card_type: 'Travel',
        issuer: 'Test',
        credit_limit: 10000,
        last_four: '1234',
      });

      expect(validResult.success).toBe(true);
    });

    it('should reject invalid last four digits', () => {
      const result = creditCardCreateSchema.safeParse({
        name: 'Test Card',
        card_type: 'Travel',
        issuer: 'Test',
        credit_limit: 10000,
        last_four: 'abcd',
      });

      expect(result.success).toBe(false);
    });

    it('should validate expiration date format', () => {
      const validResult = creditCardCreateSchema.safeParse({
        name: 'Test Card',
        card_type: 'Travel',
        issuer: 'Test',
        credit_limit: 10000,
        expiration_date: '12/25',
      });

      expect(validResult.success).toBe(true);
    });

    it('should reject invalid expiration date format', () => {
      const result = creditCardCreateSchema.safeParse({
        name: 'Test Card',
        card_type: 'Travel',
        issuer: 'Test',
        credit_limit: 10000,
        expiration_date: '2025-12',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('creditCardUpdateSchema', () => {
    it('should validate partial updates', () => {
      const result = creditCardUpdateSchema.safeParse({
        current_points: 50000,
      });

      expect(result.success).toBe(true);
    });

    it('should reject negative points', () => {
      const result = creditCardUpdateSchema.safeParse({
        current_points: -100,
      });

      expect(result.success).toBe(false);
    });

    it('should validate multiple fields', () => {
      const result = creditCardUpdateSchema.safeParse({
        current_points: 75000,
        available_credit: 20000,
        is_active: true,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('emailSchema', () => {
    it('should validate a valid email', () => {
      const result = emailSchema.safeParse('user@example.com');

      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = emailSchema.safeParse('not-an-email');

      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const result = emailSchema.safeParse('');

      expect(result.success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('should validate a strong password', () => {
      const result = passwordSchema.safeParse('MyP@ssw0rd123');

      expect(result.success).toBe(true);
    });

    it('should reject password without uppercase', () => {
      const result = passwordSchema.safeParse('mypassword123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('uppercase'))).toBe(true);
      }
    });

    it('should reject password without lowercase', () => {
      const result = passwordSchema.safeParse('MYPASSWORD123');

      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const result = passwordSchema.safeParse('MyPassword');

      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = passwordSchema.safeParse('Pass1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 8 characters');
      }
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login credentials', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid email in login', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('registrationSchema', () => {
    it('should validate valid registration', () => {
      const result = registrationSchema.safeParse({
        email: 'user@example.com',
        password: 'MyP@ssw0rd123',
        confirmPassword: 'MyP@ssw0rd123',
        fullName: 'John Doe',
      });

      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const result = registrationSchema.safeParse({
        email: 'user@example.com',
        password: 'MyP@ssw0rd123',
        confirmPassword: 'DifferentPassword123',
        fullName: 'John Doe',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes("don't match"))).toBe(true);
      }
    });

    it('should reject empty full name', () => {
      const result = registrationSchema.safeParse({
        email: 'user@example.com',
        password: 'MyP@ssw0rd123',
        confirmPassword: 'MyP@ssw0rd123',
        fullName: '',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('pointsRedemptionSchema', () => {
    it('should validate valid redemption', () => {
      const result = pointsRedemptionSchema.safeParse({
        cardId: 1,
        points: 50000,
        redemptionType: 'travel',
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid redemption type', () => {
      const result = pointsRedemptionSchema.safeParse({
        cardId: 1,
        points: 50000,
        redemptionType: 'invalid',
      });

      expect(result.success).toBe(false);
    });

    it('should reject negative points', () => {
      const result = pointsRedemptionSchema.safeParse({
        cardId: 1,
        points: -1000,
        redemptionType: 'cashback',
      });

      expect(result.success).toBe(false);
    });

    it('should accept optional description', () => {
      const result = pointsRedemptionSchema.safeParse({
        cardId: 1,
        points: 50000,
        redemptionType: 'transfer',
        description: 'Transfer to United Airlines',
      });

      expect(result.success).toBe(true);
    });
  });
});
