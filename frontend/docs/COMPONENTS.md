# Component Documentation

**PerkAsm Frontend Component Library**

Comprehensive documentation for all React components used in the PerkAsm platform.

---

## Table of Contents

- [Overview](#overview)
- [Base UI Components](#base-ui-components)
- [Feature Components](#feature-components)
- [Layout Components](#layout-components)
- [Utility Components](#utility-components)
- [Component Patterns](#component-patterns)

---

## Overview

### Component Categories

1. **Base UI Components** (`src/components/ui/`)
   - Reusable, atomic UI elements from shadcn/ui
   - Design system foundation

2. **Feature Components** (`src/components/`)
   - Business logic components
   - Domain-specific functionality

3. **Layout Components** 
   - Page structure and navigation
   - App shell components

4. **Utility Components**
   - Error boundaries, protected routes
   - Non-visual functionality

---

## Base UI Components

### Button

**Location**: `src/components/ui/button.tsx`

**Description**: Versatile button component with multiple variants and sizes.

**Props**:
```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
}
```

**Usage**:
```tsx
import { Button } from '@/components/ui/button';

// Primary button
<Button>Click me</Button>

// Destructive button
<Button variant="destructive">Delete</Button>

// Small outline button
<Button variant="outline" size="sm">Small</Button>

// Icon button
<Button variant="ghost" size="icon">
  <TrashIcon className="h-4 w-4" />
</Button>
```

---

### Card

**Location**: `src/components/ui/card.tsx`

**Description**: Container component for grouping related content.

**Subcomponents**:
- `Card` - Main container
- `CardHeader` - Top section
- `CardTitle` - Title text
- `CardDescription` - Subtitle text
- `CardContent` - Main content area
- `CardFooter` - Bottom section

**Usage**:
```tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent,
  CardFooter 
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

### Input

**Location**: `src/components/ui/input.tsx`

**Description**: Text input field with consistent styling.

**Props**:
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}
```

**Usage**:
```tsx
import { Input } from '@/components/ui/input';

<Input 
  type="email" 
  placeholder="Enter email" 
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

---

### Label

**Location**: `src/components/ui/label.tsx`

**Description**: Form label with accessibility features.

**Usage**:
```tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

---

### Toast

**Location**: `src/components/ui/toast.tsx`

**Description**: Notification toast component.

**Hook**: `useToast()`

**Usage**:
```tsx
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast } = useToast();

  const showNotification = () => {
    toast({
      title: 'Success!',
      description: 'Your action was completed.',
    });
  };

  // Error toast
  const showError = () => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Something went wrong.',
    });
  };

  return <Button onClick={showNotification}>Show Toast</Button>;
}
```

---

### Dialog

**Location**: `src/components/ui/dialog.tsx`

**Description**: Modal dialog component.

**Subcomponents**:
- `Dialog` - Root component
- `DialogTrigger` - Trigger button
- `DialogContent` - Modal content
- `DialogHeader` - Modal header
- `DialogTitle` - Modal title
- `DialogDescription` - Modal description
- `DialogFooter` - Modal footer

**Usage**:
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Select

**Location**: `src/components/ui/select.tsx`

**Description**: Dropdown select component.

**Usage**:
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

---

## Feature Components

### MyCards

**Location**: `src/components/cards/my-cards.tsx`

**Description**: Displays user's credit card portfolio with management options.

**Features**:
- Card list display
- Add new card
- Edit existing cards
- Delete cards
- Card activation toggle

**Usage**:
```tsx
import { MyCards } from '@/components/cards/my-cards';

function CardsPage() {
  return (
    <div className="container py-8">
      <MyCards />
    </div>
  );
}
```

**Data Flow**:
```typescript
// Uses React Query hook
const { data: cards, isLoading } = useCards();

// Mutations
const createCard = useCreateCard();
const updateCard = useUpdateCard();
const deleteCard = useDeleteCard();
```

---

### MainDashboard

**Location**: `src/components/dashboard/main-dashboard.tsx`

**Description**: Main dashboard view showing rewards overview and metrics.

**Sections**:
- Rewards summary
- Spending analytics
- Active alerts
- Quick actions

**Usage**:
```tsx
import { MainDashboard } from '@/components/dashboard/main-dashboard';

function DashboardPage() {
  return <MainDashboard />;
}
```

**Subcomponents**:
- `MetricCard` - Individual metric display
- `ROIMetrics` - ROI calculations
- `GoalsSection` - User goals tracking
- `CompactGoals` - Condensed goals view

---

### AIChat

**Location**: `src/components/chat/ai-chat.tsx`

**Description**: AI-powered chat interface for rewards optimization.

**Features**:
- Message input with validation
- Conversation history
- Suggested prompts
- Loading states
- Error handling

**Props**:
```typescript
interface AIChatProps {
  className?: string;
}
```

**Usage**:
```tsx
import { AIChat } from '@/components/chat/ai-chat';

function ChatPage() {
  return (
    <div className="container">
      <AIChat />
    </div>
  );
}
```

---

### CardRecommendations

**Location**: `src/components/recommendations/card-recommendations.tsx`

**Description**: Displays AI-powered card recommendations.

**Features**:
- Recommendation cards
- Match scores
- Annual fee display
- Estimated value
- Reasoning explanation

**Usage**:
```tsx
import { CardRecommendations } from '@/components/recommendations/card-recommendations';

function RecommendationsPage() {
  return (
    <div className="container py-8">
      <h1>Recommended Cards</h1>
      <CardRecommendations limit={5} />
    </div>
  );
}
```

---

## Layout Components

### Navigation

**Description**: Main navigation component with responsive behavior.

**Features**:
- Desktop navigation bar
- Mobile hamburger menu
- Active route highlighting
- User profile dropdown

**Routes**:
- `/` - Dashboard
- `/cards` - My Cards
- `/chat` - AI Assistant
- `/recommendations` - Card Recommendations

---

### Footer

**Description**: Site footer with links and information.

**Sections**:
- Quick links
- Legal links
- Social media
- Copyright

---

## Utility Components

### ErrorBoundary

**Location**: `src/components/ErrorBoundary.tsx`

**Description**: Catches JavaScript errors in component tree.

**Props**:
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
```

**Usage**:
```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

**Features**:
- Error state tracking
- Reset functionality
- Error logging to Sentry
- Custom fallback UI

---

### ProtectedRoute

**Location**: `src/components/ProtectedRoute.tsx`

**Description**: Route guard for authenticated pages.

**Props**:
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}
```

**Usage**:
```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

### LoadingSpinner

**Location**: `src/components/ui/loading-spinner.tsx`

**Description**: Loading indicator component.

**Props**:
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Usage**:
```tsx
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Small spinner
<LoadingSpinner size="sm" />

// Large centered spinner
<div className="flex justify-center">
  <LoadingSpinner size="lg" />
</div>
```

---

### CardSkeleton

**Location**: `src/components/ui/card-skeleton.tsx`

**Description**: Skeleton placeholder for loading card content.

**Props**:
```typescript
interface CardSkeletonProps {
  count?: number;
  className?: string;
}
```

**Usage**:
```tsx
import { CardSkeleton } from '@/components/ui/card-skeleton';

{isLoading ? (
  <CardSkeleton count={3} />
) : (
  <CardList data={data} />
)}
```

---

### ErrorAlert

**Location**: `src/components/ui/error-alert.tsx`

**Description**: Error message display component.

**Props**:
```typescript
interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}
```

**Usage**:
```tsx
import { ErrorAlert } from '@/components/ui/error-alert';

{isError && (
  <ErrorAlert 
    title="Failed to load"
    message={error.message}
    onRetry={refetch}
  />
)}
```

---

## Component Patterns

### Container/Presentation Pattern

**Container Component** (with logic):
```tsx
export function MyCardsContainer() {
  const { data, isLoading, error } = useCards();
  const createCard = useCreateCard();

  const handleCreate = async (data: CardData) => {
    await createCard.mutateAsync(data);
  };

  return (
    <MyCardsPresentation
      cards={data}
      isLoading={isLoading}
      error={error}
      onCreateCard={handleCreate}
    />
  );
}
```

**Presentation Component** (UI only):
```tsx
interface MyCardsPresentationProps {
  cards?: CreditCard[];
  isLoading: boolean;
  error?: Error;
  onCreateCard: (data: CardData) => void;
}

export function MyCardsPresentation({ 
  cards, 
  isLoading, 
  error, 
  onCreateCard 
}: MyCardsPresentationProps) {
  if (isLoading) return <CardSkeleton />;
  if (error) return <ErrorAlert message={error.message} />;
  
  return (
    <div>
      {cards?.map(card => (
        <CardItem key={card.id} card={card} />
      ))}
      <AddCardButton onClick={onCreateCard} />
    </div>
  );
}
```

---

### Compound Components Pattern

```tsx
// Root component manages state
export function Accordion({ children }: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  return (
    <AccordionContext.Provider value={{ openItems, setOpenItems }}>
      {children}
    </AccordionContext.Provider>
  );
}

// Child components access shared state
Accordion.Item = function AccordionItem({ id, children }: ItemProps) {
  const { openItems } = useAccordionContext();
  const isOpen = openItems.includes(id);
  
  return <div data-state={isOpen ? 'open' : 'closed'}>{children}</div>;
};

// Usage
<Accordion>
  <Accordion.Item id="1">
    <Accordion.Trigger>Item 1</Accordion.Trigger>
    <Accordion.Content>Content 1</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

---

### Render Props Pattern

```tsx
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | undefined, isLoading: boolean, error: Error | null) => React.ReactNode;
}

export function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const { data, isLoading, error } = useQuery({
    queryKey: [url],
    queryFn: () => fetch(url).then(r => r.json()),
  });

  return <>{children(data, isLoading, error)}</>;
}

// Usage
<DataFetcher<User> url="/api/user">
  {(user, loading, error) => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error.message} />;
    return <UserProfile user={user} />;
  }}
