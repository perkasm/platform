/**
 * Accessibility Utilities
 * Provides utilities for improving accessibility and ARIA support
 */

/**
 * Generate a unique ID for ARIA relationships
 */
export function generateAriaId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if an element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  
  return !(
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    element.getAttribute('aria-hidden') === 'true' ||
    element.hasAttribute('hidden')
  );
}

/**
 * Get accessible name for an element
 */
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // Check aria-labelledby
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    if (labelElement) return labelElement.textContent || '';
  }

  // Check associated label
  const id = element.getAttribute('id');
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) return label.textContent || '';
  }

  // Check placeholder (not recommended as primary label)
  const placeholder = element.getAttribute('placeholder');
  if (placeholder) return placeholder;

  // Return element text content
  return element.textContent || '';
}

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Trap focus within a container (for modals, dialogs)
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  },

  /**
   * Save and restore focus
   */
  saveFocus(): () => void {
    const previouslyFocused = document.activeElement as HTMLElement;

    return () => {
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    };
  },

  /**
   * Focus first error in a form
   */
  focusFirstError(formElement: HTMLElement): void {
    const errorElement = formElement.querySelector<HTMLElement>(
      '[aria-invalid="true"], .error input, .error select, .error textarea'
    );

    if (errorElement) {
      errorElement.focus();
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },
};

/**
 * Keyboard navigation utilities
 */
export const keyboardNavigation = {
  /**
   * Handle arrow key navigation in a list
   */
  handleArrowKeys(
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onSelect: (index: number) => void
  ): void {
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
      case 'Down':
        event.preventDefault();
        nextIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowUp':
      case 'Up':
        event.preventDefault();
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelect(currentIndex);
        return;
      default:
        return;
    }

    if (nextIndex !== currentIndex) {
      items[nextIndex]?.focus();
      onSelect(nextIndex);
    }
  },

  /**
   * Handle escape key to close dialogs/menus
   */
  handleEscape(event: KeyboardEvent, onEscape: () => void): void {
    if (event.key === 'Escape' || event.key === 'Esc') {
      event.preventDefault();
      onEscape();
    }
  },
};

/**
 * ARIA live region utilities
 */
export const liveRegion = {
  /**
   * Create a live region for dynamic content
   */
  create(priority: 'polite' | 'assertive' = 'polite'): HTMLElement {
    const region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
    return region;
  },

  /**
   * Update live region content
   */
  update(region: HTMLElement, message: string): void {
    region.textContent = message;
  },

  /**
   * Remove live region
   */
  remove(region: HTMLElement): void {
    region.remove();
  },
};

/**
 * Color contrast utilities
 */
export const colorContrast = {
  /**
   * Calculate relative luminance (WCAG 2.1)
   */
  getLuminance(color: string): number {
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  },

  /**
   * Calculate contrast ratio (WCAG 2.1)
   */
  getContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getLuminance(color1);
    const lum2 = this.getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Check if contrast meets WCAG AA standards
   */
  meetsWCAG_AA(color1: string, color2: string, largeText = false): boolean {
    const ratio = this.getContrastRatio(color1, color2);
    return largeText ? ratio >= 3 : ratio >= 4.5;
  },

  /**
   * Check if contrast meets WCAG AAA standards
   */
  meetsWCAG_AAA(color1: string, color2: string, largeText = false): boolean {
    const ratio = this.getContrastRatio(color1, color2);
    return largeText ? ratio >= 4.5 : ratio >= 7;
  },

  /**
   * Convert hex color to RGB
   */
  hexToRgb(hex: string): [number, number, number] | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : null;
  },
};

/**
 * Skip link utilities
 */
export function createSkipLink(targetId: string, label = 'Skip to main content'): HTMLAnchorElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.className = 'skip-link';
  skipLink.textContent = label;
  
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.addEventListener('blur', () => {
        target.removeAttribute('tabindex');
      }, { once: true });
    }
  });

  return skipLink;
}

/**
 * Form accessibility utilities
 */
export const formAccessibility = {
  /**
   * Associate error message with input
   */
  setFieldError(inputId: string, errorMessage: string): void {
    const input = document.getElementById(inputId);
    if (!input) return;

    const errorId = `${inputId}-error`;
    let errorElement = document.getElementById(errorId);

    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.className = 'error-message';
      errorElement.setAttribute('role', 'alert');
      input.parentNode?.appendChild(errorElement);
    }

    errorElement.textContent = errorMessage;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorId);
  },

  /**
   * Clear field error
   */
  clearFieldError(inputId: string): void {
    const input = document.getElementById(inputId);
    if (!input) return;

    const errorId = `${inputId}-error`;
    const errorElement = document.getElementById(errorId);

    if (errorElement) {
      errorElement.remove();
    }

    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  },
};
