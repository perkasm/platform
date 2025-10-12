import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Toaster } from './toaster'

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}))

import { useToast } from '@/hooks/use-toast'

// Mock toast components
vi.mock('@/components/ui/toast', () => ({
  Toast: vi.fn(({ children, ...props }) => <div data-testid="toast" {...props}>{children}</div>),
  ToastClose: vi.fn(() => <button data-testid="toast-close">Close</button>),
  ToastDescription: vi.fn(({ children }) => <div data-testid="toast-description">{children}</div>),
  ToastProvider: vi.fn(({ children }) => <div data-testid="toast-provider">{children}</div>),
  ToastTitle: vi.fn(({ children }) => <div data-testid="toast-title">{children}</div>),
  ToastViewport: vi.fn(() => <div data-testid="toast-viewport" />),
}))

describe('Toaster Component', () => {
  const mockUseToast = vi.mocked(useToast)
  const mockToast = vi.fn()
  const mockDismiss = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseToast.mockReturnValue({
      toasts: [],
      toast: mockToast,
      dismiss: mockDismiss,
    })
  })

  it('should render without crashing', () => {
    mockUseToast.mockReturnValue({
      toasts: [],
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)
    expect(screen.getByTestId('toast-provider')).toBeInTheDocument()
  })

  it('should render ToastProvider and ToastViewport', () => {
    mockUseToast.mockReturnValue({
      toasts: [],
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    expect(screen.getByTestId('toast-provider')).toBeInTheDocument()
    expect(screen.getByTestId('toast-viewport')).toBeInTheDocument()
  })

  it('should render multiple toasts', () => {
    const mockToasts = [
      { id: '1', title: 'Toast 1', description: 'Description 1' },
      { id: '2', title: 'Toast 2', description: 'Description 2' },
    ]

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    const toasts = screen.getAllByTestId('toast')
    expect(toasts).toHaveLength(2)
  })

  it('should render toast with title and description', () => {
    const mockToasts = [
      { id: '1', title: 'Test Title', description: 'Test Description' },
    ]

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('should render toast with only title', () => {
    const mockToasts = [
      { id: '1', title: 'Test Title' },
    ]

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    expect(screen.getByTestId('toast-title')).toHaveTextContent('Test Title')
    expect(screen.queryByTestId('toast-description')).not.toBeInTheDocument()
  })

  it('should render toast with only description', () => {
    const mockToasts = [
      { id: '1', description: 'Test Description' },
    ]

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    expect(screen.getByTestId('toast-description')).toHaveTextContent('Test Description')
    expect(screen.queryByTestId('toast-title')).not.toBeInTheDocument()
  })

  it('should render toast with action element', () => {
    const mockAction = <button data-testid="action-btn">Click me</button>
    const mockToasts = [
      {
        id: '1',
        title: 'Test Title',
        action: mockAction,
      },
    ]

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    expect(screen.getByTestId('action-btn')).toBeInTheDocument()
  })

  it('should render ToastClose for each toast', () => {
    const mockToasts = [
      { id: '1', title: 'Toast 1' },
      { id: '2', title: 'Toast 2' },
    ]

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    const closeButtons = screen.getAllByTestId('toast-close')
    expect(closeButtons).toHaveLength(2)
  })

  it('should render toast with variant and duration', () => {
    const mockToasts = [
      {
        id: '1',
        title: 'Test Title',
        variant: 'destructive' as const,
        duration: 5000,
      },
    ]

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    const toast = screen.getByTestId('toast')
    expect(toast).toHaveAttribute('variant', 'destructive')
    expect(toast).toHaveAttribute('duration', '5000')
  })

  it('should handle empty toasts array', () => {
    mockUseToast.mockReturnValue({
      toasts: [],
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    expect(screen.queryByTestId('toast')).not.toBeInTheDocument()
    expect(screen.getByTestId('toast-provider')).toBeInTheDocument()
    expect(screen.getByTestId('toast-viewport')).toBeInTheDocument()
  })

  it('should handle empty toasts array', () => {
    mockUseToast.mockReturnValue({
      toasts: [],
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    expect(screen.queryByTestId('toast')).not.toBeInTheDocument()
    expect(screen.getByTestId('toast-provider')).toBeInTheDocument()
    expect(screen.getByTestId('toast-viewport')).toBeInTheDocument()
  })

  it('should render grid layout for toast content', () => {
    const mockToasts = [
      { id: '1', title: 'Test Title', description: 'Test Description' },
    ]

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    const grid = screen.getByTestId('toast').querySelector('.grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveClass('gap-1')
  })

  it('should handle toast with all optional properties missing', () => {
    const mockToasts = [
      { id: '1' },
    ]

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    expect(screen.queryByTestId('toast-title')).not.toBeInTheDocument()
    expect(screen.queryByTestId('toast-description')).not.toBeInTheDocument()
    expect(screen.getByTestId('toast-close')).toBeInTheDocument()
  })

  it('should spread remaining props to Toast component', () => {
    const mockToasts = [
      {
        id: '1',
        title: 'Test',
        customProp: 'customValue',
        anotherProp: 42,
      },
    ]

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    const toast = screen.getByTestId('toast')
    expect(toast).toHaveAttribute('customprop', 'customValue')
    expect(toast).toHaveAttribute('anotherprop', '42')
  })

  it('should handle action as React element', () => {
    const mockToasts = [
      {
        id: '1',
        title: 'Test',
        action: <div data-testid="action-element">Custom Action</div>,
      },
    ]

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    expect(screen.getByTestId('action-element')).toHaveTextContent('Custom Action')
  })

  it('should handle complex action elements', () => {
    const mockToasts = [
      {
        id: '1',
        title: 'Test',
        action: (
          <div data-testid="complex-action">
            <button>Button 1</button>
            <button>Button 2</button>
          </div>
        ),
      },
    ]

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    const actionElement = screen.getByTestId('complex-action')
    expect(actionElement).toBeInTheDocument()
    expect(actionElement.children).toHaveLength(2)
  })

  it('should handle toasts with falsy but defined title/description', () => {
    const mockToasts = [
      { id: '1', title: '', description: 'Valid description' },
      { id: '2', title: 'Valid title', description: '' },
    ]

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    const titles = screen.getAllByTestId('toast-title')
    const descriptions = screen.getAllByTestId('toast-description')

    expect(titles).toHaveLength(1) // Only the non-empty title should render
    expect(descriptions).toHaveLength(1) // Only the non-empty description should render
  })

  it('should handle large number of toasts', () => {
    const mockToasts = Array.from({ length: 10 }, (_, i) => ({
      id: `toast-${i}`,
      title: `Toast ${i}`,
      description: `Description ${i}`,
    }))

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    const toasts = screen.getAllByTestId('toast')
    expect(toasts).toHaveLength(10)
  })

  it('should handle toasts with special characters in content', () => {
    const mockToasts = [
      {
        id: '1',
        title: 'Title with <script>alert("xss")</script>',
        description: 'Description with & < > " \'',
      },
    ]

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    expect(screen.getByText('Title with <script>alert("xss")</script>')).toBeInTheDocument()
    expect(screen.getByText('Description with & < > " \'')).toBeInTheDocument()
  })

  it('should maintain toast order', () => {
    const mockToasts = [
      { id: 'first', title: 'First Toast' },
      { id: 'second', title: 'Second Toast' },
      { id: 'third', title: 'Third Toast' },
    ]

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    const titles = screen.getAllByTestId('toast-title')
    expect(titles[0]).toHaveTextContent('First Toast')
    expect(titles[1]).toHaveTextContent('Second Toast')
    expect(titles[2]).toHaveTextContent('Third Toast')
  })

  it('should handle toast with undefined action', () => {
    const mockToasts = [
      { id: '1', title: 'Test', action: undefined },
    ]

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    // Should not render any action content
    expect(screen.queryByTestId('action-element')).not.toBeInTheDocument()
    expect(screen.getByTestId('toast-close')).toBeInTheDocument()
  })

  it('should handle toast with null action', () => {
    const mockToasts = [
      { id: '1', title: 'Test', action: undefined },
    ]

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    // Should not render any action content
    expect(screen.queryByTestId('action-element')).not.toBeInTheDocument()
    expect(screen.getByTestId('toast-close')).toBeInTheDocument()
  })

  it('should render toast with all possible props', () => {
    const mockToasts = [
      {
        id: '1',
        title: 'Complete Toast',
        description: 'Full description',
        action: <button data-testid="test-action">Action</button>,
        variant: 'default' as const,
        duration: 3000,
        className: 'custom-class',
      },
    ]

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
      toast: mockToast,
      dismiss: mockDismiss,
    })
    render(<Toaster />)

    const toast = screen.getByTestId('toast')
    expect(toast).toHaveAttribute('variant', 'default')
    expect(toast).toHaveAttribute('duration', '3000')
    expect(toast).toHaveAttribute('class', 'custom-class')
    expect(screen.getByTestId('test-action')).toBeInTheDocument()
  })
})
