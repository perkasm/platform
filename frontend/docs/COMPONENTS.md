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
- [Custom Hooks](#custom-hooks)
- [Services](#services)
- [Types](#types)
- [Component Patterns](#component-patterns)

---

## Overview

### Component Categories

1. **Base UI Components** (`src/components/ui/`)
   - Comprehensive set of reusable UI elements from shadcn/ui
   - Design system foundation with 40+ components
   - Includes form controls, navigation, feedback, and layout primitives

2. **Feature Components** (`src/components/`)
   - Business logic components for core application features
   - Domain-specific functionality for cards, chat, dashboard, and recommendations

3. **Layout Components**
   - NavigationTabs for main application navigation
   - Header and footer sections (inline in pages/Index.tsx)
   - Responsive layout structure

4. **Utility Components**
   - ErrorBoundary for error handling
   - ProtectedRoute for authentication
   - Loading states and error displays

5. **Custom Hooks** (`src/hooks/`)
   - React Query hooks for data fetching and mutations
   - Business logic encapsulation
   - Reusable state management

6. **Services** (`src/services/`)
   - API service modules for backend communication
   - Centralized data access layer

7. **Types** (`src/types/`)
   - TypeScript type definitions
   - API response interfaces and application types

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

### Accordion

**Location**: `src/components/ui/accordion.tsx`

**Description**: Collapsible content panels.

**Usage**:
```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Item 1</AccordionTrigger>
    <AccordionContent>Content for item 1</AccordionContent>
  </AccordionItem>
</Accordion>
```

---

### Alert

**Location**: `src/components/ui/alert.tsx`

**Description**: Contextual feedback messages.

**Usage**:
```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

<Alert>
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>Your changes have been saved.</AlertDescription>
</Alert>
```

---

### Alert Dialog

**Location**: `src/components/ui/alert-dialog.tsx`

**Description**: Modal dialog for destructive actions requiring confirmation.

**Usage**:
```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

### Avatar

**Location**: `src/components/ui/avatar.tsx`

**Description**: User avatar component with fallback support.

**Usage**:
```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

<Avatar>
  <AvatarImage src="/avatar.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

---

### Badge

**Location**: `src/components/ui/badge.tsx`

**Description**: Small status indicators and labels.

**Usage**:
```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="secondary">New</Badge>
<Badge variant="destructive">Error</Badge>
```

---

### Breadcrumb

**Location**: `src/components/ui/breadcrumb.tsx`

**Description**: Navigation breadcrumb component.

**Usage**:
```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current Page</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

---

### Calendar

**Location**: `src/components/ui/calendar.tsx`

**Description**: Date picker calendar component.

**Usage**:
```tsx
import { Calendar } from '@/components/ui/calendar';

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
/>
```

---

### Chart

**Location**: `src/components/ui/chart.tsx`

**Description**: Chart components using Recharts.

**Usage**:
```tsx
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

<ChartContainer config={chartConfig}>
  <LineChart data={data}>
    <ChartTooltip content={<ChartTooltipContent />} />
    {/* Chart content */}
  </LineChart>
</ChartContainer>
```

---

### Checkbox

**Location**: `src/components/ui/checkbox.tsx`

**Description**: Checkbox input component.

**Usage**:
```tsx
import { Checkbox } from '@/components/ui/checkbox';

<Checkbox
  id="terms"
  checked={checked}
  onCheckedChange={setChecked}
/>
```

---

### Collapsible

**Location**: `src/components/ui/collapsible.tsx`

**Description**: Collapsible content container.

**Usage**:
```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

<Collapsible>
  <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
  <CollapsibleContent>Hidden content</CollapsibleContent>
</Collapsible>
```

---

### Command

**Location**: `src/components/ui/command.tsx`

**Description**: Command palette component for search and actions.

**Usage**:
```tsx
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

<Command>
  <CommandInput placeholder="Search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Actions">
      <CommandItem>Action 1</CommandItem>
      <CommandItem>Action 2</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

---

### Context Menu

**Location**: `src/components/ui/context-menu.tsx`

**Description**: Right-click context menu component.

**Usage**:
```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

<ContextMenu>
  <ContextMenuTrigger>Right click me</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Action 1</ContextMenuItem>
    <ContextMenuItem>Action 2</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

---

### Drawer

**Location**: `src/components/ui/drawer.tsx`

**Description**: Slide-out drawer component.

**Usage**:
```tsx
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

<Drawer>
  <DrawerTrigger>Open Drawer</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Drawer Title</DrawerTitle>
      <DrawerDescription>Drawer description</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter>
      <DrawerClose>Close</DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

---

### Dropdown Menu

**Location**: `src/components/ui/dropdown-menu.tsx`

**Description**: Dropdown menu component.

**Usage**:
```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Action 1</DropdownMenuItem>
    <DropdownMenuItem>Action 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### Form

**Location**: `src/components/ui/form.tsx`

**Description**: Form components with validation using react-hook-form.

**Usage**:
```tsx
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

---

### Hover Card

**Location**: `src/components/ui/hover-card.tsx`

**Description**: Hover-triggered card overlay.

**Usage**:
```tsx
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

<HoverCard>
  <HoverCardTrigger>Hover me</HoverCardTrigger>
  <HoverCardContent>Additional information</HoverCardContent>
</HoverCard>
```

---

### Input OTP

**Location**: `src/components/ui/input-otp.tsx`

**Description**: One-time password input component.

**Usage**:
```tsx
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>
```

---

### Menubar

**Location**: `src/components/ui/menubar.tsx`

**Description**: Desktop-style menu bar component.

**Usage**:
```tsx
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar';

<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New</MenubarItem>
      <MenubarItem>Open</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

---

### Navigation Menu

**Location**: `src/components/ui/navigation-menu.tsx`

**Description**: Responsive navigation menu component.

**Usage**:
```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink>Link 1</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

---

### Pagination

**Location**: `src/components/ui/pagination.tsx`

**Description**: Pagination controls for lists and tables.

**Usage**:
```tsx
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

---

### Popover

**Location**: `src/components/ui/popover.tsx`

**Description**: Floating content popover.

**Usage**:
```tsx
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

<Popover>
  <PopoverTrigger>Click me</PopoverTrigger>
  <PopoverContent>Popover content</PopoverContent>
</Popover>
```

---

### Progress

**Location**: `src/components/ui/progress.tsx`

**Description**: Progress bar component.

**Usage**:
```tsx
import { Progress } from '@/components/ui/progress';

<Progress value={75} />
```

---

### Radio Group

**Location**: `src/components/ui/radio-group.tsx`

**Description**: Radio button group component.

**Usage**:
```tsx
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

<RadioGroup value={value} onValueChange={setValue}>
  <RadioGroupItem value="option1">Option 1</RadioGroupItem>
  <RadioGroupItem value="option2">Option 2</RadioGroupItem>
</RadioGroup>
```

---

### Resizable

**Location**: `src/components/ui/resizable.tsx`

**Description**: Resizable panel components.

**Usage**:
```tsx
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

<ResizablePanelGroup direction="horizontal">
  <ResizablePanel>Panel 1</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel>Panel 2</ResizablePanel>
</ResizablePanelGroup>
```

---

### Scroll Area

**Location**: `src/components/ui/scroll-area.tsx`

**Description**: Custom scrollbar component.

**Usage**:
```tsx
import { ScrollArea } from '@/components/ui/scroll-area';

<ScrollArea className="h-32">
  <div>Scrollable content</div>
</ScrollArea>
```

---

### Separator

**Location**: `src/components/ui/separator.tsx`

**Description**: Visual separator component.

**Usage**:
```tsx
import { Separator } from '@/components/ui/separator';

<Separator />
```

---

### Sheet

**Location**: `src/components/ui/sheet.tsx`

**Description**: Slide-out sheet component (mobile-friendly drawer).

**Usage**:
```tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

<Sheet>
  <SheetTrigger>Open Sheet</SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Sheet Title</SheetTitle>
      <SheetDescription>Sheet description</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>
```

---

### Sidebar

**Location**: `src/components/ui/sidebar.tsx`

**Description**: Collapsible sidebar component.

**Usage**:
```tsx
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

<SidebarProvider>
  <Sidebar>
    <SidebarContent>Sidebar content</SidebarContent>
  </Sidebar>
  <SidebarTrigger />
</SidebarProvider>
```

---

### Skeleton

**Location**: `src/components/ui/skeleton.tsx`

**Description**: Loading skeleton placeholder.

**Usage**:
```tsx
import { Skeleton } from '@/components/ui/skeleton';

<Skeleton className="h-4 w-32" />
```

---

### Slider

**Location**: `src/components/ui/slider.tsx`

**Description**: Range slider component.

**Usage**:
```tsx
import { Slider } from '@/components/ui/slider';

<Slider
  value={value}
  onValueChange={setValue}
  max={100}
  step={1}
/>
```

---

### Sonner

**Location**: `src/components/ui/sonner.tsx`

**Description**: Toast notification system (alternative to shadcn toast).

**Usage**:
```tsx
import { toast } from 'sonner';

toast.success('Success message');
toast.error('Error message');
```

---

### Switch

**Location**: `src/components/ui/switch.tsx`

**Description**: Toggle switch component.

**Usage**:
```tsx
import { Switch } from '@/components/ui/switch';

<Switch
  checked={checked}
  onCheckedChange={setChecked}
/>
```

---

### Table

**Location**: `src/components/ui/table.tsx`

**Description**: Data table components.

**Usage**:
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data 1</TableCell>
      <TableCell>Data 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

### Tabs

**Location**: `src/components/ui/tabs.tsx`

**Description**: Tab navigation component.

**Usage**:
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

---

### Textarea

**Location**: `src/components/ui/textarea.tsx`

**Description**: Multi-line text input component.

**Usage**:
```tsx
import { Textarea } from '@/components/ui/textarea';

<Textarea
  placeholder="Enter text..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

---

### Theme Toggle

**Location**: `src/components/ui/theme-toggle.tsx`

**Description**: Dark/light theme toggle button.

**Usage**:
```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle';

<ThemeToggle />
```

---

### Toggle

**Location**: `src/components/ui/toggle.tsx`

**Description**: Toggle button component.

**Usage**:
```tsx
import { Toggle } from '@/components/ui/toggle';

<Toggle pressed={pressed} onPressedChange={setPressed}>
  Toggle me
</Toggle>
```

---

### Toggle Group

**Location**: `src/components/ui/toggle-group.tsx`

**Description**: Group of toggle buttons.

**Usage**:
```tsx
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

<ToggleGroup type="single" value={value} onValueChange={setValue}>
  <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
  <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
</ToggleGroup>
```

---

### Tooltip

**Location**: `src/components/ui/tooltip.tsx`

**Description**: Hover tooltip component.

**Usage**:
```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>Tooltip content</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

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

---

## Layout Components

### NavigationTabs

**Location**: `src/components/ui/navigation-tabs.tsx`

**Description**: Main navigation component with tab-based routing for the application.

**Props**:
```typescript
interface NavigationTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}
```

**Features**:
- Responsive design (icons only on mobile)
- Active tab highlighting
- Smooth transitions
- Icon support for each tab

**Usage**:
```tsx
import { NavigationTabs } from '@/components/ui/navigation-tabs';

const tabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />
  },
  {
    id: "cards",
    label: "My Cards", 
    icon: <CreditCard className="h-4 w-4" />
  }
];

<NavigationTabs 
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

---

### Header and Footer

**Location**: `src/pages/Index.tsx` (inline components)

**Description**: Application header and footer sections.

**Header Features**:
- Logo and branding
- NavigationTabs integration
- Theme toggle
- User profile display

**Footer Features**:
- Company information
- Quick links
- Legal links
- Social media links
- Copyright notice

**Structure**:
```tsx
// Header (inline in Index.tsx)
<header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
  {/* Header content */}
</header>

// Footer (inline in Index.tsx)
<footer className="bg-background/50 border-t mt-16">
  {/* Footer content */}
</footer>
```

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

## Custom Hooks

### useCards

**Location**: `src/hooks/use-cards.ts`

**Description**: React Query hooks for credit card data management.

**Available Hooks**:
- `useCards(activeOnly?: boolean)` - Fetch all cards
- `useCard(id: number)` - Fetch single card
- `useCreateCard()` - Create new card mutation
- `useUpdateCard()` - Update card mutation
- `useDeleteCard()` - Delete card mutation

**Usage**:
```typescript
import { useCards, useCreateCard } from '@/hooks/use-cards';

function CardsList() {
  const { data: cards, isLoading } = useCards();
  const createCard = useCreateCard();

  const handleCreate = async (cardData: CreditCardCreate) => {
    await createCard.mutateAsync(cardData);
  };

  // Component logic...
}
```

---

### useChat

**Location**: `src/hooks/use-chat.ts`

**Description**: React Query hooks for AI chat functionality.

**Available Hooks**:
- `useChatMessages()` - Fetch chat messages
- `useSendMessage()` - Send message mutation

**Usage**:
```typescript
import { useChatMessages, useSendMessage } from '@/hooks/use-chat';

function ChatInterface() {
  const { data: messages } = useChatMessages();
  const sendMessage = useSendMessage();

  // Component logic...
}
```

---

### useDashboard

**Location**: `src/hooks/use-dashboard.ts`

**Description**: React Query hooks for dashboard data.

**Available Hooks**:
- `useDashboardMetrics()` - Fetch dashboard metrics
- `useROIMetrics()` - Fetch ROI calculations

**Usage**:
```typescript
import { useDashboardMetrics } from '@/hooks/use-dashboard';

function Dashboard() {
  const { data: metrics } = useDashboardMetrics();

  // Component logic...
}
```

---

### useRecommendations

**Location**: `src/hooks/use-recommendations.ts`

**Description**: React Query hooks for card recommendations.

**Available Hooks**:
- `useCardRecommendations()` - Fetch card recommendations

**Usage**:
```typescript
import { useCardRecommendations } from '@/hooks/use-recommendations';

function Recommendations() {
  const { data: recommendations } = useCardRecommendations();

  // Component logic...
}
```

---

### useToast

**Location**: `src/hooks/use-toast.ts`

**Description**: Toast notification hook.

**Usage**:
```typescript
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast } = useToast();

  const showSuccess = () => {
    toast({
      title: 'Success!',
      description: 'Operation completed successfully.',
    });
  };

  // Component logic...
}
```

---

### useMobile

**Location**: `src/hooks/use-mobile.tsx`

**Description**: Hook for detecting mobile viewport.

**Usage**:
```typescript
import { useMobile } from '@/hooks/use-mobile';

function ResponsiveComponent() {
  const isMobile = useMobile();

  return (
    <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
      {/* Component content */}
    </div>
  );
}
```

---

## Services

### API Service

**Location**: `src/services/api.ts`

**Description**: Base API service with HTTP methods.

**Methods**:
- `get<T>(url: string)` - GET request
- `post<T>(url: string, data?: any)` - POST request
- `put<T>(url: string, data?: any)` - PUT request
- `del<T>(url: string)` - DELETE request

**Usage**:
```typescript
import { get, post } from '@/services/api';

// GET request
const data = await get('/api/cards');

// POST request
const result = await post('/api/cards', cardData);
```

---

### Cards Service

**Location**: `src/services/cards.service.ts`

**Description**: Credit card API operations.

**Methods**:
- `getCards(activeOnly?: boolean)` - Get all cards
- `getCard(id: number)` - Get single card
- `createCard(data: CreditCardCreate)` - Create card
- `updateCard(id: number, data: CreditCardUpdate)` - Update card
- `deleteCard(id: number)` - Delete card

**Usage**:
```typescript
import { cardsService } from '@/services/cards.service';

const cards = await cardsService.getCards();
const newCard = await cardsService.createCard(cardData);
```

---

### Chat Service

**Location**: `src/services/chat.service.ts`

**Description**: AI chat API operations.

**Methods**:
- `getMessages()` - Get chat messages
- `sendMessage(message: string)` - Send message

---

### Dashboard Service

**Location**: `src/services/dashboard.service.ts`

**Description**: Dashboard data API operations.

**Methods**:
- `getMetrics()` - Get dashboard metrics
- `getROIMetrics()` - Get ROI calculations

---

### Recommendations Service

**Location**: `src/services/recommendations.service.ts`

**Description**: Card recommendations API operations.

**Methods**:
- `getRecommendations()` - Get card recommendations

---

## Types

### API Types

**Location**: `src/types/api.ts`

**Description**: TypeScript interfaces for API data structures.

**Key Interfaces**:
```typescript
interface CreditCard {
  id: number;
  user_id: number;
  name: string;
  card_type: string;
  issuer: string;
  // ... additional properties
}

interface CreditCardCreate {
  name: string;
  card_type: string;
  issuer: string;
  // ... create properties
}

interface WelcomeBonusProgress {
  spent: number;
  required: number;
  deadline: string | null;
  progress_percentage: number;
}

// Additional types for chat, dashboard, recommendations...
```

---

### Image Types

**Location**: `src/types/images.d.ts`

**Description**: TypeScript declarations for image imports.

**Usage**:
```typescript
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';
```

---

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

*Last Updated: October 11, 2025*
