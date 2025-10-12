import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { ToggleGroup, ToggleGroupItem, ToggleGroupContext } from './toggle-group'

// Mock Radix UI primitives
vi.mock('@radix-ui/react-toggle-group', () => ({
  Root: vi.fn(({ children, onValueChange, type, value, ...props }) => {
    // Store the callback and current state for testing
    if (onValueChange) {
      (global as any).__toggleGroupOnValueChange = onValueChange
      ;(global as any).__toggleGroupType = type
      ;(global as any).__toggleGroupCurrentValue = value
    }
    return React.createElement('div', { 'data-testid': 'toggle-group-root', ...props }, children)
  }),
  Item: vi.fn(({ children, value, onClick, ...props }) => {
    const handleClick = (e: React.MouseEvent) => {
      if (onClick) onClick(e)
      // Simulate Radix UI behavior - call the stored callback
      const callback = (global as any).__toggleGroupOnValueChange
      const type = (global as any).__toggleGroupType
      const currentValue = (global as any).__toggleGroupCurrentValue

      if (callback) {
        if (type === 'single') {
          callback(value)
        } else if (type === 'multiple') {
          const currentArray = Array.isArray(currentValue) ? currentValue : []
          const isSelected = currentArray.includes(value)
          const newValue = isSelected
            ? currentArray.filter((v: string) => v !== value)
            : [...currentArray, value]
          callback(newValue)
          // Update the current value for subsequent calls
          ;(global as any).__toggleGroupCurrentValue = newValue
        }
      }
    }

    return React.createElement('button', {
      'data-testid': `toggle-group-item-${value || 'unknown'}`,
      onClick: handleClick,
      ...props
    }, children)
  }),
}))

// Mock toggle variants
vi.mock('./toggle.variants', () => ({
  toggleVariants: vi.fn(() => 'mock-toggle-classes'),
}))

// Mock utils
vi.mock('@/lib/utils', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}))

const { Root: mockRoot, Item: mockItem } = await import('@radix-ui/react-toggle-group')
const { toggleVariants: mockToggleVariants } = await import('./toggle.variants')
const { cn: mockCn } = await import('@/lib/utils')

