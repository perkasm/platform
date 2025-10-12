import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  generateAriaId,
  announceToScreenReader,
  isVisibleToScreenReader,
  getAccessibleName,
  keyboardNavigation,
  liveRegion,
  colorContrast,
  createSkipLink,
  formAccessibility,
} from '../accessibility';

describe('Accessibility Utilities', () => {
  describe('generateAriaId', () => {
    it('should generate unique IDs with prefix', () => {
      const id1 = generateAriaId('test');
      const id2 = generateAriaId('test');
      expect(id1).toMatch(/^test-/);
      expect(id2).toMatch(/^test-/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('announceToScreenReader', () => {
    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should create announcement element', () => {
      announceToScreenReader('Test message');
      const announcement = document.querySelector('[role="status"]');
      expect(announcement).toBeTruthy();
      expect(announcement?.textContent).toBe('Test message');
    });

    it('should set aria-live to polite by default', () => {
      announceToScreenReader('Test message');
      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.getAttribute('aria-live')).toBe('polite');
    });

    it('should set aria-live to assertive when specified', () => {
      announceToScreenReader('Urgent message', 'assertive');
      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.getAttribute('aria-live')).toBe('assertive');
    });
  });

  describe('isVisibleToScreenReader', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
    });

    afterEach(() => {
      element.remove();
    });

    it('should return true for visible elements', () => {
      expect(isVisibleToScreenReader(element)).toBe(true);
    });

    it('should return false for hidden elements', () => {
      element.style.display = 'none';
      expect(isVisibleToScreenReader(element)).toBe(false);
    });

    it('should return false for invisible elements', () => {
      element.style.visibility = 'hidden';
      expect(isVisibleToScreenReader(element)).toBe(false);
    });

    it('should return false for aria-hidden elements', () => {
      element.setAttribute('aria-hidden', 'true');
      expect(isVisibleToScreenReader(element)).toBe(false);
    });
  });

  describe('getAccessibleName', () => {
    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should return aria-label', () => {
      const element = document.createElement('button');
      element.setAttribute('aria-label', 'Close dialog');
      expect(getAccessibleName(element)).toBe('Close dialog');
    });

    it('should return labelledby element text', () => {
      const label = document.createElement('div');
      label.id = 'label-id';
      label.textContent = 'Label text';
      document.body.appendChild(label);

      const element = document.createElement('input');
      element.setAttribute('aria-labelledby', 'label-id');
      expect(getAccessibleName(element)).toBe('Label text');
    });

    it('should return associated label text', () => {
      const label = document.createElement('label');
      label.setAttribute('for', 'input-id');
      label.textContent = 'Name';
      document.body.appendChild(label);

      const element = document.createElement('input');
      element.id = 'input-id';
      expect(getAccessibleName(element)).toBe('Name');
    });

    it('should return placeholder when no other labels exist', () => {
      const element = document.createElement('input');
      element.setAttribute('placeholder', 'Enter your name');
      expect(getAccessibleName(element)).toBe('Enter your name');
    });

    it('should return element text content when no other labels exist', () => {
      const element = document.createElement('button');
      element.textContent = 'Submit';
      expect(getAccessibleName(element)).toBe('Submit');
    });

    it('should return empty string when no accessible name found', () => {
      const element = document.createElement('div');
      expect(getAccessibleName(element)).toBe('');
    });
  });

  describe('colorContrast', () => {
    describe('getContrastRatio', () => {
      it('should calculate contrast ratio correctly', () => {
        // Black on white should be 21:1
        const ratio = colorContrast.getContrastRatio('#000000', '#ffffff');
        expect(ratio).toBeCloseTo(21, 0);
      });

      it('should calculate same color contrast', () => {
        const ratio = colorContrast.getContrastRatio('#ffffff', '#ffffff');
        expect(ratio).toBe(1);
      });
    });

    describe('meetsWCAG_AA', () => {
      it('should pass for high contrast', () => {
        expect(colorContrast.meetsWCAG_AA('#000000', '#ffffff')).toBe(true);
      });

      it('should fail for low contrast', () => {
        expect(colorContrast.meetsWCAG_AA('#cccccc', '#ffffff')).toBe(false);
      });

      it('should use different threshold for large text', () => {
        expect(colorContrast.meetsWCAG_AA('#777777', '#ffffff', true)).toBe(true);
        expect(colorContrast.meetsWCAG_AA('#777777', '#ffffff', false)).toBe(false);
      });
    });

    describe('meetsWCAG_AAA', () => {
      it('should pass for very high contrast', () => {
        expect(colorContrast.meetsWCAG_AAA('#000000', '#ffffff')).toBe(true);
      });

      it('should fail for medium contrast', () => {
        expect(colorContrast.meetsWCAG_AAA('#666666', '#ffffff')).toBe(false);
      });
    });

    describe('hexToRgb', () => {
      it('should convert hex to RGB', () => {
        expect(colorContrast.hexToRgb('#ffffff')).toEqual([255, 255, 255]);
        expect(colorContrast.hexToRgb('#000000')).toEqual([0, 0, 0]);
        expect(colorContrast.hexToRgb('#ff0000')).toEqual([255, 0, 0]);
      });

      it('should handle hex without hash', () => {
        expect(colorContrast.hexToRgb('ffffff')).toEqual([255, 255, 255]);
      });

      it('should return null for invalid hex', () => {
        expect(colorContrast.hexToRgb('invalid')).toBeNull();
      });
    });
  });

  describe('liveRegion', () => {
    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should create live region', () => {
      const region = liveRegion.create();
      expect(region.getAttribute('role')).toBe('status');
      expect(region.getAttribute('aria-live')).toBe('polite');
      expect(region.getAttribute('aria-atomic')).toBe('true');
    });

    it('should create assertive live region', () => {
      const region = liveRegion.create('assertive');
      expect(region.getAttribute('aria-live')).toBe('assertive');
    });

    it('should update live region', () => {
      const region = liveRegion.create();
      liveRegion.update(region, 'Updated message');
      expect(region.textContent).toBe('Updated message');
    });

    it('should remove live region', () => {
      const region = liveRegion.create();
      expect(document.body.contains(region)).toBe(true);
      liveRegion.remove(region);
      expect(document.body.contains(region)).toBe(false);
    });
  });

  describe('createSkipLink', () => {
    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should create skip link with default label', () => {
      const skipLink = createSkipLink('main');
      expect(skipLink.textContent).toBe('Skip to main content');
      expect(skipLink.href).toContain('#main');
    });

    it('should create skip link with custom label', () => {
      const skipLink = createSkipLink('nav', 'Skip to navigation');
      expect(skipLink.textContent).toBe('Skip to navigation');
    });

    it('should handle click to focus target element', () => {
      const target = document.createElement('main');
      target.id = 'main';
      document.body.appendChild(target);

      const skipLink = createSkipLink('main');
      document.body.appendChild(skipLink);

      const focusMock = vi.fn();
      const setAttributeMock = vi.fn();
      const removeAttributeMock = vi.fn();

      target.focus = focusMock;
      target.setAttribute = setAttributeMock;
      target.removeAttribute = removeAttributeMock;

      // Trigger click
      skipLink.click();

      expect(focusMock).toHaveBeenCalled();
      expect(setAttributeMock).toHaveBeenCalledWith('tabindex', '-1');
    });
  });

  describe('formAccessibility', () => {
    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should set field error', () => {
      const input = document.createElement('input');
      input.id = 'test-input';
      document.body.appendChild(input);

      formAccessibility.setFieldError('test-input', 'This field is required');

      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toBe('test-input-error');
      
      const errorElement = document.getElementById('test-input-error');
      expect(errorElement?.textContent).toBe('This field is required');
    });

    it('should clear field error', () => {
      const input = document.createElement('input');
      input.id = 'test-input';
      input.setAttribute('aria-invalid', 'true');
      document.body.appendChild(input);

      const errorElement = document.createElement('div');
      errorElement.id = 'test-input-error';
      document.body.appendChild(errorElement);

      formAccessibility.clearFieldError('test-input');

      expect(input.getAttribute('aria-invalid')).toBeNull();
      expect(input.getAttribute('aria-describedby')).toBeNull();
      expect(document.getElementById('test-input-error')).toBeNull();
    });
  });

  describe('keyboardNavigation.handleEscape', () => {
    it('should call onEscape when Escape is pressed', () => {
      let called = false;
      const onEscape = () => { called = true; };
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      keyboardNavigation.handleEscape(event, onEscape);
      
      expect(called).toBe(true);
    });

    it('should not call onEscape for other keys', () => {
      let called = false;
      const onEscape = () => { called = true; };
      
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      keyboardNavigation.handleEscape(event, onEscape);
      
      expect(called).toBe(false);
    });
  });
});
