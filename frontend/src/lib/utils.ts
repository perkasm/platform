/**
 * Utility Functions Module
 * 
 * This module provides common utility functions used throughout the application.
 * 
 * @module lib/utils
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges Tailwind CSS class names intelligently
 * 
 * This function uses clsx to conditionally construct className strings
 * and tailwind-merge to properly merge Tailwind CSS classes, ensuring
 * that conflicting classes are resolved correctly.
 * 
 * @param inputs - Variable number of class name values (strings, objects, arrays)
 * @returns Merged and optimized className string
 * 
 * @example
 * ```typescript
 * // Basic usage
 * cn('px-4 py-2', 'bg-blue-500') // => 'px-4 py-2 bg-blue-500'
 * 
 * // Conditional classes
 * cn('text-base', { 'font-bold': isActive }) // => 'text-base font-bold' (if isActive is true)
 * 
 * // Merging conflicting classes (later class wins)
 * cn('text-red-500', 'text-blue-500') // => 'text-blue-500'
 * cn('bg-gray-100 bg-red-200') // => 'bg-red-200'
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