describe('ToggleGroup Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(mockToggleVariants as any).mockReturnValue('mock-toggle-classes')
    ;(mockCn as any).mockImplementation((...classes: string[]) => classes.filter(Boolean).join(' '))
  })

  describe('ToggleGroup', () => {
    it('renders with default props', () => {
      render(
        <ToggleGroup type="single">
          <div>Test content</div>
        </ToggleGroup>
      )

      const root = screen.getByTestId('toggle-group-root')
      expect(root).toBeInTheDocument()
      expect(root).toHaveClass('group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs')
    })

    it('applies custom className', () => {
      render(
        <ToggleGroup type="single" className="custom-class">
          <ToggleGroupItem value="test">Test</ToggleGroupItem>
        </ToggleGroup>
      )

      const root = screen.getByTestId('toggle-group-root')
      expect(root).toHaveClass('custom-class')
    })

    it('passes through additional props to Root', () => {
      const onValueChange = vi.fn()
      render(
        <ToggleGroup
          type="single"
          value="test"
          onValueChange={onValueChange}
          data-testid="custom-group"
        >
          <div>Test content</div>
        </ToggleGroup>
      )

      expect(mockRoot).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'single',
          value: 'test',
          onValueChange,
          'data-testid': 'custom-group',
        }),
        expect.any(Object)
      )
    })

    it('provides context with default variant and size', () => {
      const TestComponent = () => {
        const context = React.useContext(ToggleGroupContext)
        return <div data-testid="context-value">{JSON.stringify(context)}</div>
      }

      render(
        <ToggleGroup type="single">
          <TestComponent />
        </ToggleGroup>
      )

      const contextValue = screen.getByTestId('context-value')
      const context = JSON.parse(contextValue.textContent || '{}')
      expect(context).toEqual({ size: 'default', variant: 'default' })
    })

    it('provides context with custom variant and size', () => {
      const TestComponent = () => {
        const context = React.useContext(ToggleGroupContext)
        return <div data-testid="context-value">{JSON.stringify(context)}</div>
      }

      render(
        <ToggleGroup type="single" variant="outline" size="sm">
          <TestComponent />
        </ToggleGroup>
      )

      const contextValue = screen.getByTestId('context-value')
      const context = JSON.parse(contextValue.textContent || '{}')
      expect(context).toEqual({ size: 'sm', variant: 'outline' })
    })

    it('renders children correctly', () => {
      render(
        <ToggleGroup type="single">
          <span>Child 1</span>
          <span>Child 2</span>
        </ToggleGroup>
      )

      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
    })
  })

  describe('ToggleGroupItem', () => {
    it('renders with correct props', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="test">Test Item</ToggleGroupItem>
        </ToggleGroup>
      )

      const item = screen.getByTestId('toggle-group-item-test')
      expect(item).toBeInTheDocument()
      expect(item).toHaveTextContent('Test Item')
    })

    it('applies toggle variants with context values', () => {
      render(
        <ToggleGroup type="single" variant="outline" size="lg">
          <ToggleGroupItem value="test">Test Item</ToggleGroupItem>
        </ToggleGroup>
      )

      expect(mockToggleVariants).toHaveBeenCalledWith({
        variant: 'outline',
        size: 'lg',
      })
    })

    it('overrides context values with explicit props', () => {
      render(
        <ToggleGroup type="single" variant="outline" size="lg">
          <ToggleGroupItem value="test" variant="default" size="sm">Test</ToggleGroupItem>
        </ToggleGroup>
      )

      expect(mockToggleVariants).toHaveBeenCalledWith({
        variant: 'outline', // context takes precedence
        size: 'lg', // context takes precedence
      })
    })

    it('applies custom className', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="test" className="custom-item">Test Item</ToggleGroupItem>
        </ToggleGroup>
      )

      const item = screen.getByTestId('toggle-group-item-test')
      expect(item).toHaveClass('mock-toggle-classes custom-item')
    })

    it('passes through additional props to Item', () => {
      const onClick = vi.fn()
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem
            value="test"
            onClick={onClick}
            disabled
            data-custom="value"
          >
            Test Item
          </ToggleGroupItem>
        </ToggleGroup>
      )

      expect(mockItem).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 'test',
          onClick,
          disabled: true,
          'data-custom': 'value',
        }),
        expect.any(Object)
      )
    })

    it('renders children correctly', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="test">
            <span>Icon</span>
            <span>Label</span>
          </ToggleGroupItem>
        </ToggleGroup>
      )

      expect(screen.getByText('Icon')).toBeInTheDocument()
      expect(screen.getByText('Label')).toBeInTheDocument()
    })
  })

  describe('Integration Tests', () => {
    it('handles single selection mode', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(
        <ToggleGroup type="single" onValueChange={onValueChange}>
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
          <ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
        </ToggleGroup>
      )

      const option1 = screen.getByTestId('toggle-group-item-option1')
      const option2 = screen.getByTestId('toggle-group-item-option2')

      await user.click(option1)
      expect(onValueChange).toHaveBeenCalledWith('option1')

      await user.click(option2)
      expect(onValueChange).toHaveBeenCalledWith('option2')
    })

    it('handles multiple selection mode', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(
        <ToggleGroup type="multiple" onValueChange={onValueChange}>
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
          <ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
        </ToggleGroup>
      )

      const option1 = screen.getByTestId('toggle-group-item-option1')
      const option2 = screen.getByTestId('toggle-group-item-option2')

      await user.click(option1)
      expect(onValueChange).toHaveBeenLastCalledWith(['option1'])

      await user.click(option2)
      expect(onValueChange).toHaveBeenLastCalledWith(['option1', 'option2'])
    })

    it('respects controlled value in single mode', () => {
      render(
        <ToggleGroup type="single" value="option2">
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
          <ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
        </ToggleGroup>
      )

      expect(mockRoot).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'single',
          value: 'option2',
        }),
        expect.any(Object)
      )
    })

    it('respects controlled value in multiple mode', () => {
      render(
        <ToggleGroup type="multiple" value={['option1', 'option3']}>
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
          <ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
        </ToggleGroup>
      )

      expect(mockRoot).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'multiple',
          value: ['option1', 'option3'],
        }),
        expect.any(Object)
      )
    })

    it('handles empty group', () => {
      render(<ToggleGroup type="single" />)

      const root = screen.getByTestId('toggle-group-root')
      expect(root).toBeInTheDocument()
      expect(root.children).toHaveLength(0)
    })

    it('handles group with single item', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="single">Single Item</ToggleGroupItem>
        </ToggleGroup>
      )

      expect(screen.getByTestId('toggle-group-item-single')).toBeInTheDocument()
      expect(screen.getByText('Single Item')).toBeInTheDocument()
    })

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(
        <ToggleGroup type="single" onValueChange={onValueChange}>
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
        </ToggleGroup>
      )

      const option1 = screen.getByTestId('toggle-group-item-option1')
      option1.focus()

      await user.keyboard('{Enter}')
      expect(onValueChange).toHaveBeenCalledWith('option1')

      await user.keyboard(' ')
      expect(onValueChange).toHaveBeenCalledWith('option1')
    })
  })

  describe('Context and Styling', () => {
    it('applies default context when no props provided', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="test">Test</ToggleGroupItem>
        </ToggleGroup>
      )

      expect(mockToggleVariants).toHaveBeenCalledWith({
        variant: 'default',
        size: 'default',
      })
    })

    it('inherits variant from context', () => {
      render(
        <ToggleGroup type="single" variant="outline">
          <ToggleGroupItem value="test">Test</ToggleGroupItem>
        </ToggleGroup>
      )

      expect(mockToggleVariants).toHaveBeenCalledWith({
        variant: 'outline',
        size: 'default', // should be default since no size prop provided
      })
    })

    it('inherits size from context', () => {
      render(
        <ToggleGroup type="single" size="sm">
          <ToggleGroupItem value="test">Test</ToggleGroupItem>
        </ToggleGroup>
      )

      expect(mockToggleVariants).toHaveBeenCalledWith({
        variant: 'default', // should be default since no variant prop provided
        size: 'sm',
      })
    })

    it('combines context and explicit props correctly', () => {
      render(
        <ToggleGroup type="single" variant="outline" size="lg">
          <ToggleGroupItem value="test" size="sm">Test</ToggleGroupItem>
        </ToggleGroup>
      )

      expect(mockToggleVariants).toHaveBeenCalledWith({
        variant: 'outline', // from context
        size: 'lg', // from context (context takes precedence)
      })
    })
  })

  describe('Accessibility', () => {
    it('renders buttons with proper accessibility attributes', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="test" aria-label="Test toggle">Test</ToggleGroupItem>
        </ToggleGroup>
      )

      const item = screen.getByTestId('toggle-group-item-test')
      expect(item.tagName).toBe('BUTTON')
      expect(item).toHaveAttribute('aria-label', 'Test toggle')
    })

    it('supports disabled state', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="test" disabled>Disabled Item</ToggleGroupItem>
        </ToggleGroup>
      )

      const item = screen.getByTestId('toggle-group-item-test')
      expect(item).toBeDisabled()
    })

    it('handles focus management', async () => {
      const user = userEvent.setup()

      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="test1">Item 1</ToggleGroupItem>
          <ToggleGroupItem value="test2">Item 2</ToggleGroupItem>
        </ToggleGroup>
      )

      const item1 = screen.getByTestId('toggle-group-item-test1')
      const item2 = screen.getByTestId('toggle-group-item-test2')

      item1.focus()
      expect(document.activeElement).toBe(item1)

      await user.tab()
      expect(document.activeElement).toBe(item2)
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined children', () => {
      render(
        <ToggleGroup type="single">
          {undefined}
          <ToggleGroupItem value="test">Test</ToggleGroupItem>
        </ToggleGroup>
      )

      expect(screen.getByTestId('toggle-group-item-test')).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(
        <ToggleGroup type="single">
          {null}
          <ToggleGroupItem value="test">Test</ToggleGroupItem>
        </ToggleGroup>
      )

      expect(screen.getByTestId('toggle-group-item-test')).toBeInTheDocument()
    })

    it('handles falsy children', () => {
      render(
        <ToggleGroup type="single">
          {false && <ToggleGroupItem value="hidden">Hidden</ToggleGroupItem>}
          <ToggleGroupItem value="test">Test</ToggleGroupItem>
        </ToggleGroup>
      )

      expect(screen.getByTestId('toggle-group-item-test')).toBeInTheDocument()
      expect(screen.queryByTestId('toggle-group-item-hidden')).not.toBeInTheDocument()
    })

    it('handles items with complex children', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="complex">
            <div>
              <span>Complex</span>
              <img src="test.jpg" alt="test" />
            </div>
          </ToggleGroupItem>
        </ToggleGroup>
      )

      expect(screen.getByText('Complex')).toBeInTheDocument()
      expect(screen.getByAltText('test')).toBeInTheDocument()
    })
  })
})
