import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', false, 'baz')).toBe('foo baz');
    });

    it('should merge Tailwind classes correctly', () => {
      // twMerge deduplicates conflicting Tailwind classes
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });

    it('should handle arrays of classes', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar');
    });

    it('should handle objects of classes', () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
    });

    it('should handle mixed inputs', () => {
      expect(cn('foo', { bar: true }, ['baz'])).toBe('foo bar baz');
    });

    it('should handle undefined and null', () => {
      expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
    });

    it('should handle empty inputs', () => {
      expect(cn()).toBe('');
    });

    it('should handle only falsy values', () => {
      expect(cn(false, null, undefined)).toBe('');
    });

    it('should handle duplicate classes', () => {
      // cn doesn't deduplicate non-Tailwind classes, that's expected behavior
      expect(cn('foo', 'foo')).toBe('foo foo');
    });

    it('should handle complex Tailwind class merging', () => {
      // Tests that conflicting Tailwind utilities are properly merged
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
      expect(cn('bg-gray-100 bg-red-200')).toBe('bg-red-200');
    });
  });
});
