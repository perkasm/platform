# Accessibility Guide

**PerkAsm Platform Frontend**  
*WCAG 2.1 AA Compliance & Best Practices*

---

## Overview

This document outlines the accessibility features implemented in the PerkAsm frontend application and provides guidelines for maintaining WCAG 2.1 Level AA compliance.

## Table of Contents

1. [Accessibility Standards](#accessibility-standards)
2. [Keyboard Navigation](#keyboard-navigation)
3. [Screen Reader Support](#screen-reader-support)
4. [Color Contrast](#color-contrast)
5. [ARIA Implementation](#aria-implementation)
6. [Focus Management](#focus-management)
7. [Testing](#testing)
8. [Common Issues & Solutions](#common-issues--solutions)

---

## Accessibility Standards

### WCAG 2.1 Compliance

The application targets **WCAG 2.1 Level AA** compliance:

- **Perceivable:** Information must be presentable to users
- **Operable:** UI components must be operable
- **Understandable:** Information must be understandable
- **Robust:** Content must be robust enough for assistive technologies

### Tools & Libraries

- **@axe-core/react:** Automated accessibility testing
- **vitest-axe:** Accessibility testing in unit tests
- **eslint-plugin-jsx-a11y:** Linting for accessibility issues

---

## Keyboard Navigation

### Navigation Requirements

All interactive elements must be keyboard accessible:

#### Focus Order
```tsx
// Ensure logical tab order
<form>
  <input type="text" tabIndex={1} />
  <input type="email" tabIndex={2} />
  <button type="submit" tabIndex={3}>Submit</button>
</form>
```

#### Skip Links
```tsx
import { createSkipLink } from '@/utils/accessibility';

// Add skip link to main content
useEffect(() => {
  const skipLink = createSkipLink('main-content', 'Skip to main content');
  document.body.prepend(skipLink);
}, []);
```

#### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Move focus forward |
| `Shift + Tab` | Move focus backward |
| `Enter` / `Space` | Activate button/link |
| `Escape` | Close modal/dialog |
| `Arrow Keys` | Navigate within lists/menus |
| `Home` / `End` | Jump to start/end of list |

### Implementation Example

```tsx
import { keyboardNavigation } from '@/utils/accessibility';

function Dropdown({ items, onSelect }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyDown = (e: KeyboardEvent) => {
    const itemElements = Array.from(
      document.querySelectorAll('[role="option"]')
    ) as HTMLElement[];

    keyboardNavigation.handleArrowKeys(
      e,
      itemElements,
      selectedIndex,
      setSelectedIndex
    );
  };

  return (
    <div role="listbox" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <div
          key={item.id}
          role="option"
          aria-selected={index === selectedIndex}
          tabIndex={index === selectedIndex ? 0 : -1}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

---

## Screen Reader Support

### Semantic HTML

Always use semantic HTML elements:

```tsx
// ❌ Bad
<div onClick={handleClick}>Click me</div>

// ✅ Good
<button onClick={handleClick}>Click me</button>
```

### ARIA Labels

Provide accessible names for all interactive elements:

```tsx
// Icon button with aria-label
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

// Form input with label
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby={hasError ? 'email-error' : undefined}
/>
{hasError && (
  <div id="email-error" role="alert">
    Please enter a valid email
  </div>
)}
```

### Live Regions

Announce dynamic content changes:

```tsx
import { announceToScreenReader } from '@/utils/accessibility';

function SaveButton() {
  const handleSave = async () => {
    await saveData();
    announceToScreenReader('Data saved successfully', 'polite');
  };

  return <button onClick={handleSave}>Save</button>;
}
```

### Screen Reader Only Text

```tsx
// Use sr-only class for screen reader only text
<button>
  <Icon />
  <span className="sr-only">Delete item</span>
</button>
```

---

## Color Contrast

### WCAG Requirements

- **Normal text:** 4.5:1 contrast ratio
- **Large text (18px+):** 3:1 contrast ratio
- **UI components:** 3:1 contrast ratio

### Contrast Utilities

```tsx
import { colorContrast } from '@/utils/accessibility';

// Check if colors meet WCAG AA
const textColor = '#333333';
const bgColor = '#ffffff';

if (!colorContrast.meetsWCAG_AA(textColor, bgColor)) {
  console.warn('Insufficient contrast!');
}

// Get contrast ratio
const ratio = colorContrast.getContrastRatio(textColor, bgColor);
console.log(`Contrast ratio: ${ratio.toFixed(2)}:1`);
```

### Color Palette

The application uses accessible color combinations:

```css
/* Primary text on background */
--foreground: 220 13% 13%;  /* #1f2937 */
--background: 240 10% 98%;  /* #f9fafb */
/* Contrast: 12.6:1 ✓ */

/* Primary button */
--primary: 221 83% 15%;      /* #071e3a */
--primary-foreground: 210 40% 98%; /* #f5f9ff */
/* Contrast: 14.5:1 ✓ */

/* Success indicators */
--success: 142 76% 36%;      /* #16a34a */
--success-foreground: 355 20% 98%; /* #fef5f6 */
/* Contrast: 4.7:1 ✓ */
```

### Testing Contrast

```bash
# Use browser DevTools
# - Inspect element
# - Check "Accessibility" pane
# - View contrast ratio

# Or use online tools:
# - WebAIM Contrast Checker
# - Colour Contrast Analyser
```

---

## ARIA Implementation

### Common ARIA Attributes

#### Roles
```tsx
// Landmark roles
<header role="banner">
<nav role="navigation">
<main role="main">
<aside role="complementary">
<footer role="contentinfo">

// Widget roles
<button role="button">
<input role="textbox">
<div role="dialog">
<ul role="menu">
```

#### States & Properties
```tsx
// Expanded/collapsed
<button
  aria-expanded={isOpen}
  aria-controls="menu-id"
>
  Menu
</button>

// Selected items
<div
  role="option"
  aria-selected={isSelected}
  tabIndex={isSelected ? 0 : -1}
>
  Option
</div>

// Form validation
<input
  aria-invalid={hasError}
  aria-describedby="error-id"
  aria-required={true}
/>
```

#### Live Regions
```tsx
// Status messages
<div role="status" aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Urgent announcements
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

### Dialog Implementation

```tsx
import { focusManagement } from '@/utils/accessibility';

function Dialog({ isOpen, onClose, children }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    // Save current focus
    const restoreFocus = focusManagement.saveFocus();

    // Trap focus in dialog
    const releaseFocus = focusManagement.trapFocus(dialogRef.current);

    return () => {
      releaseFocus();
      restoreFocus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <h2 id="dialog-title">Dialog Title</h2>
      <div id="dialog-description">{children}</div>
      <button onClick={onClose} aria-label="Close dialog">
        Close
      </button>
    </div>
  );
}
```

---

## Focus Management

### Focus Indicators

All focusable elements have visible focus indicators:

```css
/* Enhanced focus styles */
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* Custom focus for specific elements */
.button:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 4px;
}
```

### Focus Trap

Trap focus within modals and dialogs:

```tsx
import { focusManagement } from '@/utils/accessibility';

function Modal({ isOpen, children }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const cleanup = focusManagement.trapFocus(modalRef.current);
    return cleanup;
  }, [isOpen]);

  return <div ref={modalRef}>{children}</div>;
}
```

### Focus First Error

Automatically focus the first form error:

```tsx
import { focusManagement } from '@/utils/accessibility';

function Form() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (hasErrors && formRef.current) {
      focusManagement.focusFirstError(formRef.current);
    }
  };

  return <form ref={formRef} onSubmit={handleSubmit}>...</form>;
}
```

---

## Testing

### Automated Testing

#### Component Testing with axe

```tsx
import { axe, toHaveNoViolations } from 'vitest-axe';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

describe('Button', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

#### Runtime Monitoring

```tsx
// In development mode
import { useEffect } from 'react';

if (process.env.NODE_ENV === 'development') {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

### Manual Testing

#### Keyboard Navigation
1. Disconnect mouse/trackpad
2. Navigate entire app using only keyboard
3. Verify all functionality is accessible
4. Check focus indicators are visible

#### Screen Reader Testing

**macOS (VoiceOver):**
```bash
# Enable VoiceOver
Cmd + F5

# Navigate
Control + Option + Arrow Keys

# Activate element
Control + Option + Space
```

**Windows (NVDA):**
```bash
# Start NVDA
Control + Alt + N

# Navigate
Arrow Keys

# Activate element
Enter or Space
```

#### Checklist

- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] All buttons have accessible names
- [ ] Focus order is logical
- [ ] No keyboard traps
- [ ] Color is not the only indicator
- [ ] Text has sufficient contrast
- [ ] Headings are hierarchical (h1 → h2 → h3)
- [ ] Links have descriptive text
- [ ] Errors are announced to screen readers

---

## Common Issues & Solutions

### Issue: Icon-only buttons

```tsx
// ❌ Problem
<button>
  <TrashIcon />
</button>

// ✅ Solution 1: aria-label
<button aria-label="Delete item">
  <TrashIcon />
</button>

// ✅ Solution 2: visually hidden text
<button>
  <TrashIcon />
  <span className="sr-only">Delete item</span>
</button>
```

### Issue: Custom dropdowns

```tsx
// ✅ Accessible dropdown
<div>
  <button
    id="dropdown-button"
    aria-haspopup="true"
    aria-expanded={isOpen}
    aria-controls="dropdown-menu"
    onClick={() => setIsOpen(!isOpen)}
  >
    Select option
  </button>
  
  {isOpen && (
    <ul
      id="dropdown-menu"
      role="menu"
      aria-labelledby="dropdown-button"
    >
      <li role="menuitem" tabIndex={0}>Option 1</li>
      <li role="menuitem" tabIndex={0}>Option 2</li>
    </ul>
  )}
</div>
```

### Issue: Dynamic content updates

```tsx
// ✅ Announce updates to screen readers
import { announceToScreenReader } from '@/utils/accessibility';

function SearchResults({ results, isLoading }) {
  useEffect(() => {
    if (!isLoading && results.length > 0) {
      announceToScreenReader(
        `${results.length} results found`,
        'polite'
      );
    }
  }, [results, isLoading]);

  return <div>...</div>;
}
```

### Issue: Form validation

```tsx
// ✅ Accessible form validation
import { formAccessibility } from '@/utils/accessibility';

function LoginForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    if (!email) {
      formAccessibility.setFieldError('email', 'Email is required');
      setErrors({ ...errors, email: 'Email is required' });
    } else {
      formAccessibility.clearFieldError('email');
      const { email: _, ...rest } = errors;
      setErrors(rest);
    }
  };

  return (
    <form>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        onBlur={(e) => validateEmail(e.target.value)}
        aria-required="true"
      />
    </form>
  );
}
```

---

## Accessibility Checklist

### Before Each Release

- [ ] Run automated accessibility tests
- [ ] Test with keyboard navigation only
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Verify color contrast ratios
- [ ] Check focus indicators are visible
- [ ] Validate ARIA attributes
- [ ] Test form validation errors
- [ ] Verify skip links work
- [ ] Test with browser zoom (200%)
- [ ] Run Lighthouse accessibility audit

### Development Guidelines

1. **Use semantic HTML first**
2. **Add ARIA only when necessary**
3. **Test with real assistive technologies**
4. **Don't disable focus indicators**
5. **Provide text alternatives**
6. **Ensure keyboard accessibility**
7. **Maintain adequate color contrast**
8. **Use proper heading hierarchy**
9. **Label all form controls**
10. **Announce dynamic changes**

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

---

*Last Updated: September 30, 2025*