</DataFetcher>
```

---

### Custom Hook Pattern

```tsx
// Extract component logic into custom hook
export function useCardManagement() {
  const { data: cards, isLoading } = useCards();
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();

  const handleCreate = async (data: CardData) => {
    await createCard.mutateAsync(data);
  };

  const handleUpdate = async (id: number, data: Partial<CardData>) => {
    await updateCard.mutateAsync({ id, data });
  };

  const handleDelete = async (id: number) => {
    await deleteCard.mutateAsync(id);
  };

  return {
    cards,
    isLoading,
    createCard: handleCreate,
    updateCard: handleUpdate,
    deleteCard: handleDelete,
  };
}

// Use in component
function MyCards() {
  const { cards, isLoading, createCard } = useCardManagement();
  // ...
}
```

---

## Accessibility Guidelines

### Keyboard Navigation

All interactive components support keyboard navigation:
- `Tab` - Focus next element
- `Shift + Tab` - Focus previous element
- `Enter/Space` - Activate buttons
- `Escape` - Close dialogs/dropdowns
- Arrow keys - Navigate lists/menus

### ARIA Labels

```tsx
// Good - descriptive aria-label
<Button aria-label="Delete card">
  <TrashIcon />
</Button>

// Good - aria-labelledby for complex labels
<div id="dialog-title">Delete Confirmation</div>
<Dialog aria-labelledby="dialog-title">
  {/* ... */}
</Dialog>
```

### Focus Management

```tsx
// Auto-focus first input in dialog
<DialogContent>
  <Input autoFocus placeholder="Card name" />
</DialogContent>

// Return focus after closing
const closeDialog = () => {
  setOpen(false);
  triggerRef.current?.focus();
};
```

---

## Testing Components

### Component Test Example

```typescript
import { render, screen } from '@testing-library/react';
import { MyCards } from './my-cards';

describe('MyCards', () => {
  it('should render cards list', () => {
    render(<MyCards />);
    expect(screen.getByText('My Cards')).toBeInTheDocument();
  });

  it('should handle card creation', async () => {
    const user = userEvent.setup();
    render(<MyCards />);
    
    await user.click(screen.getByText('Add Card'));
    await user.type(screen.getByLabelText('Card Name'), 'Test Card');
    await user.click(screen.getByText('Create'));
    
    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });
});
```

---

## Additional Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
- [React Documentation](https://react.dev)
- [Accessibility Guidelines](./accessibility-guide.md)

---

*Last Updated: September 30, 2025*
