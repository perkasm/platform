# Storybook Documentation

**PerkAsm Component Storybook**

This document provides information about using Storybook for component development and documentation.

---

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Writing Stories](#writing-stories)
- [Addons](#addons)
- [Best Practices](#best-practices)
- [Deployment](#deployment)

---

## Overview

Storybook is an interactive component development environment that allows you to:

- **Develop UI Components in Isolation** - Build components independently from your app
- **Document Components** - Auto-generate documentation from component props and stories
- **Test Components** - Visual regression testing and interaction testing
- **Share Components** - Collaborate with designers and developers

---

## Getting Started

### Running Storybook Locally

```bash
# Start Storybook development server
npm run storybook

# Storybook will open at http://localhost:6006
```

### Building Storybook

```bash
# Build static Storybook site
npm run build-storybook

# Output will be in storybook-static/
```

---

## Writing Stories

### Basic Story Structure

Stories are written in `.stories.tsx` files alongside components:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Click me',
  },
};
```

### Story Types

#### Args Stories

Use args for simple prop variations:

```typescript
export const Primary: Story = {
  args: {
    variant: 'default',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};
```

#### Render Stories

Use render function for complex examples:

```typescript
export const WithIcon: Story = {
  render: () => (
    <Button>
      <Icon className="mr-2" />
      Click me
    </Button>
  ),
};
```

#### Composition Stories

Show component combinations:

```typescript
export const ButtonGroup: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="outline">Cancel</Button>
      <Button>Submit</Button>
    </div>
  ),
};
```

---

## Addons

### Installed Addons

1. **Essentials** - Core addons for controls, actions, docs
2. **Accessibility (a11y)** - Automated accessibility testing
3. **Vitest** - Component testing integration

### Using Accessibility Addon

The a11y addon automatically checks components for accessibility issues:

1. Open any story in Storybook
2. Click the "Accessibility" tab at the bottom
3. Review any violations or warnings
4. Fix issues and verify

Example violations it catches:
- Missing alt text on images
- Insufficient color contrast
- Missing ARIA labels
- Improper heading hierarchy

---

## Best Practices

### 1. Organize Stories

Use clear hierarchical naming:

```typescript
// ✅ Good
title: 'UI/Button'
title: 'UI/Card'
title: 'Features/Dashboard/MetricCard'

// ❌ Bad
title: 'Button'
title: 'MyCard'
```

### 2. Document Props

Use argTypes to document props:

```typescript
argTypes: {
  variant: {
    control: 'select',
    options: ['default', 'destructive'],
    description: 'The visual style of the button',
    table: {
      defaultValue: { summary: 'default' },
    },
  },
}
```

### 3. Show All States

Create stories for different states:

```typescript
export const Default: Story = { ... };
export const Loading: Story = { ... };
export const Disabled: Story = { ... };
export const Error: Story = { ... };
```

### 4. Use Decorators

Wrap stories with common providers:

```typescript
const meta = {
  title: 'Features/MyComponent',
  component: MyComponent,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof MyComponent>;
```

### 5. Add Descriptions

Provide context for components and stories:

```typescript
const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'A versatile button component with multiple variants...',
      },
    },
  },
} satisfies Meta<typeof Button>;
```

---

## Component Coverage

### UI Components ✅

- [x] Button
- [x] Card
- [x] Input
- [x] Label
- [x] LoadingSpinner
- [x] ErrorAlert
- [x] CardSkeleton
- [ ] Dialog
- [ ] Select
- [ ] Toast

### Feature Components

- [ ] MyCards
- [ ] MainDashboard
- [ ] AIChat
- [ ] CardRecommendations

### Utility Components

- [ ] ErrorBoundary
- [ ] ProtectedRoute

---

## Deployment

### Deploy to Chromatic (Recommended)

Chromatic provides:
- Visual regression testing
- Review workflow for UI changes
- Published Storybook hosting

```bash
# Install Chromatic
npm install --save-dev chromatic

# Deploy to Chromatic
npx chromatic --project-token=<your-token>
```

### Deploy to Static Hosting

Deploy the static build to any hosting service:

```bash
# Build Storybook
npm run build-storybook

# Deploy storybook-static/ to:
# - Netlify
# - Vercel
# - GitHub Pages
# - AWS S3
```

#### GitHub Pages Example

```bash
# Build Storybook
npm run build-storybook

# Deploy to gh-pages branch
npx gh-pages -d storybook-static
```

---

## Interaction Testing

### Writing Interaction Tests

Use the play function for user interactions:

```typescript
import { userEvent, within } from '@storybook/test';

export const FilledForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    await userEvent.type(
      canvas.getByLabelText('Email'),
      'user@example.com'
    );
    
    await userEvent.click(
      canvas.getByRole('button', { name: 'Submit' })
    );
    
    await expect(
      canvas.getByText('Success!')
    ).toBeInTheDocument();
  },
};
```

### Running Tests

```bash
# Run component tests
npm run test-storybook

# Run in CI
npm run test-storybook -- --ci
```

---

## Common Patterns

### Mock Data

Create reusable mock data:

```typescript
// mocks/cards.ts
export const mockCards = [
  {
    id: 1,
    name: 'Chase Sapphire Reserve',
    // ...
  },
];

// card.stories.tsx
import { mockCards } from '@/mocks/cards';

export const WithCards: Story = {
  render: () => <CardList cards={mockCards} />,
};
```

### API Mocking

Use MSW for API mocking:

```typescript
import { http, HttpResponse } from 'msw';

export const WithLoadedData: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/cards', () => {
          return HttpResponse.json({ cards: mockCards });
        }),
      ],
    },
  },
};
```

---

## Troubleshooting

### Stories Not Showing

1. Ensure file ends with `.stories.tsx`
2. Check that `export default` meta is present
3. Restart Storybook dev server

### TypeScript Errors

1. Ensure proper types: `Meta<typeof Component>`
2. Use `satisfies` operator for type safety
3. Update `@storybook/react` types

### Missing Components

1. Check import paths are correct
2. Ensure component is exported
3. Verify path aliases in `.storybook/main.ts`

---

## Additional Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Component Stories](../src/components/ui/*.stories.tsx)
- [Storybook Best Practices](https://storybook.js.org/docs/writing-stories/best-practices)
- [Accessibility Testing](https://storybook.js.org/docs/writing-tests/accessibility-testing)

---

## Quick Reference

### Useful Commands

```bash
# Development
npm run storybook              # Start dev server
npm run build-storybook        # Build static site

# Testing
npm run test-storybook         # Run interaction tests

# Deployment
npx chromatic                  # Deploy to Chromatic
npx gh-pages -d storybook-static  # Deploy to GitHub Pages
```

### File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── button.stories.tsx  ← Story file
│   │   └── ...
│   └── ...
.storybook/
├── main.ts                     ← Storybook config
├── preview.ts                  ← Global decorators
└── vitest.setup.ts            ← Test setup
```

---

*Last Updated: September 30, 2025*
